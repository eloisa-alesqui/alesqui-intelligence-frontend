import React from 'react';
import { Save } from 'lucide-react';

const ConfigurationStep = ({ config, setConfig, onSave, isLoading, apiName }) => {
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // For numeric fields, convert the value to a number
        const finalValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value);
        
        setConfig({ [name]: finalValue });
    };

    return (
        <div className="space-y-6">
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">Final Step: Configure API Execution</h4>
                <p className="mt-1 text-sm text-blue-700">
                    You are configuring the runtime behavior for the <span className="font-semibold">{apiName}</span> API. These settings determine how Alesqui Intelligence will interact with it.
                </p>
            </div>

            {/* Base URL */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Base URL (Optional)</label>
                <input
                    type="text"
                    name="baseUrl"
                    value={config.baseUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., https://api.example.com/v1"
                />
                <p className="mt-1 text-xs text-gray-500">Overrides the URL from the Swagger/Postman files if specified.</p>
            </div>

            {/* Technical Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Timeout (seconds)</label>
                    <input type="number" name="timeoutSeconds" value={config.timeoutSeconds} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Max Retries</label>
                    <input type="number" name="maxRetries" value={config.maxRetries} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>

            {/* Auth Section */}
            <div className="border-t pt-6">
                <h4 className="font-medium text-gray-800 mb-3">Authentication</h4>
                <div className="flex items-center space-x-3">
                    <input
                        id="authRequired"
                        type="checkbox"
                        name="authRequired"
                        checked={config.authRequired}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="authRequired" className="text-sm font-medium text-gray-700">Authentication Required</label>
                </div>

                {config.authRequired && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pl-1">
                        <div>
                            <label className="block text-sm font-medium">Auth Type</label>
                            <select name="authType" value={config.authType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Bearer</option>
                                <option>Basic</option>
                                <option>ApiKey</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Auth Token or Key</label>
                            <input
                                type="password"
                                name="authToken"
                                value={config.authToken}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Enter your secret token"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Logging and Rate Limit */}
             <div className="border-t pt-6 space-y-4">
                 <div className="flex items-center space-x-3">
                    <input id="enableLogging" type="checkbox" name="enableLogging" checked={config.enableLogging} onChange={handleChange} className="h-4 w-4 rounded" />
                    <label htmlFor="enableLogging" className="text-sm font-medium text-gray-700">Enable Request/Response Logging</label>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Limit (requests per second)</label>
                    <input type="number" name="rateLimit" value={config.rateLimit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    <p className="mt-1 text-xs text-gray-500">Set to 0 for no limit.</p>
                </div>
            </div>


            <button
                onClick={onSave}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Configuration & Finish'}
            </button>
        </div>
    );
};

export default ConfigurationStep;
