import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';

const ChatInput = ({
    currentMessage,
    setCurrentMessage,
    onSendMessage,
    configuredApis,
    isLoading,
    includeReasoning,
    onReasoningChange
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isLoading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentMessage.trim() && !isLoading && configuredApis.length > 0) {
            onSendMessage(configuredApis);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const isDisabled = configuredApis.length === 0 || isLoading;
    const placeholder = configuredApis.length > 0
        ? "Ask about your APIs... (Press Enter to send)"
        : "Configure APIs first to start chatting";

    return (
        <div className="border-t p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={isDisabled}
                        rows={1}
                        className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                    />

                    {currentMessage.length > 100 && (
                        <div className="absolute bottom-1 right-14 text-xs text-gray-400">
                            {currentMessage.length}/500
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isDisabled || !currentMessage.trim()}
                    className="flex-shrink-0 px-4 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
                    title={isDisabled ? "Configure APIs first" : "Send message"}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : <Send className="w-4 h-4" />}

                </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
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
                <span>
                    {configuredApis.length > 0
                        ? `${configuredApis.length} API${configuredApis.length !== 1 ? 's' : ''} available`
                        : "No APIs configured"
                    }
                </span>
                <span className="hidden sm:block">
                    Press Enter to send • Shift+Enter for new line
                </span>
            </div>
        </div>
    );
};

export default ChatInput;
