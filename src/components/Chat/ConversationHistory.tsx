import React, { FC } from 'react';
import { Plus, MessageSquare, Loader2, Inbox } from 'lucide-react';
import { ConversationSummary } from '../../services/chatService';
import { formatDistanceToNow } from 'date-fns';

// --- PROPS DEFINITION ---
interface ConversationHistoryProps {
    /** An array of conversation summary objects to display. */
    history: ConversationSummary[];
    /** A boolean flag indicating if the history is currently being fetched. */
    isLoading: boolean;
    /** Callback function to be executed when the "New Chat" button is clicked. */
    onNewChat: () => void;
    /** Callback function to load a specific conversation's details. */
    onLoadConversation: (conversationId: string) => void;
    /** The ID of the currently active conversation, used for highlighting. */
    currentConversationId: string | null;
}

/**
 * A sidebar component that displays a list of past conversations,
 * allows starting a new chat, and handles loading states.
 */
const ConversationHistory: FC<ConversationHistoryProps> = ({
    history,
    isLoading,
    onNewChat,
    onLoadConversation,
    currentConversationId,
}) => {

    return (
        <div className="bg-gray-50 h-full flex flex-col border-r border-gray-200 w-80">
            {/* --- Header and New Chat Button --- */}
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">New Chat</span>
                </button>
            </div>

            {/* --- Conversation List --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading && (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Loading history...</span>
                    </div>
                )}

                {!isLoading && history.length === 0 && (
                    <div className="text-center text-gray-400 px-4 py-8">
                        <Inbox className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm font-medium">No conversations yet</p>
                        <p className="text-xs">Your chat history will appear here.</p>
                    </div>
                )}

                {!isLoading && history.length > 0 && (
                    <ul className="p-2 space-y-1">
                        {history.map((conv) => {
                            const isActive = conv.conversationId === currentConversationId;
                            return (
                                <li key={conv.conversationId}>
                                    <button
                                        onClick={() => onLoadConversation(conv.conversationId)}
                                        title={conv.title}
                                        className={`w-full text-left flex items-start p-3 rounded-md transition-all duration-200 text-sm border-l-4 ${
                                            isActive
                                                ? 'bg-blue-100 text-blue-800 border-blue-600' 
                                                : 'text-gray-700 hover:bg-gray-200 border-transparent hover:border-gray-400'
                                        }`}
                                    >
                                        <MessageSquare className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium truncate">{conv.title}</p>
                                            <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {formatDistanceToNow(new Date(conv.lastUpdated), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConversationHistory;