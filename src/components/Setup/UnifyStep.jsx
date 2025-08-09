import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';

const UnifyStep = ({ apiForm, onUnify, isLoading }) => {
    return (
        <div className="space-y-4">
            {/* Status of previous steps */}
            <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Swagger Uploaded</h4>
                            <p className="text-sm text-green-700">Ready for unification</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Postman Uploaded</h4>
                            <p className="text-sm text-green-700">Ready for unification</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unification information */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Ready to Unify</h4>
                <p className="text-sm text-blue-700">
                    Both collections have been uploaded successfully. The unification process will:
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Merge Swagger documentation with Postman examples</li>
                    <li>Create a unified knowledge base for your API</li>
                    <li>Enable intelligent chat interactions</li>
                    <li>Generate contextual responses based on your API structure</li>
                </ul>
            </div>

            {/* API Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">API Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {apiForm.name}</p>
                    <p><span className="font-medium">Team:</span> {apiForm.team || 'Default'}</p>
                    {apiForm.description && (
                        <p><span className="font-medium">Description:</span> {apiForm.description}</p>
                    )}
                </div>
            </div>

            <button
                onClick={onUnify}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
                <Zap className="w-4 h-4 mr-2" />
                {isLoading ? 'Unifying...' : 'Unify API & Complete Setup'}
            </button>

            {isLoading && (
                <div className="text-center text-sm text-gray-500">
                    <div className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Processing your API collections...
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifyStep;