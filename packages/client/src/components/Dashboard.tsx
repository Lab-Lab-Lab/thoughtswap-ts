/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useEffect, useState } from 'react';
import { BookOpen, LogOut, Zap, RefreshCw, GraduationCap, Users, CloudCog } from 'lucide-react';
import ClassCard from './ClassCard';

interface Course {
    id: string;
    title: string;
    joinCode: string;
    canvasId?: string;
    teacherId?: string;
    students?: any[];
    semester?: string;
    isTeacher: boolean;
    isActive?: boolean;
}

interface DashboardProps {
    userName: string | null;
    userEmail: string | null;
    onSelectCourse: (courseId: string, joinCode: string, isTeacher: boolean) => void;
    onLogout: () => void;
}

export default function Dashboard({
    userName,
    userEmail,
    onSelectCourse,
    onLogout,
}: DashboardProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        }
        try {
            const response = await fetch('/api/courses', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    email: userEmail || '',
                },
            });

            console.log(response);

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            setCourses(data.courses || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load your courses. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userEmail) {
            fetchCourses();
        }
    }, [userEmail]);

    const handleRefresh = () => {
        fetchCourses(true);
    };

    const handleActivateCourse = async (courseId: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    email: userEmail || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to activate course');
            }

            // Update course to show as active
            setCourses((prev) =>
                prev.map((c) => (c.id === courseId ? { ...c, isActive: true } : c))
            );
        } catch (err) {
            console.error('Error activating course:', err);
            setError('Failed to activate course');
        }
    };

    const handleEnterCourse = (courseId: string, joinCode: string) => {
        const course = courses.find((c) => c.id === courseId);
        onSelectCourse(courseId, joinCode, course?.isTeacher || false);
    };

    // Organize courses
    const teachingCourses = courses.filter((c) => c.isTeacher);
    const enrolledCourses = courses.filter((c) => !c.isTeacher);

    // Group courses by semester
    const groupBySemester = (courseList: Course[]) => {
        const grouped: { [key: string]: Course[] } = {};
        courseList.forEach((course) => {
            const semester = course.semester || 'Unknown Semester';
            if (!grouped[semester]) {
                grouped[semester] = [];
            }
            grouped[semester].push(course);
        });
        return grouped;
    };

    const teachingBySemester = groupBySemester(teachingCourses);
    const enrolledBySemester = groupBySemester(enrolledCourses);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Zap className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900">ThoughtSwap</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">{userName}</p>
                            <p className="text-sm text-gray-500">{userEmail}</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            title="Refresh courses"
                        >
                            <RefreshCw
                                className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">My Courses</h2>
                    <p className="text-gray-600">
                        {courses.length === 0
                            ? 'You are not enrolled in any courses yet.'
                            : `You have ${teachingCourses.length} teaching course${teachingCourses.length !== 1 ? 's' : ''} and ${enrolledCourses.length} enrolled course${enrolledCourses.length !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            onClick={handleRefresh}
                            className="text-red-600 hover:text-red-800 font-medium underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-12">
                        {/* Teaching courses skeleton */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <GraduationCap className="h-6 w-6 text-amber-600" />
                                <span>Teaching</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                                    >
                                        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-100 rounded mb-6 w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enrolled courses skeleton */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <Users className="h-6 w-6 text-blue-600" />
                                <span>Enrolled</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                                    >
                                        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-100 rounded mb-6 w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-500 mb-2">No courses found</p>
                        <p className="text-gray-400">
                            Contact your instructor to be added to a course
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Teaching Courses Section */}
                        {teachingCourses.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <GraduationCap className="h-6 w-6 text-amber-600" />
                                    <span>Teaching ({teachingCourses.length})</span>
                                </h3>

                                {Object.entries(teachingBySemester).map(
                                    ([semester, semesterCourses]) => (
                                        <div key={semester} className="mb-8">
                                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 px-1">
                                                {semester}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {semesterCourses.map((course) => (
                                                    <ClassCard
                                                        key={course.id}
                                                        course={course}
                                                        onActivate={handleActivateCourse}
                                                        onEnter={handleEnterCourse}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Enrolled Courses Section */}
                        {enrolledCourses.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <Users className="h-6 w-6 text-blue-600" />
                                    <span>Enrolled ({enrolledCourses.length})</span>
                                </h3>

                                {Object.entries(enrolledBySemester).map(
                                    ([semester, semesterCourses]) => (
                                        <div key={semester} className="mb-8">
                                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 px-1">
                                                {semester}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {semesterCourses.map((course) => (
                                                    <ClassCard
                                                        key={course.id}
                                                        course={course}
                                                        onActivate={handleActivateCourse}
                                                        onEnter={handleEnterCourse}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
