/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useState } from 'react';
import { BookOpen, Trash2, X, Plus, Save } from 'lucide-react';

interface SavedPrompt {
    id: string;
    content: string;
    type: 'TEXT' | 'MC' | 'SCALE';
    options?: string[];
}

interface TeacherPromptBankProps {
    isOpen: boolean;
    onClose: () => void;
    savedPrompts: SavedPrompt[];
    onLoad: (prompt: SavedPrompt) => void;
    onDelete: (id: string) => void;
    isIdle?: boolean; // If true, allows creating/saving prompts directly inside bank
    onSaveNew?: (data: {
        content: string;
        type: 'TEXT' | 'MC' | 'SCALE';
        options?: string[];
    }) => void;
}

export default function TeacherPromptBank({
    isOpen,
    onClose,
    savedPrompts,
    onLoad,
    onDelete,
    isIdle,
    onSaveNew,
}: TeacherPromptBankProps) {
    if (!isOpen) return null;

    // Local state for the "Quick Create" form in idle mode
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<'TEXT' | 'MC' | 'SCALE'>('TEXT');
    const [newOptions, setNewOptions] = useState(['', '']);

    const handleSave = () => {
        if (!newContent.trim()) return;
        if (onSaveNew) {
            onSaveNew({
                content: newContent,
                type: newType,
                options: newType === 'MC' ? newOptions.filter((o) => o.trim()) : undefined,
            });
            setNewContent('');
            setNewType('TEXT');
            setNewOptions(['', '']);
        }
    };

    const updateOption = (i: number, val: string) => {
        const opts = [...newOptions];
        opts[i] = val;
        setNewOptions(opts);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> Prompt Bank
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    {/* Quick Create Form (Only when idle) */}
                    {isIdle && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                Create New Prompt
                            </h4>
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setNewType('TEXT')}
                                    className={`px-2 py-1 text-xs rounded font-bold whitespace-nowrap ${newType === 'TEXT' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => setNewType('MC')}
                                    className={`px-2 py-1 text-xs rounded font-bold whitespace-nowrap ${newType === 'MC' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    Multiple Choice
                                </button>
                                <button
                                    onClick={() => setNewType('SCALE')}
                                    className={`px-2 py-1 text-xs rounded font-bold whitespace-nowrap ${newType === 'SCALE' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    Scale
                                </button>
                            </div>
                            <input
                                className="w-full border p-2 rounded mb-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Prompt text..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                            />
                            {newType === 'MC' && (
                                <div className="space-y-1 mb-2">
                                    {newOptions.map((opt, idx) => (
                                        <div key={idx} className="flex gap-1">
                                            <input
                                                className="flex-1 border p-1 rounded text-xs"
                                                placeholder={`Option ${idx + 1}`}
                                                value={opt}
                                                onChange={(e) => updateOption(idx, e.target.value)}
                                            />
                                            {newOptions.length > 2 && (
                                                <button
                                                    onClick={() => {
                                                        const opts = [...newOptions];
                                                        opts.splice(idx, 1);
                                                        setNewOptions(opts);
                                                    }}
                                                    className="text-red-400 px-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {newOptions.length < 6 && (
                                        <button
                                            onClick={() => setNewOptions([...newOptions, ''])}
                                            className="text-xs text-purple-600 font-bold flex items-center mt-1"
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add Option
                                        </button>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 flex items-center justify-center transition"
                            >
                                <Save className="w-4 h-4 mr-1" /> Save to Bank
                            </button>
                        </div>
                    )}

                    {savedPrompts.length === 0 && (
                        <p className="text-gray-400 text-center italic text-sm py-4">
                            Bank is empty.
                        </p>
                    )}

                    {savedPrompts.map((p) => (
                        <div
                            key={p.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition group flex justify-between items-center"
                            onClick={() => {
                                onLoad(p);
                            }}
                        >
                            <div className="flex-1 overflow-hidden mr-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0 ${
                                            p.type === 'MC'
                                                ? 'bg-purple-500'
                                                : p.type === 'SCALE'
                                                  ? 'bg-orange-500'
                                                  : 'bg-blue-500'
                                        }`}
                                    >
                                        {p.type}
                                    </span>
                                    <p className="text-gray-800 text-sm font-medium truncate">
                                        {p.content}
                                    </p>
                                </div>
                                {p.type === 'MC' && (
                                    <p className="text-xs text-gray-500 pl-1">
                                        {p.options?.length} Options
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-indigo-600 hidden group-hover:inline-block font-bold">
                                    Load
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete?')) onDelete(p.id);
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
