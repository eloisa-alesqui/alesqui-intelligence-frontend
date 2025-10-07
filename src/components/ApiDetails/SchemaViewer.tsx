import { SchemaProperty, Schema } from '../../types';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const SchemaPropertyRow: React.FC<{
    propName: string;
    propData: SchemaProperty;
    isRequired: boolean;
    schemas: { [key: string]: Schema };
    level: number;
}> = ({ propName, propData, isRequired, schemas, level }) => {
    const [isOpen, setIsOpen] = useState(level < 1);

    const isExpandable = (propData.properties || (propData.type === 'array' && propData.items?.$ref) || propData.$ref);
    const referencedSchemaName = propData.$ref?.split('/').pop() || propData.items?.$ref?.split('/').pop();
    const referencedSchema = referencedSchemaName ? schemas[referencedSchemaName] : null;
    let displayType = propData.type;
    if (referencedSchemaName) displayType = referencedSchemaName;
    
    return (
        <div style={{ paddingLeft: `${level * 24}px` }} className="text-sm border-t border-gray-100 py-2">
            <div className={`flex items-start ${isExpandable ? 'cursor-pointer' : ''}`} onClick={() => isExpandable && setIsOpen(!isOpen)}>
                {isExpandable ? <ChevronRight size={16} className={`mr-2 mt-0.5 flex-shrink-0 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} /> : <div className="w-6 mr-2 flex-shrink-0"></div>}
                <div className="w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-gray-800">{propName}</span>
                        <span className="font-mono text-blue-600">
                            {displayType}
                            {/* **CORRECCIÓN**: Mostrar el format si existe */}
                            {propData.format && <span className="text-gray-500 ml-1">({propData.format})</span>}
                        </span>
                        {isRequired && <span className="text-red-500 text-xs font-bold">required</span>}
                    </div>
                    {propData.description && <div className="text-gray-600 mt-1">{propData.description}</div>}
                    {propData.example !== undefined && <div className="text-xs mt-1"><span className="text-gray-500">Example: </span><code className="bg-gray-100 p-1 rounded">{JSON.stringify(propData.example)}</code></div>}
                </div>
            </div>
            {isOpen && isExpandable && (
                <div className="mt-2">
                    {propData.properties && Object.entries(propData.properties).map(([childName, childProp]) => <SchemaPropertyRow key={childName} propName={childName} propData={childProp as SchemaProperty} isRequired={propData.required?.includes(childName) || false} schemas={schemas} level={level + 1} />)}
                    {referencedSchema?.properties && Object.entries(referencedSchema.properties).map(([childName, childProp]) => <SchemaPropertyRow key={childName} propName={childName} propData={childProp as SchemaProperty} isRequired={referencedSchema.required?.includes(childName) || false} schemas={schemas} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};

// --- Contenedor Principal para el Schema Interactivo ---
export const SchemaViewer: React.FC<{ schemaRef: string; schemas: { [key: string]: any } }> = ({ schemaRef, schemas }) => {
    const schemaName = schemaRef.split('/').pop() || '';
    const schema = schemas[schemaName];
    if (!schema) return <div className="text-gray-500 p-4">Schema "{schemaName}" not found</div>;

    return (
        <div className="bg-white rounded-md border border-gray-200">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold">{schemaName}</h4>
                {schema.description && <p className="text-sm text-gray-600 mt-1">{schema.description}</p>}
            </div>
            <div>
                {schema.properties && Object.entries(schema.properties).map(([name, property]) => (
                    <SchemaPropertyRow 
                        key={name}
                        propName={name} 
                        propData={property as SchemaProperty}
                        isRequired={schema.required?.includes(name) || false}
                        schemas={schemas}
                        level={0}
                    />
                ))}
            </div>
        </div>
    );
};