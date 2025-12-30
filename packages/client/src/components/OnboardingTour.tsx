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
import { X, ArrowRight, Check } from 'lucide-react';

interface Step {
    title: string;
    content: string;
    target?: string; // CSS selector for highlighting element (optional enhancement)
}

const TEACHER_STEPS: Step[] = [
    {
        title: 'Welcome to ThoughtSwap!',
        content:
            "ThoughtSwap helps you facilitate anonymous peer review discussions. Let's take a quick tour.",
    },
    {
        title: 'Create Prompts',
        content: 'Use the Prompt Composer to create Text, Multiple Choice, or Scale questions.',
    },
    {
        title: 'Prompt Bank',
        content: 'Save your favorite prompts to the Bank for quick access in future classes.',
    },
    {
        title: 'Launch & Swap',
        content:
            "Start a class, wait for students to submit, then click 'Swap Thoughts' to distribute anonymous responses for discussion.",
    },
    {
        title: 'Review Distributions',
        content:
            'You can see exactly who received what thought and manually reassign them if needed.',
    },
];

const STUDENT_STEPS: Step[] = [
    {
        title: 'Welcome to ThoughtSwap!',
        content: "You'll be participating in anonymous peer reviews.",
    },
    {
        title: 'Anonymity',
        content: 'Your responses are anonymous to your peers, encouraging honest sharing.',
    },
    {
        title: 'The Swap',
        content: "After submitting, you'll receive a random peer's thought to discuss or review.",
    },
];

interface OnboardingTourProps {
    role: 'TEACHER' | 'STUDENT';
    onComplete: () => void;
}

export default function OnboardingTour({ role, onComplete }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = role === 'TEACHER' ? TEACHER_STEPS : STUDENT_STEPS;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] px-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start mb-6 mt-2">
                    <h3 className="text-2xl font-bold text-gray-800">{steps[currentStep].title}</h3>
                    <button onClick={onComplete} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {steps[currentStep].content}
                </p>

                <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep === steps.length - 1 ? (
                            <Check className="w-5 h-5 ml-2" />
                        ) : (
                            <ArrowRight className="w-5 h-5 ml-2" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
