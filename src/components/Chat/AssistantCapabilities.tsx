import React, { FC, useMemo } from 'react';
import { MessageSquare, Code, Zap, ChevronRight } from 'lucide-react';
import { ApiDocument } from '../../types';

interface CapabilitiesProps {
    configuredApis: ApiDocument[];
    onExampleClick: (query: string) => void;
    hasTechnicalAccess: boolean;
}

const AssistantCapabilities: FC<CapabilitiesProps> = ({ configuredApis, onExampleClick, hasTechnicalAccess }) => {

    const apisWithCapabilities = configuredApis.filter(api => api.capabilities);

    const technicalSection = useMemo(() => {

        let dynamicApiName = 'your-api';
        let dynamicEndpointName = 'an-endpoint';

        if (configuredApis.length > 0) {
            const firstApi = configuredApis[0];
            dynamicApiName = firstApi.name || dynamicApiName;

            const firstEndpoint = firstApi.endpoints?.[0];
            if (firstEndpoint?.operationId) {
                dynamicEndpointName = firstEndpoint.operationId;
            }
            else if (firstEndpoint?.path) {
                dynamicEndpointName = firstEndpoint.path;
            }
        }

        return {
            category: "API Inspection & Debugging",
            icon: Code,
            capabilities: [
                { text: "List all available APIs and their descriptions.", example: "Show me all configured APIs" },
                { text: "Explore the endpoints for a specific API.", example: `What endpoints are in the '${dynamicApiName}' API?` },
                { text: "Check the required parameters for an endpoint.", example: `What parameters does the '${dynamicEndpointName}' endpoint need?` }
            ]
        };
    }, [configuredApis]);
    const handleQueryClick = (query: string) => {
        onExampleClick?.(query);
    };

    const colorSchemes = [
        {
            bgColor: "bg-blue-50",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            titleColor: "text-blue-700",
            dotColor: "bg-blue-600"
        },
        {
            bgColor: "bg-purple-50",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
            titleColor: "text-purple-700",
            dotColor: "bg-purple-600"
        },
        {
            bgColor: "bg-green-50",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            titleColor: "text-green-700",
            dotColor: "bg-green-600"
        },
        {
            bgColor: "bg-orange-50",
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            titleColor: "text-orange-700",
            dotColor: "bg-orange-600"
        },
        {
            bgColor: "bg-pink-50",
            iconBg: "bg-pink-100",
            iconColor: "text-pink-600",
            titleColor: "text-pink-700",
            dotColor: "bg-pink-600"
        },
        {
            bgColor: "bg-indigo-50",
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
            titleColor: "text-indigo-700",
            dotColor: "bg-indigo-600"
        }
    ];

    if (apisWithCapabilities.length === 0 && !hasTechnicalAccess) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">Assistant Capabilities</h4>
                        <p className="text-sm text-gray-600">Discover what you can ask about</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {/* Technical Section for users with technical access */}
                    {hasTechnicalAccess && (
                        <div className="bg-slate-800 rounded-lg p-4 hover:shadow-lg transition-all duration-200 relative border border-slate-700">
                            <div className="flex items-center mb-3">
                                <div className="bg-slate-700 p-2 rounded-lg mr-3">
                                    <technicalSection.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-white">{technicalSection.category}</h5>
                                    <p className="text-xs text-slate-400 mt-0.5">Interactive commands for developers</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {technicalSection.capabilities.map((cap, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQueryClick(cap.example)}
                                        className="w-full text-left p-3 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start flex-1 mr-2">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-100 leading-relaxed mb-1">
                                                        {cap.text}
                                                    </p>
                                                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                                                        Try: "{cap.example}"
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Business Capabilities */}
                    {configuredApis.map((api, index) => {
                        if (!api.capabilities) return null;

                        const categoryName = api.capabilities.category || api.name;
                        const colorScheme = colorSchemes[index % colorSchemes.length];

                        return (
                            <div key={api._id || api.id} className={`${colorScheme.bgColor} border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200`}>
                                <div className="flex items-center mb-3">
                                    <div className={`${colorScheme.iconBg} p-2 rounded-lg mr-3`}>
                                        <Zap className={`w-5 h-5 ${colorScheme.iconColor}`} />
                                    </div>
                                    <h5 className={`font-semibold ${colorScheme.titleColor}`}>{categoryName}</h5>
                                </div>

                                <div className="space-y-2">
                                    {api.capabilities.capabilities.map((capability, capIndex) => (
                                        <div key={capIndex} className="flex items-start bg-white/60 rounded-lg p-3 border border-white/80">
                                            <div className={`w-2 h-2 ${colorScheme.dotColor} rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {capability}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AssistantCapabilities;