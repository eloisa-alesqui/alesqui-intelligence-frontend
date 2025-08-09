import React from 'react';
import { MessageSquare, Zap, Database, Code, TrendingUp } from 'lucide-react';

const ExampleQueries = ({ configuredApis, onExampleClick }) => {
    if (configuredApis.length === 0) return null;

    const exampleQueries = [
        {
            category: "General Information",
            icon: Database,
            color: "bg-blue-50 text-blue-700 border-blue-200",
            queries: [
                "What endpoints are available in my APIs?",
                "Show me all configured APIs and their descriptions",
                "What authentication methods do my APIs use?"
            ]
        },
        {
            category: "API Usage",
            icon: Code,
            color: "bg-green-50 text-green-700 border-green-200",
            queries: [
                "How can I get information about a specific user?",
                "What parameters does the search endpoint accept?",
                "Show me example requests for the products API"
            ]
        },
        {
            category: "Data Queries",
            icon: TrendingUp,  
            color: "bg-purple-50 text-purple-700 border-purple-200",
            queries: [
                "What was the total number of sales last quarter?",
                "What were the top 5 products last quarter?",
                "Show me user activity statistics"
            ]
        }
    ];

    const handleQueryClick = (query) => {
        if (onExampleClick) {
            onExampleClick(query);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow h-full flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Try these example questions
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                    Click on any question to start a conversation
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {exampleQueries.map((category, categoryIndex) => {
                    const IconComponent = category.icon;
                    return (
                        <div
                            key={categoryIndex}
                            className={`border rounded-lg p-3 ${category.color} hover:shadow-md transition-shadow duration-200`}
                        >
                            <div className="flex items-center mb-2">
                                <IconComponent className="w-4 h-4 mr-2" />
                                <h5 className="font-medium text-sm">{category.category}</h5>
                            </div>

                            <div className="space-y-1">
                                {category.queries.map((query, queryIndex) => (
                                    <button
                                        key={queryIndex}
                                        onClick={() => handleQueryClick(query)}
                                        className="block w-full text-left text-xs p-2 rounded bg-white/50 hover:bg-white/80 transition-colors duration-150 border border-transparent hover:border-current/20"
                                    >
                                        <span className="flex items-start">
                                            <span className="text-current/60 mr-1">•</span>
                                            <span className="flex-1">{query}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pro Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                <div className="flex items-start">
                    <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">💡 Pro Tips:</p>
                        <ul className="space-y-0.5">
                            <li>• Be specific about which API or data you're interested in</li>
                            <li>• Ask for examples if you need help with request formats</li>
                            <li>• You can ask follow-up questions to dive deeper into topics</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExampleQueries;
