import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './auth.router.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.use('/accounts/canvas/login', authRouter);

function shuffleThoughts(thoughts: any[], authors: string[]) {
    let pool = [...thoughts];
    const assignments: Record<string, string> = {};

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    authors.forEach((authorId, index) => {
        const thought = pool[index % pool.length];
        assignments[authorId] = thought.content;
    });

    return assignments;
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // We expect the client to send { email, name, role } in the auth handshake
    const { email, name, role } = socket.handshake.auth;

    // Helper: Find the DB user based on the socket auth
    const getDbUser = async () => {
        if (!email) return null;
        return await prisma.user.findUnique({ where: { email } });
    };

    if (!email) {
        console.log("No email provided in handshake, connection might be unstable for DB ops.");
    }

    socket.on('JOIN_ROOM', async ({ joinCode }: { joinCode: string }) => {
        const normalizedCode = joinCode.toUpperCase();

        // Find the course
        const course = await prisma.course.findUnique({
            where: { joinCode: normalizedCode }
        });

        if (!course) {
            socket.emit('ERROR', { message: "Invalid Room Code" });
            return;
        }

        // Join the socket room
        socket.join(normalizedCode);
        console.log(`${name} (${role}) joined room ${normalizedCode}`);
        socket.emit('JOIN_SUCCESS', { joinCode: normalizedCode, courseTitle: course.title });

        // If Teacher, ensure an ACTIVE session exists
        if (role === 'TEACHER') {
            let session = await prisma.session.findFirst({
                where: { courseId: course.id, status: 'ACTIVE' }
            });
            if (!session) {
                session = await prisma.session.create({
                    data: { courseId: course.id, status: 'ACTIVE' }
                });
                console.log(`Created new session ${session.id} for course ${course.id}`);
            }
        }
    });

    socket.on('TEACHER_SEND_PROMPT', async ({ joinCode, content }) => {
        // Validation: Ensure sender is teacher
        if (role !== 'TEACHER') return;

        const course = await prisma.course.findUnique({ where: { joinCode } });
        if (!course) return;

        // Get active session
        const session = await prisma.session.findFirst({
            where: { courseId: course.id, status: 'ACTIVE' }
        });
        if (!session) return;

        // Create PromptUse in DB
        const promptUse = await prisma.promptUse.create({
            data: {
                content,
                sessionId: session.id
            }
        });

        // Broadcast to room
        io.to(joinCode).emit('NEW_PROMPT', {
            content,
            promptUseId: promptUse.id
        });
        console.log(`Prompt sent to ${joinCode}: ${content}`);
    });

    socket.on('SUBMIT_THOUGHT', async (data) => {
        const { joinCode, content, promptUseId } = data;
        const user = await getDbUser();

        if (!user) {
            console.error("Cannot save thought: User not found in DB");
            return;
        }

        // If promptUseId isn't provided by client, try to find the latest one (Logic omitted for brevity)
        // For now, we assume the client sends the ID they received in NEW_PROMPT
        if (promptUseId) {
            await prisma.thought.create({
                data: {
                    content,
                    authorId: user.id,
                    promptUseId: promptUseId
                }
            });
            console.log(`Thought received from ${user.name}`);

            // Notify teacher (Optimization: throttle this in prod)
            // io.to(joinCode).emit('UPDATE_COUNTS', ...); 
        }
    });

    socket.on('TRIGGER_SWAP', async ({ joinCode }) => {
        if (role !== 'TEACHER') return;

        const course = await prisma.course.findUnique({ where: { joinCode } });
        if (!course) return;

        // Get session
        const session = await prisma.session.findFirst({
            where: { courseId: course.id, status: 'ACTIVE' }
        });
        if (!session) return;

        // Get latest PromptUse
        const promptUse = await prisma.promptUse.findFirst({
            where: { sessionId: session.id },
            orderBy: { id: 'desc' } // Assuming UUIDs sort roughly by time or use created_at if added
        });
        if (!promptUse) return;

        // Fetch all thoughts
        const thoughts = await prisma.thought.findMany({
            where: { promptUseId: promptUse.id }
        });

        if (thoughts.length < 2) {
            socket.emit('ERROR', { message: "Not enough thoughts to swap!" });
            return;
        }

        // Find all students currently in the room
        // In Socket.io, we can get sockets in the room
        const sockets = await io.in(joinCode).fetchSockets();
        const studentSockets = sockets.filter(s => s.handshake.auth.role === 'STUDENT');

        // Map SocketID -> DB User ID (Naive: assume we can map via auth email or similar)
        // For this MVP, we will shuffle purely based on the connected sockets 
        // and distribute the content we have.

        // 1. Extract contents
        const thoughtContents = thoughts.map(t => ({ content: t.content, authorId: t.authorId }));

        // 2. Shuffle
        // We need a list of "Author IDs" to assign TO.
        // For MVP, let's just assign to the active sockets.
        const assignments = shuffleThoughts(
            thoughtContents,
            studentSockets.map(s => s.id) // Using socket ID as the temporary key for distribution
        );

        // 3. Distribute
        studentSockets.forEach(s => {
            const assignedContent = assignments[s.id];
            if (assignedContent) {
                io.to(s.id).emit('RECEIVE_SWAP', { content: assignedContent });
            }
        });

        console.log(`Swapped ${thoughts.length} thoughts among ${studentSockets.length} students.`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});