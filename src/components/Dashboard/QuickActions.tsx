import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Zap } from 'lucide-react';
import { LastConversationInfo } from '../../types';

interface Props {
    lastConversation: LastConversationInfo | null;
}

const QuickActions: React.FC<Props> = ({ lastConversation }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                    <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Quick actions</h2>
            </div>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    New Conversation
                </button>
                {lastConversation && (
                    <button
                        onClick={() =>
                            navigate('/chat', { state: { conversationId: lastConversation.conversationId } })
                        }
                        className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-sm transition-all duration-200"
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
