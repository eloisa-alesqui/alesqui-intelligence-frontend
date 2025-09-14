import React, { useEffect, useRef, useState, FC, ReactNode } from 'react';
import { Bot, User, AlertCircle, Download, FileText, File, FileSpreadsheet, Image, Video, Music, Archive, ChevronDown, ChevronUp, Brain, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatMessageChart from './ChatMessageChart';
import { ApiDocument } from '../../services/apiService';
import { ChatMessage as ChatMessageTypeFromHook } from '../../hooks/useChat';
import apiClient from '../../api/axiosConfig'; // Import the configured axios instance
import { useNotifications } from '../../context/NotificationContext'; // For showing notifications

// This type is used for rendering purposes. It mirrors the hook's type
// but ensures 'id' is a string, as converted in the parent component.
type ChatMessageForRender = Omit<ChatMessageTypeFromHook, 'id'> & {
    id: string;
};

// Define props for the component
interface ChatMessagesProps {
    chatMessages: ChatMessageForRender[];
    configuredApis: ApiDocument[];
    isLoading: boolean;
    isItUser: boolean;
}

const ChatMessages: FC<ChatMessagesProps> = ({ chatMessages, configuredApis, isLoading, isItUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
    const { addNotification } = useNotifications();
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    // This function transforms special 'sandbox:/' links from the backend
    // into actual API download URLs that the browser can use.
    const urlTransform = (uri: string) => {
        if (uri && uri.startsWith('sandbox:/')) {
            const filePath = uri.replace('sandbox:/', '');
            const fileName = filePath.split('/').pop();
            const downloadUrl = `/api/files/download/${fileName}`;
            return downloadUrl;
        }
        return uri;
    };

    const handleDownload = async (fileUrl: string, fileName: string) => {
        setDownloadingFile(fileName);
        try {
            const response = await apiClient.get(fileUrl, {
                responseType: 'blob', // Important: we expect binary data
            });

            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Clean up the temporary link and URL
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            addNotification(`Successfully downloaded ${fileName}`, 'success');
        } catch (error) {
            console.error("Download failed:", error);
            addNotification(`Failed to download ${fileName}. Please check the console for details.`, 'error');
        } finally {
            setDownloadingFile(null);
        }
    };

    // ... (other helper functions like decodeUnicodeEscapes, processReasoning, etc. remain the same)
    const decodeUnicodeEscapes = (str: string): string => {
        if (!str) return str;
        try {
            return str.replace(/\\u([0-9A-Fa-f]{4})/g, (_, code) =>
                String.fromCharCode(parseInt(code, 16))
            );
        } catch (error) {
            console.warn('Error decoding unicode escapes:', error);
            return str;
        }
    };

    const processReasoning = (reasoning: string | string[] | undefined): string => {
        let reasoningText = '';
        if (Array.isArray(reasoning)) {
            reasoningText = reasoning.join('\n\n');
        } else if (typeof reasoning === 'string') {
            reasoningText = reasoning;
        }
        if (!reasoningText) return '';
        
        let processed = decodeUnicodeEscapes(reasoningText);
        processed = processed
            .replace(/\*\*([^*]+):\*\*/g, '**$1:**')
            .replace(/^\s*(\d+)\.\s+(.+)$/gm, '$1. $2')
            .replace(/^\s*-\s+(.+)$/gm, '- $1')
            .trim();
        return processed;
    };

    const getFileIcon = (fileName: string): ReactNode => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
          case 'xlsx': case 'xls': case 'csv': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
          case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
          case 'doc': case 'docx': return <FileText className="w-5 h-5 text-blue-600" />;
          case 'png': case 'jpg': case 'jpeg': return <Image className="w-5 h-5 text-purple-600" />;
          default: return <File className="w-5 h-5 text-gray-500" />;
      }
    };

    const getFileColor = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'xlsx': case 'xls': case 'csv': return 'border-green-200 bg-green-50 hover:bg-green-100';
            case 'pdf': return 'border-red-200 bg-red-50 hover:bg-red-100';
            case 'doc': case 'docx': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
            default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
        }
    };
    
    const DownloadCard: FC<{ href: string; fileName: string, children: ReactNode }> = ({ href, fileName }) => {
        const isDownloading = downloadingFile === fileName;
        return (
          <div className="my-4">
              <button
                  onClick={() => handleDownload(href, fileName)}
                  disabled={isDownloading}
                  className={`w-full block p-4 border-2 rounded-xl transition-all text-left ${getFileColor(fileName)} group disabled:opacity-70 disabled:cursor-wait`}
              >
                  <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{getFileIcon(fileName)}</div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                      </div>
                      <div className="flex-shrink-0 p-2 rounded-full bg-white shadow-sm group-hover:shadow-md">
                          {isDownloading
                            ? <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                            : <Download className="w-4 h-4 text-gray-600" />
                          }
                      </div>
                  </div>
              </button>
          </div>
        );
    };
    
    const CodeBlock: FC<any> = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

        if (!inline && language) {
            return (
                <div className="my-4 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-between items-center">
                        <span className="capitalize">{language}</span>
                        <button onClick={() => copyToClipboard(String(children))} title="Copy code">📋</button>
                    </div>
                    <SyntaxHighlighter style={vscDarkPlus} language={language} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        }
        return <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
    };

    const CustomLink: FC<any> = ({ href, children, ...props }) => {
        const isDownloadLink = href && href.includes('/api/files/download/');
        if (isDownloadLink) {
            const fileName = href.split('/').pop() || String(children);
            return <DownloadCard href={href} fileName={fileName}>{children}</DownloadCard>;
        }
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" {...props}>{children}</a>;
    };
    
    const markdownComponents = { code: CodeBlock, a: CustomLink };
    const reasoningMarkdownComponents = { ...markdownComponents, h1: ({children}: any) => <h1 className="text-lg font-bold mt-3 mb-2 flex items-center"><Brain className="w-5 h-5 mr-2 text-blue-600"/>{children}</h1> };

    const ReasoningSection: FC<{ reasoning: string | string[] | undefined, messageId: string }> = ({ reasoning, messageId }) => {
        const isExpanded = expandedReasoning[messageId] || false;
        const toggleReasoning = () => setExpandedReasoning(prev => ({ ...prev, [messageId]: !isExpanded }));

        return (
            <div className="mt-4 border-t border-gray-200 pt-3">
                <button onClick={toggleReasoning} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 w-full text-left">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">View step-by-step reasoning</span>
                </button>
                {isExpanded && (
                    <div className="mt-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={reasoningMarkdownComponents} urlTransform={urlTransform}>
                                {processReasoning(reasoning)}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
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

    const EmptyState = () => (
        <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-medium">Hello! I'm your AI assistant.</p>
            <p className="text-sm mt-1">{isItUser ? "Ask me about your configured APIs." : "Ask me about your available data."}</p>
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
    
    const MessageBubble: FC<{ message: ChatMessageForRender, index: number }> = ({ message, index }) => {
        const isUser = message.type === 'user';
        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl px-4 py-3 rounded-lg ${isUser ? 'bg-blue-600 text-white' : message.isError ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-gray-100 text-gray-900'}`}>
                    <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">{isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}</div>
                        <div className="flex-1 min-w-0">
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} urlTransform={urlTransform}>
                                    {message.content || ''}
                                </ReactMarkdown>
                            </div>
                            {message.chart && <ChatMessageChart chartData={message.chart} />}
                            {message.type === 'bot' && !message.isError && message.reasoning && isItUser && (
                                <ReasoningSection reasoning={message.reasoning} messageId={String(message.id) || `msg-${index}`} />
                            )}
                            <p className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? <EmptyState /> : (
                <>
                    {chatMessages.map((message, index) => <MessageBubble key={message.id || index} message={message} index={index} />)}
                    {isLoading && <LoadingIndicator />}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;