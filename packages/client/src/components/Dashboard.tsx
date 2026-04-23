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
import {
    BookOpen,
    LogOut,
    Zap,
    RefreshCw,
    GraduationCap,
    Users,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
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
    const [openSemesters, setOpenSemesters] = useState<{ [key: string]: boolean }>({});

    // Helper to extract term data for sorting (assuming formats like "Fall 2026", "Spring 2026")
    const getSemesterValue = (semester: string) => {
        if (!semester || semester === 'Unknown Semester' || semester === 'Unknown') return 0;

        const terms: Record<string, number> = {
            Spring: 1,
            Summer: 2,
            Fall: 3,
            Winter: 4,
        };

        const parts = semester.split(' ');
        if (parts.length >= 2) {
            const season = parts[0];
            const year = parseInt(parts[parts.length - 1], 10);

            if (!isNaN(year) && terms[season]) {
                // Return a number that can be sorted: YYYY.T (e.g., 2026.3 for Fall 2026)
                return year + terms[season] / 10;
            }
        }
        return 1; // Default low value for unrecognized formats
    };

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

            // Automatically open the most recent semester
            if (data.courses && data.courses.length > 0) {
                const uniqueSemesters = Array.from(
                    new Set(data.courses.map((c: Course) => c.semester || 'Unknown Semester'))
                );
                uniqueSemesters.sort(
                    (a, b) => getSemesterValue(String(b)) - getSemesterValue(String(a))
                );

                if (uniqueSemesters.length > 0) {
                    const latestSemester = String(uniqueSemesters[0]);
                    setOpenSemesters({ [latestSemester]: true });
                }
            }
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

    // Get sorted semester keys (newest first)
    const sortedSemesters = Array.from(
        new Set([...Object.keys(teachingBySemester), ...Object.keys(enrolledBySemester)])
    ).sort((a, b) => getSemesterValue(b) - getSemesterValue(a));

    const toggleSemester = (semester: string) => {
        setOpenSemesters((prev) => ({
            ...prev,
            [semester]: !prev[semester],
        }));
    };

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
                        {sortedSemesters.map((semester) => {
                            const tCourses = teachingBySemester[semester] || [];
                            const eCourses = enrolledBySemester[semester] || [];
                            const isOpen = !!openSemesters[semester];

                            return (
                                <div
                                    key={semester}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleSemester(semester)}
                                        className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition border-b border-gray-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {semester}
                                            </h3>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                {tCourses.length + eCourses.length} Courses
                                            </span>
                                        </div>
                                        {isOpen ? (
                                            <ChevronUp className="w-6 h-6 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-gray-500" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="p-6 space-y-8">
                                            {/* Teaching Courses */}
                                            {tCourses.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                                        <GraduationCap className="h-5 w-5 text-amber-600" />
                                                        <span>Teaching ({tCourses.length})</span>
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {tCourses.map((course) => (
                                                            <ClassCard
                                                                key={course.id}
                                                                course={course}
                                                                onActivate={handleActivateCourse}
                                                                onEnter={handleEnterCourse}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Enrolled Courses */}
                                            {eCourses.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                                        <Users className="h-5 w-5 text-blue-600" />
                                                        <span>Enrolled ({eCourses.length})</span>
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {eCourses.map((course) => (
                                                            <ClassCard
                                                                key={course.id}
                                                                course={course}
                                                                onActivate={handleActivateCourse}
                                                                onEnter={handleEnterCourse}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
