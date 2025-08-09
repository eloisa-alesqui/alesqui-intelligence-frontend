import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, AlertCircle, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessages = ({ chatMessages, configuredApis, isLoading }) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // ✅ Componente personalizado para renderizar código
    const CodeBlock = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (!inline && language) {
            return (
                <div className="my-4 rounded-lg overflow-hidden">
                    {/* Header del bloque de código */}
                    <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs font-mono flex items-center justify-between">
                        <span className="capitalize">{language}</span>
                        <button
                            onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy code"
                        >
                            📋
                        </button>
                    </div>
                    {/* Código con syntax highlighting */}
                    <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        }

        // Código inline
        return (
            <code
                className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
            >
                {children}
            </code>
        );
    };

    // ✅ Función para copiar código
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Opcional: mostrar notificación de copiado
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    };

    // ✅ Componentes personalizados para Markdown
    const markdownComponents = {
        code: CodeBlock,

        // Personalizar enlaces
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
            >
                {children}
            </a>
        ),

        // Personalizar encabezados
        h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-md font-medium mt-2 mb-1 text-gray-700">{children}</h3>
        ),

        // Personalizar listas
        ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
        ),

        // Personalizar párrafos
        p: ({ children }) => (
            <p className="mb-2 leading-relaxed">{children}</p>
        ),

        // Personalizar blockquotes
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-3 bg-blue-50 py-2 rounded-r">
                {children}
            </blockquote>
        ),

        // Personalizar tablas
        table: ({ children }) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-300 rounded-lg">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2">{children}</td>
        ),
    };

    // Funciones de scroll (mantener las existentes)
    const smoothScrollTo = (element, targetPosition, duration = 300) => {
        const startPosition = element.scrollTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const currentPosition = startPosition + (distance * progress);
            element.scrollTop = currentPosition;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    const scrollToBottom = (force = false) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom || force || shouldAutoScroll) {
            setTimeout(() => {
                smoothScrollTo(
                    containerRef.current,
                    containerRef.current.scrollHeight
                );
            }, 100);
        }
    };

    const handleScroll = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

        setShouldAutoScroll(isAtBottom);
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    useEffect(() => {
        if (isLoading) {
            scrollToBottom(true);
        }
    }, [isLoading]);

    const EmptyState = () => (
        <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-medium">Hello! I'm your API assistant.</p>
            <p className="text-sm mt-1">Ask me about your configured APIs.</p>
            {configuredApis.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <p className="text-xs text-yellow-700">
                            Configure some APIs first to start chatting!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    const MessageBubble = ({ message }) => {
        const isUser = message.type === 'user';
        const isError = message.isError;

        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                    className={`max-w-2xl lg:max-w-4xl px-4 py-3 rounded-lg ${isUser
                        ? 'bg-blue-600 text-white'
                        : isError
                            ? 'bg-red-50 text-red-900 border border-red-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                >
                    <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                            {isUser ? (
                                <User className="w-4 h-4" />
                            ) : isError ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            ) : <Bot className="w-4 h-4 text-blue-600" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            {!isUser ? (
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={markdownComponents}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>
                            )}

                            <p className={`text-xs mt-2 ${isUser
                                ? 'text-blue-200'
                                : isError
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}>
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LoadingIndicator = () => (
        <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                        'Thinking...'
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
        >
            {chatMessages.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {chatMessages.map((message, index) => (
                        <MessageBubble key={message.id || index} message={message} />
                    ))}
                    {isLoading && <LoadingIndicator />}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
