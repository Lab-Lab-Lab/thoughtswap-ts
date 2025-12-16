interface StudentResponseInputProps {
    promptType: 'TEXT' | 'MC' | 'SCALE';
    promptOptions: string[];
    responseInput: string;
    setResponseInput: (val: string) => void;
    disabled?: boolean;
}

export default function StudentResponseInput({
    promptType, promptOptions, responseInput, setResponseInput, disabled
}: StudentResponseInputProps) {

    if (promptType === 'MC') {
        return (
            <div className="space-y-3">
                {promptOptions.map((opt, idx) => (
                    <label key={idx} className={`flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer transition ${responseInput === opt ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input
                            type="radio"
                            name="mc_option"
                            value={opt}
                            checked={responseInput === opt}
                            onChange={(e) => !disabled && setResponseInput(e.target.value)}
                            disabled={disabled}
                            className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium text-sm sm:text-base">{opt}</span>
                    </label>
                ))}
            </div>
        );
    }

    if (promptType === 'SCALE') {
        return (
            <div className="space-y-6 py-4">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 font-medium px-1">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                </div>
                <div className="flex justify-between gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            onClick={() => !disabled && setResponseInput(val.toString())}
                            disabled={disabled}
                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full font-bold text-base sm:text-lg flex items-center justify-center transition shadow-sm ${responseInput === val.toString()
                                    ? 'bg-orange-500 text-white transform scale-110 shadow-md ring-2 ring-orange-200'
                                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300'
                                }`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
                <div className="text-center h-6">
                    {responseInput && <span className="text-orange-600 font-bold text-sm sm:text-base">Selected: {responseInput}</span>}
                </div>
            </div>
        );
    }

    return (
        <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Write your thought here..."
            rows={6}
            maxLength={500}
            disabled={disabled}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base disabled:bg-gray-100 disabled:text-gray-500"
        />
    );
}