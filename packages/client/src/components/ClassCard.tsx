/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { BookOpen, Users, Lock } from 'lucide-react';

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

interface ClassCardProps {
    course: Course;
    onActivate?: (courseId: string) => void;
    onEnter: (courseId: string, joinCode: string) => void;
}

export default function ClassCard({ course, onActivate, onEnter }: ClassCardProps) {
    const participantCount = course.students?.length || 0;
    const isActiveSession = course.isActive;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <BookOpen className="w-6 h-6 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold">{course.title}</h3>
                            <p className="text-indigo-100 text-sm">Code: {course.joinCode}</p>
                            {course.semester && (
                                <p className="text-indigo-200 text-xs">{course.semester}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {course.isTeacher && (
                            <div className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-xs font-semibold">
                                Teacher
                            </div>
                        )}
                        {isActiveSession && (
                            <div className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
                                Active
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{participantCount} students</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {course.isTeacher && (
                        <>
                            {!isActiveSession ? (
                                <button
                                    onClick={() => onActivate?.(course.id)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Activate Class
                                </button>
                            ) : (
                                <button
                                    onClick={() => onEnter(course.id, course.joinCode)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Resume Class
                                </button>
                            )}
                        </>
                    )}
                    {!course.isTeacher && (
                        <button
                            onClick={() => onEnter(course.id, course.joinCode)}
                            disabled={!isActiveSession}
                            className={`w-full font-semibold py-2 px-4 rounded-lg transition ${
                                isActiveSession
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isActiveSession ? 'Join Class' : 'Waiting for Teacher...'}
                        </button>
                    )}
                </div>

                {!course.isTeacher && !isActiveSession && (
                    <div className="mt-3 flex items-start space-x-2 text-xs text-gray-500">
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>This class starts when the teacher activates it.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
