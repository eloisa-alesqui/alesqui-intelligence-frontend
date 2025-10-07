import { SchemaViewer } from './SchemaViewer';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { ApiDocument, Endpoint, Parameter, Schema, SchemaProperty } from '../../types';

// --- Constantes de Estilo ---
const methodColors: { [key: string]: string } = {
    GET: 'bg-blue-600 text-white',
    POST: 'bg-green-600 text-white',
    PUT: 'bg-orange-500 text-white',
    DELETE: 'bg-red-600 text-white',
    PATCH: 'bg-purple-600 text-white',
};

const methodBgColors = {
    GET: 'bg-blue-50 border-blue-200',
    POST: 'bg-green-50 border-green-200',
    PUT: 'bg-orange-50 border-orange-200',
    DELETE: 'bg-red-50 border-red-200',
    PATCH: 'bg-purple-50 border-purple-200',
};

const responseCodeColors: { [key: string]: string } = {
    '2': 'bg-green-100 text-green-800',
    '4': 'bg-yellow-100 text-yellow-800',
    '5': 'bg-red-100 text-red-800',
};

// --- Componentes Auxiliares ---

const generateSchemaExample = (ref: string, allSchemas: { [key: string]: any }): object | null => {
    const schemaName = ref.split('/').pop() || '';
    const schema = allSchemas[schemaName];
    if (!schema || !schema.properties) return null;

    const example: { [key: string]: any } = {};
    Object.entries(schema.properties).forEach(([key, prop]) => {
        const property = prop as SchemaProperty;
        if (property.example !== undefined) {
            example[key] = property.example;
        } else if (property.$ref) {
            example[key] = generateSchemaExample(property.$ref, allSchemas);
        } else if (property.type === 'array' && property.items?.$ref) {
            example[key] = [generateSchemaExample(property.items.$ref, allSchemas)];
        } else {
            // Lógica mejorada para tipos básicos
            switch (property.type) {
                case 'string':
                    if (property.format === 'date-time') {
                        example[key] = new Date().toISOString();
                    } else if (property.format === 'date') {
                        example[key] = new Date().toISOString().split('T')[0];
                    } else if (property.format === 'email') {
                        example[key] = "user@example.com";
                    } else if (property.format === 'uuid') {
                        example[key] = "123e4567-e89b-12d3-a456-426614174000";
                    } else if (property.format === 'uri') {
                        example[key] = "https://example.com";
                    } else {
                        example[key] = property.defaultValue || "string";
                    }
                    break;
                case 'integer':
                    example[key] = property.defaultValue || 0;
                    break;
                case 'number':
                    example[key] = property.defaultValue || 0.0;
                    break;
                case 'boolean':
                    example[key] = property.defaultValue || true;
                    break;
                case 'array':
                    example[key] = [];
                    break;
                default:
                    example[key] = {};
                    break;
            }
        }
    });
    return example;
};

const CodeBlock: React.FC<{ content: any; onCopy: () => void }> = ({ content, onCopy }) => {
    let textContent: string;
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        textContent = JSON.stringify(parsed, null, 2);
    } catch {
        textContent = String(content);
    }

    return (
        <div className="relative">
            <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
                <code>{textContent}</code>
            </pre>
            <button
                onClick={(e) => { e.stopPropagation(); onCopy(); }}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
                <Copy size={16} className="text-gray-300" />
            </button>
        </div>
    );
};

// **COMPONENTE ACTUALIZADO**
const ContentTabs: React.FC<{ content: any; schemas: { [key: string]: any }; onCopy: (text: string) => void }> = ({ content, schemas, onCopy }) => {
    const schemaDefinition = content?.schema;
    const schemaRef = schemaDefinition?.$ref;
    const directExample = content?.example;
    const exampleValue = directExample || (schemaRef ? generateSchemaExample(schemaRef, schemas) : null);

    // Si no hay absolutamente nada que mostrar, no renderizar el componente
    if (!exampleValue && !schemaDefinition) {
        return null;
    }

    const [activeTab, setActiveTab] = useState<'example' | 'schema'>(exampleValue ? 'example' : 'schema');
    const textToCopy = typeof exampleValue === 'string' ? exampleValue : JSON.stringify(exampleValue, null, 2);

    return (
        <div className="border border-gray-200 rounded-lg mt-2">
            <div className="flex border-b border-gray-200 bg-gray-50">
                {exampleValue && <button onClick={(e) => { e.stopPropagation(); setActiveTab('example'); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'example' ? 'border-b-2 border-blue-500 text-blue-600 bg-white' : 'text-gray-600'}`}>Example</button>}
                {/* La pestaña Schema se muestra si hay cualquier definición de esquema */}
                {schemaDefinition && <button onClick={(e) => { e.stopPropagation(); setActiveTab('schema'); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'schema' ? 'border-b-2 border-blue-500 text-blue-600 bg-white' : 'text-gray-600'}`}>Schema</button>}
            </div>
            <div className="p-4 bg-white">
                {activeTab === 'example' && exampleValue && <CodeBlock content={exampleValue} onCopy={() => onCopy(textToCopy)} />}
                {activeTab === 'schema' && schemaDefinition && (
                    // Si es un esquema complejo con $ref, usa el visor interactivo. Si no, muestra el JSON simple.
                    schemaRef ? (
                        <SchemaViewer schemaRef={schemaRef} schemas={schemas} />
                    ) : (
                        <pre className="text-sm bg-gray-100 p-3 rounded-md"><code>{JSON.stringify(schemaDefinition, null, 2)}</code></pre>
                    )
                )}
            </div>
        </div>
    );
};

// --- Componente Principal ---
export const EndpointList: React.FC<{ api: ApiDocument }> = ({ api }) => {
    const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
    
    const schemas = api.schemas || {};
    const shouldGroup = api.tags && api.tags.length > 0;

    const groupedEndpoints = (api.endpoints || []).reduce((acc, endpoint) => {
        const groupName = shouldGroup ? (endpoint.tags?.[0] || 'Other') : 'Endpoints';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(endpoint);
        return acc;
    }, {} as Record<string, Endpoint[]>);

    const toggleEndpoint = (endpointId: string) => {
        const newExpanded = new Set(expandedEndpoints);
        newExpanded.has(endpointId) ? newExpanded.delete(endpointId) : newExpanded.add(endpointId);
        setExpandedEndpoints(newExpanded);
    };

    const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="space-y-8">
            {Object.entries(groupedEndpoints).map(([groupName, endpoints]) => (
                <div key={groupName}>
                    <div className="pb-2 mb-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">{groupName}</h2>
                        {shouldGroup && <p className="text-sm text-gray-500 mt-1">{api.tags?.find(t => t.name === groupName)?.description}</p>}
                    </div>
                    <div className="space-y-2">
                        {endpoints.map((endpoint) => {
                            const endpointId = `${endpoint.method}-${endpoint.path}`;
                            const isExpanded = expandedEndpoints.has(endpointId);
                            const bgColorClass = methodBgColors[endpoint.method as keyof typeof methodBgColors] || 'bg-gray-50 border-gray-200';

                            return (
                                <div key={endpointId} className={`rounded-lg shadow-sm overflow-hidden transition-all ${isExpanded ? `border-l-4 ${bgColorClass}` : 'border border-gray-200'}`}>
                                    <div className="flex items-center p-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleEndpoint(endpointId)}>
                                        <span className={`w-20 text-center font-bold text-sm py-1 rounded ${methodColors[endpoint.method] || 'bg-gray-500 text-white'}`}>{endpoint.method}</span>
                                        <span className="ml-4 font-mono text-sm flex-grow">{endpoint.path}</span>
                                        <span className="text-sm text-gray-600 mx-4 hidden md:block">{endpoint.summary}</span>
                                        <ChevronRight className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} size={20} />
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4 border-t border-gray-200 space-y-4">
                                            {endpoint.description && <p className="text-sm text-gray-700">{endpoint.description}</p>}
                                            
                                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Parameters</h4>
                                                    <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-200">
                                                        {endpoint.parameters.map((param: Parameter) => (
                                                            <div key={param.name} className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold font-mono text-sm">{param.name}</span>
                                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">{param.in}</span>
                                                                    {param.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">REQUIRED</span>}
                                                                </div>
                                                                {param.description && <p className="text-sm text-gray-600 mt-1">{param.description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {endpoint.requestBody && (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-800">Request Body</h4>
                                                        {endpoint.requestBody.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">REQUIRED</span>}
                                                    </div>
                                                    <ContentTabs content={endpoint.requestBody.content?.['application/json']} schemas={schemas} onCopy={copyToClipboard} />
                                                </div>
                                            )}
                                            
                                            {endpoint.responses && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Responses</h4>
                                                    <div className="space-y-3">
                                                        {Object.entries(endpoint.responses).map(([code, response]) => (
                                                            <div key={code} className="border border-gray-200 rounded-lg bg-white p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`font-bold text-sm px-2 py-1 rounded-md ${responseCodeColors[code.charAt(0) as keyof typeof responseCodeColors] || 'bg-gray-100'}`}>{code}</span>
                                                                    <p className="text-sm text-gray-700">{response.description}</p>
                                                                </div>
                                                                <ContentTabs content={response.content?.['application/json'] || response.content?.['*/*']} schemas={schemas} onCopy={copyToClipboard} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};