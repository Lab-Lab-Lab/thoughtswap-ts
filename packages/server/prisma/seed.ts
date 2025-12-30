import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const devTeacher = await prisma.user.upsert({
        where: { email: 'teacher@dev.com' },
        update: {},
        create: {
            email: 'teacher@dev.com',
            name: 'Dev Teacher',
            canvasId: 'dev-teacher-001',
            role: 'TEACHER',
            accessToken: 'mock-token',
        },
    });
    console.log({ devTeacher });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
