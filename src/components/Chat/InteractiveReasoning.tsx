import React, { useState, FC, useMemo, useRef, useEffect } from 'react';
import { Zap, X, FileText, CheckCircle, XCircle, Brain, Copy as CopyIcon } from 'lucide-react';
import ToggleChevron from '../Common/ToggleChevron';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ReasoningStep, StepType, ToolCallData, ToolCallStatus } from '../../services/chatService';

// Small JSON viewer used by the ToolCallModal
interface JsonViewerProps {
    jsonString: string;
    title: string;
    toolName?: string;
    response: boolean;
}

const JsonViewer: FC<JsonViewerProps> = ({ jsonString, title, toolName, response }) => {
    const [copied, setCopied] = useState(false);
    const [wrapMode, setWrapMode] = useState(true); // true: wrap lines (no horizontal scroll), false: enable horizontal scroll
    let parsedJson: any;
    let isPlainString = false;
    let formattedOutput: string;
    let mainJsonToDisplay: string = jsonString;

    try {
        parsedJson = JSON.parse(jsonString);

        // Recursively parse any string fields that themselves contain JSON.
        const deepParseJsonStrings = (value: any, depth = 0): any => {
            if (depth > 6 || value == null) return value;
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        return deepParseJsonStrings(parsed, depth + 1);
                    } catch {
                        return value;
                    }
                }
                return value;
            }
            if (Array.isArray(value)) {
                return value.map(v => deepParseJsonStrings(v, depth + 1));
            }
            if (typeof value === 'object') {
                const out: any = Array.isArray(value) ? [] : {};
                for (const [k, v] of Object.entries(value)) {
                    out[k] = deepParseJsonStrings(v, depth + 1);
                }
                return out;
            }
            return value;
        };

        const transformed = deepParseJsonStrings(parsedJson);
        // If the parsed content resolves to a plain string, display it as multi-line text
        // so that newline characters are rendered as actual line breaks.
        if (typeof transformed === 'string') {
            isPlainString = true;
            formattedOutput = transformed; // Already contains real \n characters
        } else {
            mainJsonToDisplay = JSON.stringify(transformed, null, 2);
            isPlainString = false;

            // Final formatting stage (kept for safety)
            try {
                const jsonToFormat = (mainJsonToDisplay === jsonString) ? transformed : JSON.parse(mainJsonToDisplay);
                formattedOutput = JSON.stringify(jsonToFormat, null, 2);
            } catch (formatError) {
                formattedOutput = mainJsonToDisplay;
                isPlainString = true;
            }
        }

    } catch (e) {
        isPlainString = true;
        formattedOutput = jsonString;
    }

    const syntaxHighlighterStyle = {
        margin: 0,
        whiteSpace: wrapMode ? 'pre-wrap' : 'pre',
        // In wrap mode, avoid horizontal scroll; otherwise allow it
        overflowX: wrapMode ? 'hidden' : 'auto',
        wordBreak: wrapMode ? 'break-word' : 'normal',
        overflowWrap: wrapMode ? 'anywhere' : 'normal'
    } as React.CSSProperties;

    const handleCopy = async () => {
        try {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(formattedOutput);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = formattedOutput;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                (document as any).execCommand && (document as any).execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // Best-effort: still show feedback
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="my-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">{title}</span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setWrapMode(w => !w)}
                        aria-pressed={!wrapMode}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        title={wrapMode ? 'Enable horizontal scroll' : 'Enable line wrapping'}
                    >
                        {wrapMode ? 'Scroll' : 'Wrap'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label={`Copy ${title}`}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    >
                        <CopyIcon className="w-3.5 h-3.5" />
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            <div className={`mt-1 rounded-lg bg-gray-900 overflow-hidden max-h-60 overflow-y-auto ${wrapMode ? 'overflow-x-hidden' : 'overflow-x-auto'} p-4`}>
                {isPlainString ? (
                    <pre className={`text-sm text-gray-300 ${wrapMode ? 'whitespace-pre-wrap break-words overflow-x-hidden' : 'whitespace-pre overflow-x-auto'}`}>{formattedOutput}</pre>
                ) : (
                    <SyntaxHighlighter
                        style={vscDarkPlus}
                        language="json"
                        PreTag="pre"
                        customStyle={syntaxHighlighterStyle}
                        wrapLongLines={wrapMode}
                    >
                        {formattedOutput}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};

// ToolCall modal
interface ToolCallModalProps {
    toolCall: ToolCallData | null;
    onClose: () => void;
}

const ToolCallModal: FC<ToolCallModalProps> = ({ toolCall, onClose }) => {
    const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');

    if (!toolCall) return null;

    const isSuccess = toolCall.status === ToolCallStatus.SUCCESS;
    const isApiCall = toolCall.toolName === 'call_api';

    let responseData: any = {};
    try { responseData = JSON.parse(toolCall.responseDataJson); } catch (e) { }
    const executionTime = toolCall.executionTimeMs;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center"><Zap className="w-5 h-5 mr-2 text-blue-600"/> Tool Call: {toolCall.toolName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>

                <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-50 rounded-md border">
                    <div className={`flex items-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {isSuccess ? <CheckCircle className="w-4 h-4 mr-1.5"/> : <XCircle className="w-4 h-4 mr-1.5"/>}
                        <span className="font-semibold text-sm">{isSuccess ? 'Success' : (responseData.errorType || 'Error')}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-sm"><span className="text-gray-500">Status: </span><span className="font-semibold text-gray-800">{isApiCall ? (responseData.statusCode ?? 'N/A') : (isSuccess ? 'OK' : 'Error')}</span></div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-sm"><span className="text-gray-500">Time: </span><span className="font-semibold text-gray-800">{executionTime != null ? `${executionTime} ms` : 'N/A ms'}</span></div>
                </div>

                <div className="border-b border-gray-200 mb-4">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('request')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'request' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Request</button>
                        <button onClick={() => setActiveTab('response')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'response' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Response</button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'response' && <JsonViewer jsonString={toolCall.responseDataJson} title="Tool Output" toolName={toolCall.toolName} response={true} />}
                    {activeTab === 'request' && <JsonViewer jsonString={toolCall.requestArgumentsJson} title="Tool Arguments (Request)" toolName={toolCall.toolName} response={false} />}
                </div>
            </div>
        </div>
    );
};

// InteractiveReasoning component
interface InteractiveReasoningProps {
    steps: ReasoningStep[];
    isExpanded: boolean;
    onToggle: () => void;
}

export const InteractiveReasoning: FC<InteractiveReasoningProps> = React.memo(({ steps, isExpanded, onToggle }) => {
    const [selectedToolCall, setSelectedToolCall] = useState<ToolCallData | null>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    const visibleSteps = useMemo(() => steps.filter(step => step.type !== StepType.FINAL_RESPONSE), [steps]);
    if (visibleSteps.length === 0) return null;

    // Measure inner content height when expanding or when steps change
    useEffect(() => {
        if (isExpanded) {
            const measure = () => {
                if (contentInnerRef.current) {
                    // Use offsetHeight to include borders; add a small buffer to avoid clipping due to sub-pixel rounding
                    const h = contentInnerRef.current.offsetHeight;
                    setContentHeight(h);
                }
            };
            // Measure on next frame to ensure DOM is painted
            const raf = requestAnimationFrame(measure);
            return () => cancelAnimationFrame(raf);
        } else {
            // Collapse
            setContentHeight(0);
        }
    }, [isExpanded, visibleSteps.length]);

    return (
        <>
            <ToolCallModal toolCall={selectedToolCall} onClose={() => setSelectedToolCall(null)} />
            <div className="mt-4 border-t border-gray-200 pt-3">
                <button onClick={onToggle} aria-expanded={isExpanded} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 w-full text-left">
                    <ToggleChevron open={isExpanded} size={16} />
                    <Brain className="w-4 h-4 text-blue-600"/>
                    <span className="font-medium">View step-by-step reasoning</span>
                </button>

                <div
                    className="mt-3 overflow-hidden"
                    style={{
                        maxHeight: isExpanded ? contentHeight + 2 : 0,
                        opacity: isExpanded ? 1 : 0,
                        // Easing tuned: expand = ease-out (longer), collapse = ease-in (shorter)
                        transition: isExpanded
                            ? 'max-height 400ms ease-out, opacity 250ms ease-out'
                            : 'max-height 300ms ease-in, opacity 180ms ease-in',
                        willChange: 'max-height, opacity'
                    }}
                    aria-hidden={!isExpanded}
                >
                    <div ref={contentInnerRef} className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg space-y-5">
                        {visibleSteps.map((step: ReasoningStep, stepIndex: number) => {
                            if (step.type === StepType.THOUGHT) {
                                let thoughtText = step.textContent || '';
                                let actionDescription = '';
                                thoughtText = thoughtText.replace(/^Thought:\s*/i, '');
                                const actIndex = thoughtText.search(/\s*Act:\s*/i);
                                if (actIndex !== -1) {
                                    actionDescription = thoughtText.substring(actIndex + 4).trim();
                                    thoughtText = thoughtText.substring(0, actIndex).trim();
                                    actionDescription = actionDescription.replace(/^t:\s*/i, '');
                                }

                                return (
                                    <div key={step.id} className="thought-block">
                                        <div className="flex items-center mb-2 space-x-2">
                                            <span className="text-blue-600 text-lg">🎯</span>
                                            <h4 className="text-sm font-semibold text-gray-700">Thought:</h4>
                                        </div>
                                        <div className="pl-6 text-gray-700 text-sm italic border-l-2 border-blue-200 ml-2">
                                            {thoughtText}
                                        </div>
                                        {actionDescription && (
                                            <div className="tool-call-block mt-4">
                                                <div className="flex items-center mb-2 space-x-2">
                                                    <span className="text-blue-600 text-lg">⚙️</span>
                                                    <h4 className="text-sm font-semibold text-gray-700">Action:</h4>
                                                </div>
                                                <div className="pl-6 text-gray-700 text-sm ml-2">
                                                    {actionDescription}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (step.type === StepType.TOOL_CALL && step.toolCalls) {
                                const prev = visibleSteps[stepIndex - 1];
                                const showActionHeader = !(prev?.type === StepType.THOUGHT && prev?.textContent?.search(/\s*Act:\s*/i) !== -1);
                                return (
                                    <div key={step.id} className="tool-call-block">
                                        {showActionHeader && (
                                            <div className="flex items-center mb-2 space-x-2">
                                                <span className="text-blue-600 text-lg">⚙️</span>
                                                <h4 className="text-sm font-semibold text-gray-700">Action:</h4>
                                            </div>
                                        )}
                                        <div className="pl-6 ml-2 space-y-2">
                                            {step.toolCalls.map((toolCall: ToolCallData, index: number) => {
                                                const isSuccess = toolCall.status === ToolCallStatus.SUCCESS;
                                                const executionTime = toolCall.executionTimeMs ?? '...';
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedToolCall(toolCall)}
                                                        className="w-full flex items-center justify-between text-left p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-500 transition-all"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            {isSuccess ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                                            <div className="text-sm">
                                                                <span className="font-semibold text-gray-800">{toolCall.toolName}</span>
                                                                <span className="text-gray-500 ml-2">({executionTime} ms)</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-500">View Details</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                </div>
            </div>
        </>
    );
});
 
export default InteractiveReasoning;
