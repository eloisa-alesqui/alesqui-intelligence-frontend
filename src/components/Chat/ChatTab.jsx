import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExampleQueries from './ExampleQueries';
import { useChat } from '../../hooks/useChat';
import { Bot, Trash2 } from 'lucide-react';

const ChatTab = ({ addNotification }) => {
    const [configuredApis, setConfiguredApis] = useState([]);
    const [loadingApis, setLoadingApis] = useState(true);

    const {
        chatMessages,
        currentMessage,
        isLoading,
        setCurrentMessage,
        handleSendMessage,
        clearChat,
        handleExampleQuery
    } = useChat(addNotification);

    useEffect(() => {
        loadApis();
    }, []);

    const loadApis = async () => {
        try {
            setLoadingApis(true);
            const data = await apiService.getAllApisSimple();
            setConfiguredApis(data);
        } catch (error) {
            console.error('Error loading APIs:', error);
            addNotification('Error loading configured APIs', 'error');
        } finally {
            setLoadingApis(false);
        }
    };

    return (
        <div className="h-full flex gap-4">
            <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
                <div className="border-b p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Bot className="w-5 h-5 mr-2 text-blue-600" />
                                Chat with your APIs
                            </h3>
                            <p className="text-sm text-gray-600">
                                Ask anything about your configured APIs ({configuredApis.length} available)
                            </p>
                        </div>
                        {chatMessages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors"
                                title="Clear chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <ChatMessages
                    chatMessages={chatMessages}
                    configuredApis={configuredApis}
                    isLoading={isLoading}
                />

                <ChatInput
                    currentMessage={currentMessage}
                    setCurrentMessage={setCurrentMessage}
                    onSendMessage={handleSendMessage}
                    configuredApis={configuredApis}
                    isLoading={isLoading}
                />
            </div>

            <div className="w-96 overflow-hidden">
                <ExampleQueries
                    configuredApis={configuredApis}
                    onExampleClick={handleExampleQuery}
                />
            </div>
        </div>
    );
};

export default ChatTab;
