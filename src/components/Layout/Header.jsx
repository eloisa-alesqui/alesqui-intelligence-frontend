import React from 'react';
import { Bot, FileText, Database, MessageCircle } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'setup', label: 'API Configuration', icon: FileText },
        { id: 'apis', label: 'Configured APIs', icon: Database },
        { id: 'chat', label: 'Chat with APIs', icon: MessageCircle }
    ];

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Bot className="h-8 w-8 text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">PostmanGPT</h1>
                    </div>

                    <nav className="flex space-x-8">
                        {navItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4 inline mr-2" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;