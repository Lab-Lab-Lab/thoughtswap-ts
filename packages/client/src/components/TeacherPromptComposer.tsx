import { Send, BookOpen, AlignLeft, List, BarChart2, Plus, X, Save, CheckCircle, RefreshCw } from 'lucide-react';

interface TeacherPromptComposerProps {
    promptInput: string;
    setPromptInput: (val: string) => void;
    promptType: 'TEXT' | 'MC' | 'SCALE';
    setPromptType: (val: 'TEXT' | 'MC' | 'SCALE') => void;
    mcOptions: string[];
    setMcOptions: (opts: string[]) => void;
    promptSent: boolean;
    onSend: () => void;
    onSave: () => void;
    onOpenBank: () => void;
    onReset: () => void;
}

export default function TeacherPromptComposer({
    promptInput, setPromptInput,
    promptType, setPromptType,
    mcOptions, setMcOptions,
    promptSent,
    onSend, onSave, onOpenBank, onReset
}: TeacherPromptComposerProps) {

    const addMcOption = () => setMcOptions([...mcOptions, '']);
    const removeMcOption = (idx: number) => {
        const newOpts = [...mcOptions];
        newOpts.splice(idx, 1);
        setMcOptions(newOpts);
    };
    const updateMcOption = (idx: number, val: string) => {
        const newOpts = [...mcOptions];
        newOpts[idx] = val;
        setMcOptions(newOpts);
    };

    return (
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border-t-4 transition-all ${promptSent ? 'bg-gray-50 border-gray-300' : 'bg-white border-indigo-500'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                    <Send className={`w-5 h-5 mr-2 ${promptSent ? 'text-gray-400' : 'text-indigo-500'}`} />
                    Step 1: Create Prompt
                </h3>
                {!promptSent && (
                    <button onClick={onOpenBank} className="text-sm text-indigo-600 font-semibold flex items-center hover:underline self-end sm:self-auto">
                        <BookOpen className="w-4 h-4 mr-1" /> Open Bank
                    </button>
                )}
            </div>

            {/* Type Selector */}
            {!promptSent && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setPromptType('TEXT')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition ${promptType === 'TEXT' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <AlignLeft className="w-4 h-4 mr-1.5" /> Text
                    </button>
                    <button
                        onClick={() => setPromptType('MC')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition ${promptType === 'MC' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <List className="w-4 h-4 mr-1.5" /> Multiple Choice
                    </button>
                    <button
                        onClick={() => setPromptType('SCALE')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition ${promptType === 'SCALE' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <BarChart2 className="w-4 h-4 mr-1.5" /> 1-5 Scale
                    </button>
                </div>
            )}

            <div className="space-y-3">
                <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100 text-sm sm:text-base"
                    disabled={promptSent}
                />

                {/* Multiple Choice Options */}
                {!promptSent && promptType === 'MC' && (
                    <div className="pl-0 sm:pl-4 sm:border-l-2 border-purple-200 space-y-2">
                        <p className="text-xs font-bold text-purple-500 uppercase">Answer Options</p>
                        {mcOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs text-gray-400 font-mono flex-shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateMcOption(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-purple-400"
                                />
                                {mcOptions.length > 2 && (
                                    <button onClick={() => removeMcOption(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {mcOptions.length < 6 && (
                            <button onClick={addMcOption} className="text-xs flex items-center text-purple-600 hover:underline font-medium mt-1 p-1">
                                <Plus className="w-3 h-3 mr-1" /> Add Option
                            </button>
                        )}
                    </div>
                )}

                {/* Scale Preview */}
                {!promptSent && promptType === 'SCALE' && (
                    <div className="pl-0 sm:pl-4 sm:border-l-2 border-orange-200">
                        <p className="text-xs font-bold text-orange-500 uppercase mb-2">Student View Preview</p>
                        <div className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-2">
                            <span>1 (Disagree)</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white text-xs">{n}</div>
                                ))}
                            </div>
                            <span>5 (Agree)</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {!promptSent && (
                        <button
                            onClick={onSave}
                            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg border border-gray-300 flex items-center justify-center transition"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save
                        </button>
                    )}
                    <button
                        onClick={onSend}
                        disabled={promptSent || !promptInput}
                        className={`w-full sm:flex-1 px-6 py-3 font-bold rounded-lg transition flex items-center justify-center ${promptSent
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            }`}
                    >
                        {promptSent ? 'Sent' : 'Broadcast'}
                    </button>
                </div>
            </div>

            {promptSent && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm border-t pt-3 gap-2">
                    <p className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Prompt is live.
                    </p>
                    <button
                        onClick={onReset}
                        className="text-indigo-600 hover:underline flex items-center font-medium"
                    >
                        <RefreshCw className="w-3 h-3 mr-1" /> New Prompt
                    </button>
                </div>
            )}
        </div>
    );
}