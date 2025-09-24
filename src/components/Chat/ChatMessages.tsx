import React, { useEffect, useRef, useState, FC, ReactNode } from 'react';
import { Bot, User, AlertCircle, Download, FileText, File, FileSpreadsheet, Image, Video, Music, Archive, ChevronDown, ChevronUp, Brain, Loader2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatSmartTimestamp } from '../../utils/dateUtils';

// Types
type ChatMessageForRender = {
    id: string;
    content: string;
    type: 'user' | 'bot';
    timestamp: Date;
    isError?: boolean;
    reasoning?: string | string[];
    chart?: any;
};

interface ChatMessagesProps {
    chatMessages: ChatMessageForRender[];
    configuredApis: any[];
    isLoading: boolean;
    isItUser: boolean;
}

const ChatMessages: FC<ChatMessagesProps> = ({ chatMessages, configuredApis, isLoading, isItUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    // URL transform function
    const urlTransform = (uri: string) => {
        if (uri && uri.startsWith('sandbox:/')) {
            const filePath = uri.replace('sandbox:/', '');
            const fileName = filePath.split('/').pop();
            return `/api/files/download/${fileName}`;
        }
        return uri;
    };

    // Function to detect and render URLs in text
    const renderTextWithUrls = (text: string) => {
        // Regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-100 underline break-all inline-flex items-center gap-1 my-1"
                    >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="break-all">{part}</span>
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Custom components for ReactMarkdown
    const CustomOrderedList: FC<any> = ({ children, ...props }) => (
        <ol className="list-decimal list-outside ml-6 my-4 space-y-2" {...props}>
            {children}
        </ol>
    );

    const CustomUnorderedList: FC<any> = ({ children, ...props }) => (
        <ul className="list-disc list-outside ml-6 my-4 space-y-2" {...props}>
            {children}
        </ul>
    );

    const CustomListItem: FC<any> = ({ children, ...props }) => (
        <li className="text-gray-900 leading-relaxed" {...props}>
            {children}
        </li>
    );

    const CustomParagraph: FC<any> = ({ children, ...props }) => (
        <p className="mb-3 leading-relaxed text-gray-900 break-words" {...props}>
            {children}
        </p>
    );

    const CustomStrong: FC<any> = ({ children, ...props }) => (
        <strong className="font-semibold text-gray-900" {...props}>
            {children}
        </strong>
    );

    const CodeBlock: FC<any> = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

        if (!inline && language) {
            return (
                <div className="my-4 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-between items-center">
                        <span className="capitalize">{language}</span>
                        <button onClick={() => copyToClipboard(String(children))} title="Copy code">
                            📋
                        </button>
                    </div>
                    <SyntaxHighlighter style={vscDarkPlus} language={language} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        }
        return (
            <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono break-all" {...props}>
                {children}
            </code>
        );
    };

    const CustomLink: FC<any> = ({ href, children, ...props }) => {
        const isDownloadLink = href && href.includes('/api/files/download/');
        if (isDownloadLink) {
            return (
                <a
                    href={href}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 underline break-all"
                    {...props}
                >
                    <Download className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="break-all">{children}</span>
                </a>
            );
        }
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all inline-flex items-center gap-1"
                {...props}
            >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="break-all">{children}</span>
            </a>
        );
    };

    // Enhanced markdown components with proper list handling
    const markdownComponents = {
        code: CodeBlock,
        a: CustomLink,
        ol: CustomOrderedList,
        ul: CustomUnorderedList,
        li: CustomListItem,
        p: CustomParagraph,
        strong: CustomStrong,
    };

    const reasoningMarkdownComponents = {
        ...markdownComponents,
        h1: ({ children }: any) => (
            <h1 className="text-lg font-bold mt-3 mb-2 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                {children}
            </h1>
        ),
    };

    // Process reasoning function
    const processReasoning = (reasoning: string | string[] | undefined): string => {
        let reasoningText = '';
        if (Array.isArray(reasoning)) {
            reasoningText = reasoning.join('\n\n');
        } else if (typeof reasoning === 'string') {
            reasoningText = reasoning;
        }
        if (!reasoningText) return '';

        // Decode unicode escapes
        let processed = reasoningText.replace(/\\u([0-9A-Fa-f]{4})/g, (_, code) =>
            String.fromCharCode(parseInt(code, 16))
        );

        return processed.trim();
    };

    // Reasoning section component
    const ReasoningSection: FC<{ reasoning: string | string[] | undefined, messageId: string }> = ({ reasoning, messageId }) => {
        const isExpanded = expandedReasoning[messageId] || false;
        const toggleReasoning = () => setExpandedReasoning(prev => ({ ...prev, [messageId]: !isExpanded }));

        return (
            <div className="mt-4 border-t border-gray-200 pt-3">
                <button
                    onClick={toggleReasoning}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 w-full text-left"
                >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">View step-by-step reasoning</span>
                </button>
                {isExpanded && (
                    <div className="mt-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={reasoningMarkdownComponents}
                                urlTransform={urlTransform}
                            >
                                {processReasoning(reasoning)}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Message bubble component
    const MessageBubble: FC<{ message: ChatMessageForRender, index: number }> = ({ message, index }) => {
        const isUser = message.type === 'user';

        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl px-4 py-3 rounded-lg ${isUser
                        ? 'bg-blue-600 text-white'
                        : message.isError
                            ? 'bg-red-50 text-red-900 border border-red-200'
                            : 'bg-gray-100 text-gray-900'
                    }`}>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                            {isUser ? (
                                <User className="w-5 h-5" />
                            ) : (
                                <Bot className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="break-words">
                                {isUser ? (
                                    // For user messages, handle URLs specially and use simple text rendering
                                    <div className="text-white leading-relaxed whitespace-pre-wrap">
                                        {renderTextWithUrls(message.content || '')}
                                    </div>
                                ) : (
                                    // For bot messages, use full markdown rendering
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={markdownComponents}
                                            urlTransform={urlTransform}
                                        >
                                            {message.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            {message.type === 'bot' && !message.isError && message.reasoning && isItUser && (
                                <ReasoningSection
                                    reasoning={message.reasoning}
                                    messageId={String(message.id) || `msg-${index}`}
                                />
                            )}
                            <p className={`text-xs mt-2 text-right w-full ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                {formatSmartTimestamp(message.timestamp)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Loading indicator
    const LoadingIndicator = () => (
        <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-medium">Hello! I'm your AI assistant.</p>
            <p className="text-sm mt-1">
                {isItUser ? "Ask me about your configured APIs." : "Ask me about your available data."}
            </p>
            {configuredApis.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg inline-flex">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    <p className="text-xs text-yellow-700">
                        {isItUser ? "Configure some APIs first to start chatting!" : "Data sources are not available yet."}
                    </p>
                </div>
            )}
        </div>
    );

    // Auto-scroll effect
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom || shouldAutoScroll) {
            setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
        }
    }, [chatMessages, isLoading]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        setShouldAutoScroll(isAtBottom);
    };

    return (
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {chatMessages.map((message, index) => (
                        <MessageBubble key={message.id || index} message={message} index={index} />
                    ))}
                    {isLoading && <LoadingIndicator />}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;