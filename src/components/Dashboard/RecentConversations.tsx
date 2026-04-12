import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { chatService, ConversationSummary } from '../../services/chatService';

const RecentConversations: React.FC = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        chatService.getConversationHistory()
            .then(data => setConversations(data.slice(0, 5)))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Recent Conversations</h2>
                </div>
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 transition-all duration-200"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            ) : conversations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No conversations yet</p>
            ) : (
                <ul className="rounded-xl overflow-hidden border border-gray-100">
                    {conversations.map((conv, index) => (
                        <li key={conv.conversationId} className={index % 2 !== 0 ? 'bg-gray-50/70' : 'bg-white'}>
                            <button
                                onClick={() => navigate('/chat', { state: { conversationId: conv.conversationId } })}
                                className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50/60 transition-colors group"
                            >
                                <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm text-gray-800 font-medium truncate group-hover:text-blue-600 transition-colors flex-1">
                                    {conv.title}
                                </span>
                                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                    {formatDistanceToNow(new Date(conv.lastUpdated), { addSuffix: true })}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecentConversations;
