/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const router = Router();

const REQUIRED_SCOPES = [
    'url:GET|/api/v1/accounts/:account_id/terms',
    'url:GET|/api/v1/accounts/:account_id/terms/:id',
    'url:GET|/api/v1/courses/:course_id/enrollments',
    'url:GET|/api/v1/sections/:section_id/enrollments',
    'url:GET|/api/v1/users/:user_id/enrollments',
    'url:GET|/api/v1/courses/:course_id/sections',
    'url:GET|/api/v1/users/:user_id/profile',
].join(' ');

// Configuration Constants from .env
const {
    FRONTEND_URL,
    CANVAS_CLIENT_ID,
    CANVAS_CLIENT_SECRET,
    CANVAS_BASE_URL,
    CANVAS_REDIRECT_URI,
} = process.env;

if (!CANVAS_CLIENT_ID || !CANVAS_CLIENT_SECRET || !CANVAS_BASE_URL || !CANVAS_REDIRECT_URI) {
    throw new Error('Missing one or more Canvas OAuth environment variables.');
}

// Type definitions
interface CanvasEnrollment {
    id: number;
    user_id: number;
    course_id: number;
    type: string;
    role: string;
    enrollment_state: string;
}

interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    created_at: string;
}

const fetchUserCourses = async (userId: string, accessToken: string): Promise<CanvasCourse[]> => {
    try {
        const coursesResponse = await axios.get(`${CANVAS_BASE_URL}/api/v1/courses`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return coursesResponse.data || [];
    } catch (error) {
        console.error('Error fetching Canvas courses:', error);
        return [];
    }
};

const fetchUserEnrollments = async (
    userId: string,
    accessToken: string
): Promise<CanvasEnrollment[]> => {
    try {
        const enrollmentsResponse = await axios.get(
            `${CANVAS_BASE_URL}/api/v1/users/${userId}/enrollments`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        return enrollmentsResponse.data || [];
    } catch (error) {
        console.error('Error fetching Canvas enrollments:', error);
        return [];
    }
};

router.get('/', (req: Request, res: Response) => {
    const state = 'random_state_string';

    const authUrl =
        `${CANVAS_BASE_URL}/login/oauth2/auth?` +
        `client_id=${CANVAS_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${CANVAS_REDIRECT_URI}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(REQUIRED_SCOPES)}`;

    console.log('Redirecting to Canvas Auth URL:', authUrl);
    res.redirect(authUrl);
});

router.get('/callback', async (req: Request, res: Response) => {
    console.log(req.query);
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error) {
        console.error('Canvas OAuth Error:', error);
        return res.redirect(`${FRONTEND_URL}/?error=auth_denied`);
    }

    if (!code) {
        console.error('Missing authorization code.');
        return res.redirect(`${FRONTEND_URL}/?error=no_code`);
    }

    try {
        // Step 1: Exchange the code for the Access Token
        const tokenResponse = await axios.post(
            `${CANVAS_BASE_URL}/login/oauth2/token`,
            {
                grant_type: 'authorization_code',
                client_id: CANVAS_CLIENT_ID,
                client_secret: CANVAS_CLIENT_SECRET,
                redirect_uri: CANVAS_REDIRECT_URI,
                code: code,
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        const { access_token, refresh_token, user } = tokenResponse.data;

        // Step 2: Get User Profile
        const profileResponse = await axios.get(`${CANVAS_BASE_URL}/api/v1/users/self/profile`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const canvasProfile = profileResponse.data;
        const userEmail = canvasProfile.primary_email;

        if (!user || !userEmail) {
            throw new Error('Missing primary email or user ID from Canvas profile.');
        }

        // Step 3: Upsert User into PostgreSQL (without role field)
        const localUser = await prisma.user.upsert({
            where: { canvasId: String(user.id) },
            update: {
                name: user.name,
                email: userEmail,
                accessToken: access_token,
                refreshToken: refresh_token,
            },
            create: {
                canvasId: String(user.id),
                name: user.name,
                email: userEmail,
                accessToken: access_token,
                refreshToken: refresh_token,
            },
        });

        // Step 4: Fetch user enrollments and courses to sync enrollments
        const enrollments = await fetchUserEnrollments(String(user.id), access_token);
        const courses = await fetchUserCourses(String(user.id), access_token);

        // Step 5: Sync enrollments - create or update Course records and link them
        for (const course of courses) {
            // Determine if user is a teacher in this course
            const studentEnrollments = enrollments.filter(
                (e: CanvasEnrollment) => e.course_id === course.id && e.type === 'StudentEnrollment'
            );
            const teacherEnrollments = enrollments.filter(
                (e: CanvasEnrollment) => e.course_id === course.id && e.type === 'TeacherEnrollment'
            );
            const isTeacher = teacherEnrollments.length > 0;

            // Upsert course (linked by Canvas course ID)
            const courseRecord = await prisma.course.upsert({
                where: { canvasId: String(course.id) },
                update: {
                    title: course.name,
                },
                create: {
                    canvasId: String(course.id),
                    title: course.name,
                    joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    teacherId: isTeacher ? localUser.id : localUser.id, // Teachers will be properly assigned
                },
            });

            // Add user to appropriate enrollment lists
            if (isTeacher) {
                // If user is a teacher, update course teacher (only one teacher per course model)
                await prisma.course.update({
                    where: { id: courseRecord.id },
                    data: { teacherId: localUser.id },
                });
            } else if (studentEnrollments.length > 0) {
                // Add to students list
                await prisma.course.update({
                    where: { id: courseRecord.id },
                    data: {
                        students: {
                            connect: { id: localUser.id },
                        },
                    },
                });
            }
        }

        // Final Redirect back to the frontend
        const frontendRedirect = `${FRONTEND_URL}/auth/success?name=${encodeURIComponent(localUser.name)}&email=${encodeURIComponent(localUser.email)}`;

        return res.redirect(frontendRedirect);
    } catch (error) {
        console.error('OAuth token exchange failed:', (error as any).message);
        return res.status(500).send('Authentication failed');
    }
});

export { router as authRouter };
