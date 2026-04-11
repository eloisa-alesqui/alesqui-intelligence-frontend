import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { LastConversationInfo } from '../../types';

interface Props {
    lastConversation: LastConversationInfo | null;
}

// Provides shortcut buttons for the most common user actions on the dashboard.
// "New Conversation" is always visible and starts a fresh chat session.
// "Continue Last" is only rendered when a previous conversation exists;
// it navigates to /chat and passes the conversation ID via router state so
// the chat page can restore it.
const QuickActions: React.FC<Props> = ({ lastConversation }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Quick actions</h2>
            <div className="flex flex-wrap gap-3">
                {/* Primary action: always available */}
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Conversation
                </button>
                {/* Secondary action: only shown when there is a conversation to resume */}
                {lastConversation && (
                    <button
                        onClick={() =>
                            navigate('/chat', { state: { conversationId: lastConversation.conversationId } })
                        }
                        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        Continue Last
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuickActions;
