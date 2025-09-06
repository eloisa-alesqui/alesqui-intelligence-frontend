import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, AlertCircle, Download, FileText, File, FileSpreadsheet, Image, Video, Music, Archive, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatMessageChart from './ChatMessageChart';

const ChatMessages = ({ chatMessages, configuredApis, isLoading }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [expandedReasoning, setExpandedReasoning] = useState({});

  // ✅ Función para decodificar caracteres Unicode escapados
  const decodeUnicodeEscapes = (str) => {
      if (!str) return str;
      
      try {
          // Reemplazar secuencias Unicode escapadas como \uD83D\uDD0D
          return str.replace(/\\u([0-9A-Fa-f]{4})/g, (match, code) => {
              return String.fromCharCode(parseInt(code, 16));
          });
      } catch (error) {
          console.warn('Error decoding unicode escapes:', error);
          return str;
      }
  };

  // ✅ Función para procesar y formatear el razonamiento
  const processReasoning = (reasoning) => {
    // 1. Unificar la entrada a un solo string, manejando todos los casos.
    let reasoningText = '';
    if (Array.isArray(reasoning)) {
        // Si es un array, une sus elementos.
        reasoningText = reasoning.join('\n\n');
    } else if (typeof reasoning === 'string') {
        // Si ya es un string, úsalo directamente.
        reasoningText = reasoning;
    }

    // 2. Si después de la unificación no hay texto, retornar una cadena vacía.
    if (!reasoningText) {
        return '';
    }
    
    // 3. Ahora que estamos seguros de que 'reasoningText' es un string, continuamos.
    let processed = decodeUnicodeEscapes(reasoningText);
    
    processed = processed
        .replace(/\*\*([^*]+):\*\*/g, '**$1:**')
        .replace(/^\s*(\d+)\.\s+(.+)$/gm, '$1. $2')
        .replace(/^\s*-\s+(.+)$/gm, '- $1')
        .replace(/\n\n/g, '\n\n')
        .trim();
    
    return processed;
  };

  // ✅ Función para obtener el icono según el tipo de archivo
  const getFileIcon = (fileName) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      switch (extension) {
          case 'xlsx':
          case 'xls':
          case 'csv':
              return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
          case 'pdf':
              return <FileText className="w-5 h-5 text-red-600" />;
          case 'doc':
          case 'docx':
              return <FileText className="w-5 h-5 text-blue-600" />;
          case 'txt':
              return <FileText className="w-5 h-5 text-gray-600" />;
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'gif':
          case 'svg':
              return <Image className="w-5 h-5 text-purple-600" />;
          case 'mp4':
          case 'avi':
          case 'mov':
              return <Video className="w-5 h-5 text-red-500" />;
          case 'mp3':
          case 'wav':
              return <Music className="w-5 h-5 text-orange-500" />;
          case 'zip':
          case 'rar':
              return <Archive className="w-5 h-5 text-yellow-600" />;
          default:
              return <File className="w-5 h-5 text-gray-500" />;
      }
  };

  // ✅ Función para obtener el color del borde según el tipo de archivo
  const getFileColor = (fileName) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      switch (extension) {
          case 'xlsx':
          case 'xls':
          case 'csv':
              return 'border-green-200 bg-green-50 hover:bg-green-100';
          case 'pdf':
              return 'border-red-200 bg-red-50 hover:bg-red-100';
          case 'doc':
          case 'docx':
              return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'gif':
          case 'svg':
              return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
          default:
              return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
      }
  };

  // ✅ Función para formatear el tamaño del archivo (simulado)
  const formatFileSize = (fileName) => {
      // En un caso real, esto vendría del servidor
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
          case 'xlsx':
          case 'xls':
              return '~15-25 KB';
          case 'csv':
              return '~5-10 KB';
          case 'pdf':
              return '~50-100 KB';
          default:
              return '~10-20 KB';
      }
  };

  // ✅ Componente de descarga estilo Gemini
  const DownloadCard = ({ href, fileName, children }) => {
      const fileIcon = getFileIcon(fileName);
      const colorClasses = getFileColor(fileName);
      const fileSize = formatFileSize(fileName);
      const extension = fileName.split('.').pop()?.toUpperCase();

      return (
          <div className="my-4">
              <a
                  href={href}
                  download={fileName}
                  className={`block p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${colorClasses} group`}
                  title="Descargar archivo"
              >
                  <div className="flex items-center space-x-4">
                      {/* Icono del archivo */}
                      <div className="flex-shrink-0">
                          {fileIcon}
                      </div>
                      
                      {/* Información del archivo */}
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                  {fileName}
                              </p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {extension}
                              </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                              {fileSize}
                          </p>
                      </div>
                      
                      {/* Icono de descarga */}
                      <div className="flex-shrink-0">
                          <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
                              <Download className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                          </div>
                      </div>
                  </div>
              </a>
          </div>
      );
  };

  // ✅ Componente personalizado para renderizar código
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (!inline && language) {
          return (
              <div className="my-4 rounded-lg overflow-hidden">
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
      } catch (err) {
          console.error('Error copying to clipboard:', err);
      }
  };

  // ✅ Función para transformar URLs
  const urlTransform = (uri) => {
      if (uri && uri.startsWith('sandbox:/')) {
          const filePath = uri.replace('sandbox:/', '');
          const fileName = filePath.split('/').pop();
          const downloadUrl = `/api/files/download/${fileName}`;
          return downloadUrl;
      }
      return uri;
  };

  // ✅ Componente personalizado para enlaces mejorado
  const CustomLink = ({ href, children, ...props }) => {
      // Detectar si es un enlace de descarga
      const isDownloadLink = href && (
          href.includes('/api/files/download/') || 
          href.includes('.xlsx') || 
          href.includes('.xls') ||
          href.includes('.csv') ||
          href.includes('.pdf') ||
          href.includes('.doc') ||
          href.includes('.docx') ||
          href.includes('.txt')
      );

      if (isDownloadLink) {
          const fileName = href.split('/').pop();
          return <DownloadCard href={href} fileName={fileName}>{children}</DownloadCard>;
      }

      // Para enlaces normales
      return (
          <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              {...props}
          >
              {children}
          </a>
      );
  };

  // ✅ Componentes personalizados para Markdown del razonamiento
  const reasoningMarkdownComponents = {
      code: CodeBlock,
      a: CustomLink,
      h1: ({ children }) => (
          <h1 className="text-lg font-bold mt-3 mb-2 text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              {children}
          </h1>
      ),
      h2: ({ children }) => (
          <h2 className="text-base font-semibold mt-3 mb-2 text-gray-800">{children}</h2>
      ),
      h3: ({ children }) => (
          <h3 className="text-sm font-medium mt-2 mb-1 text-gray-700">{children}</h3>
      ),
      ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1 text-sm">{children}</ul>
      ),
      ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1 text-sm">{children}</ol>
      ),
      p: ({ children }) => (
          <p className="mb-2 leading-relaxed text-sm text-gray-700">{children}</p>
      ),
      strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
      ),
      em: ({ children }) => (
          <em className="italic text-gray-800">{children}</em>
      ),
      blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-blue-400 pl-3 my-2 bg-blue-50 py-2 rounded-r text-sm">
              {children}
          </blockquote>
      ),
  };

  // ✅ Componentes personalizados para Markdown principal
  const markdownComponents = {
      code: CodeBlock,
      a: CustomLink,
      h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>
      ),
      h2: ({ children }) => (
          <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800">{children}</h2>
      ),
      h3: ({ children }) => (
          <h3 className="text-md font-medium mt-2 mb-1 text-gray-700">{children}</h3>
      ),
      ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
      ),
      ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
      ),
      p: ({ children }) => (
          <p className="mb-2 leading-relaxed">{children}</p>
      ),
      blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 my-3 bg-blue-50 py-2 rounded-r">
              {children}
          </blockquote>
      ),
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

  // ✅ Componente para mostrar el razonamiento colapsable mejorado
  const ReasoningSection = ({ reasoning, messageId }) => {
      const isExpanded = expandedReasoning[messageId] || false;
      const processedReasoning = processReasoning(reasoning);

      const toggleReasoning = () => {
          setExpandedReasoning(prev => ({
              ...prev,
              [messageId]: !prev[messageId]
          }));
      };

      return (
          <div className="mt-4 border-t border-gray-200 pt-3">
              <button
                  onClick={toggleReasoning}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors w-full text-left"
              >
                  {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                  ) : (
                      <ChevronDown className="w-4 h-4" />
                  )}
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">View step-by-step reasoning</span>
              </button>
              
              {isExpanded && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={reasoningMarkdownComponents}
                          >
                              {processedReasoning}
                          </ReactMarkdown>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // Resto de funciones (mantener las existentes)
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

  const MessageBubble = ({ message, index }) => {
      const isUser = message.type === 'user';
      const isBot = message.type === 'bot';
      const isError = message.isError;
      const messageId = message.id || `msg-${index}`;

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
                          {/* Contenido principal del mensaje */}
                          {isBot && !isError ? (
                              <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={markdownComponents}
                                      urlTransform={urlTransform}
                                  >
                                      {message.content || ''}
                                  </ReactMarkdown>
                                  {message.chart && <ChatMessageChart chartData={message.chart} />}
                              </div>
                          ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                              </p>
                          )}

                          {/* Sección de razonamiento colapsable (solo para mensajes del bot con reasoning) */}
                          {isBot && !isError && message.reasoning && message.reasoning.length > 0 && (
                              <ReasoningSection 
                                  reasoning={message.reasoning} 
                                  messageId={messageId}
                              />
                          )}

                          {/* Timestamp */}
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
                      Thinking...
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