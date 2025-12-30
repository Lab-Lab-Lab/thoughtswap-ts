/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Shuffle, ArrowRight, RefreshCw } from 'lucide-react';
import { socket } from '../socket';

interface DistributionItem {
    studentName: string;
    thoughtContent: string;
    originalAuthorName: string;
}

interface TeacherDistributionGraphProps {
    distribution: Record<string, DistributionItem>;
    joinCode?: string; // Need joinCode to emit reassign event
}

export default function TeacherDistributionGraph({
    distribution,
    joinCode,
}: TeacherDistributionGraphProps) {
    if (Object.keys(distribution).length === 0) return null;

    const handleReassign = (socketId: string) => {
        if (joinCode) {
            socket.emit('TEACHER_REASSIGN_DISTRIBUTION', { joinCode, studentSocketId: socketId });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-purple-500 p-4 sm:p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                    <Shuffle className="w-5 h-5 mr-2 text-purple-600" />
                    Distribution Graph
                </h3>
            </div>
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg overflow-x-auto border border-gray-100">
                <table className="w-full text-sm text-left min-w-[500px]">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-2 w-1/4">Author</th>
                            <th className="px-4 py-2 text-center w-10"></th>
                            <th className="px-4 py-2 w-1/4">Recipient</th>
                            <th className="px-4 py-2 w-1/2">Content Preview</th>
                            <th className="px-4 py-2 w-10">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(distribution).map(([socketId, data]) => (
                            <tr
                                key={socketId}
                                className="border-b border-gray-100 hover:bg-white transition"
                            >
                                <td className="px-4 py-3 font-medium text-gray-700">
                                    {data.originalAuthorName}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-400">
                                    <ArrowRight className="w-4 h-4 mx-auto" />
                                </td>
                                <td className="px-4 py-3 font-medium text-indigo-600">
                                    {data.studentName}
                                </td>
                                <td className="px-4 py-3 text-gray-500 italic truncate max-w-xs">
                                    {data.thoughtContent}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleReassign(socketId)}
                                        title="Reassign Thought"
                                        className="text-gray-400 hover:text-purple-600 transition p-1 rounded hover:bg-purple-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
