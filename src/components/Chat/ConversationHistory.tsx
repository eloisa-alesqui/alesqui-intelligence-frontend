import React, { FC, useState } from 'react';
import { Plus, MessageSquare, Loader2, Inbox, Trash2 } from 'lucide-react';
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
    /** Callback for the deletion  */
    onDeleteConversation: (conversationId: string) => void;
    /** The ID of the currently active conversation, used for highlighting. */
    currentConversationId: string | null;
}


const DeleteConfirmationDialog: FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold text-gray-800">Delete Conversation</h3>
                <p className="text-sm text-gray-600 my-4">Are you sure you want to delete this conversation? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * A sidebar component that displays a list of past conversations,
 * allows starting a new chat, and handles loading states.
 */
const ConversationHistory: FC<ConversationHistoryProps> = ({
    history,
    isLoading,
    onNewChat,
    onLoadConversation,
    onDeleteConversation,
    currentConversationId,
}) => {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

    const openConfirmationDialog = (conversationId: string) => {
        setConversationToDelete(conversationId);
        setIsDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (conversationToDelete) {
            onDeleteConversation(conversationToDelete);
        }
        setIsDialogOpen(false);
        setConversationToDelete(null);
    };

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
                                <li key={conv.conversationId} className="group relative">
                                    <button
                                        onClick={() => onLoadConversation(conv.conversationId)}
                                        title={conv.title}
                                        className={`w-full text-left flex items-start p-3 rounded-md transition-all duration-200 text-sm border-l-4 ${isActive
                                            ? 'bg-blue-100 text-blue-800 border-blue-600'
                                            : 'text-gray-700 group-hover:bg-gray-200 border-transparent group-hover:border-gray-400'
                                            }`}
                                    >
                                        <MessageSquare className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div className="flex-1 overflow-hidden pr-8">
                                            <p className="font-medium truncate">{conv.title}</p>
                                            <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {formatDistanceToNow(new Date(conv.lastUpdated), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents the conversation from loading when the button is clicked
                                            openConfirmationDialog(conv.conversationId);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <DeleteConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />

        </div>
    );
};

export default ConversationHistory;