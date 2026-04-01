import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';
import { ApiDocument } from '../../types';

// Define the types for the component's props
interface ChatInputProps {
    currentMessage: string;
    setCurrentMessage: (message: string) => void;
    onSendMessage: (apis: ApiDocument[]) => void;
    configuredApis: ApiDocument[];
    isLoading: boolean;
    includeReasoning: boolean;
    onReasoningChange: (include: boolean) => void;
    hasTechnicalAccess: boolean; // Prop to determine if the user has technical access (IT, SUPERADMIN, or TRIAL role)
}

const ChatInput: React.FC<ChatInputProps> = ({
    currentMessage,
    setCurrentMessage,
    onSendMessage,
    configuredApis,
    isLoading,
    includeReasoning,
    onReasoningChange,
    hasTechnicalAccess,
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isLoading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (currentMessage.trim() && !isLoading && configuredApis.length > 0) {
            onSendMessage(configuredApis);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any); // handleSubmit expects a form event, but this works
        }
    };

    const isDisabled = configuredApis.length === 0 || isLoading;
    const placeholder = hasTechnicalAccess
        ? (configuredApis.length > 0 ? "Ask about your APIs..." : "No APIs configured")
        : (configuredApis.length > 0 ? "Ask about your data..." : "No data sources available");


    return (
        <div className="border-t p-2 sm:p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={isDisabled}
                        rows={1}
                        className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed resize-none text-sm sm:text-base"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isDisabled || !currentMessage.trim()}
                    className="flex-shrink-0 p-3 sm:px-4 sm:py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 bg-blue-600 hover:bg-blue-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={isDisabled ? (hasTechnicalAccess ? "Configure APIs first" : "Data not available") : "Send message"}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" />
                    ) : <Send className="w-5 h-5 sm:w-4 sm:h-4" />}
                </button>
            </form>

            <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center justify-between gap-y-1 text-xs text-gray-500">
                {/* Conditionally render the reasoning checkbox only for users with technical access */}
                {hasTechnicalAccess ? (
                    <label 
                        htmlFor="includeReasoning" 
                        className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                        title="Include a step-by-step breakdown of how the answer was generated"
                    >
                        <input
                            id="includeReasoning"
                            type="checkbox"
                            checked={includeReasoning}
                            onChange={(e) => onReasoningChange(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Include step-by-step reasoning</span>
                    </label>
                ) : <div />} {/* Empty div to maintain layout */}
                
                <span>
                    {configuredApis.length > 0
                        ? `${configuredApis.length} source${configuredApis.length !== 1 ? 's' : ''} available`
                        : (hasTechnicalAccess ? "No APIs configured" : "No data sources available")}
                </span>
                <span className="hidden sm:block">
                    Press Enter to send • Shift+Enter for new line
                </span>
            </div>
        </div>
    );
};

export default ChatInput;