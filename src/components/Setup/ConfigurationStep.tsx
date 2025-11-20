import React, { ElementType } from 'react';
import { Save, Lock, Timer, Zap, Settings, Users } from 'lucide-react';
import { ApiConfig } from '../../types'; // Import the main config type
import { Group } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

/** Props for the generic InputField component. */
interface InputFieldProps {
    name: string;
    label: string;
    value?: string | number;
    type?: string;
    placeholder?: string;
    helpText?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

/**
 * A reusable, styled text input field for forms.
 * Supports various types like 'text', 'password', etc.
 */
const InputField: React.FC<InputFieldProps> = ({ name, label, value, type = 'text', placeholder, helpText, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={name}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}
    </div>
);

/** Props for the generic SliderInputField component. */
interface SliderInputFieldProps {
    label: string;
    name: string;
    value?: number;
    min: number;
    max: number;
    step?: number;
    unit: string;
    helpText?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A reusable, styled range slider input for forms.
 * Displays the current value alongside the slider for better UX.
 */
const SliderInputField: React.FC<SliderInputFieldProps> = ({ label, name, value, min, max, step = 1, unit, helpText, onChange }) => (
    <div>
        <label htmlFor={name} className="flex justify-between text-sm font-medium text-gray-700">
            <span>{label}</span>
            <span className="font-semibold text-indigo-600">{value}{unit}</span>
        </label>
        <input
            id={name}
            type="range"
            name={name}
            min={min}
            max={max}
            step={step}
            value={value || min}
            onChange={onChange}
            className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}
    </div>
);

/** Props for the generic Section component. */
interface SectionProps {
    title: string;
    icon: ElementType; // Expects a component (like a lucide-react icon)
    children: React.ReactNode;
}

/**
 * A reusable container component that wraps content in a styled card
 * with a title and an icon, creating visually distinct sections in a form.
 */
const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
    <div className="border border-gray-200/80 bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200/80">
            <div className="flex items-center space-x-3">
                <Icon className="h-6 w-6 text-indigo-600" />
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            </div>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);


// --- Main ConfigurationStep Component ---

/**
 * Defines the properties required by the ConfigurationStep component.
 */
interface ConfigurationStepProps {
    /** The configuration state object, managed by a parent hook. */
    config: ApiConfig | null;
    /** A callback to update the configuration state. It handles nested properties via dot notation in the 'name' field. */
    setConfig: (name: string, value: string | number | boolean) => void;
    /** A callback to trigger the final save action for the configuration. */
    onSave: () => void;
    /** A boolean flag to indicate if the save process is currently active. */
    isLoading: boolean;
    /** The name of the API being configured, used for display purposes in the UI. */
    apiName: string;
    /** Optional title to display in the header banner. Defaults to the 'Final Step' text. */
    title?: string;
    /** Optional description to display in the header banner. Defaults to the original text. */
    description?: string;
    /** Optional text for the main save button. Defaults to 'Save Configuration & Finish'. */
    saveButtonText?: string;
    /** Available groups for selection (IT: user's groups, SUPERADMIN: all groups) */
    availableGroups?: Group[];
    /** Currently selected group IDs */
    selectedGroupIds?: string[];
    /** Callback to update selected group IDs */
    onGroupSelectionChange?: (groupIds: string[]) => void;
}

/**
 * The main component for Step 4 of the API setup. It renders a form with all
 * the necessary fields to configure the API's runtime behavior.
 */
const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ 
    config, 
    setConfig, 
    onSave, 
    isLoading, 
    apiName,
    title = 'Final Step: Configure API Execution',
    description,
    saveButtonText = 'Save Configuration & Finish',
    availableGroups = [],
    selectedGroupIds = [],
    onGroupSelectionChange
}) => {
    const { user } = useAuth();
    
    // Render nothing if the configuration object is not yet available.
    // This acts as a guard against rendering with an incomplete or null initial state.
    if (!config || !config.auth) {
        return null;
    }

    const isTrial = user?.authorities?.includes('ROLE_TRIAL') || false;
    const isSuperAdmin = user?.authorities?.includes('ROLE_SUPERADMIN') || false;
    const isIT = user?.authorities?.includes('ROLE_IT') || false;
    const showGroupSelector = (isSuperAdmin || isIT) && availableGroups.length > 0;

    /**
     * Handles the selection/deselection of groups
     */
    const handleGroupToggle = (groupId: string) => {
        if (!onGroupSelectionChange) return;
        
        const newSelectedIds = selectedGroupIds.includes(groupId)
            ? selectedGroupIds.filter(id => id !== groupId)
            : [...selectedGroupIds, groupId];
        
        onGroupSelectionChange(newSelectedIds);
    };

    /**
     * A generic change handler for all form inputs in this component.
     * It determines the correct value based on input type (e.g., checkbox, range)
     * and calls the `setConfig` callback with the input's name and final value.
     * @param e The React change event from an input or select element.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        const isCheckbox = type === 'checkbox';
        const finalValue = isCheckbox
            ? (e.target as HTMLInputElement).checked
            : (type === 'number' || type === 'range' ? parseInt(value, 10) : value);

        setConfig(name, finalValue);
    };

    return (
        <div className="space-y-8">
            {/* Introductory banner for the final step */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-medium text-blue-800">
                    {title} 
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                    {description || `You are configuring the runtime behavior for the ${apiName} API. These settings determine how the system will interact with it.`}
                </p>
            </div>

            {/* Group Selection Section - Only for IT and SUPERADMIN */}
            {showGroupSelector && (
                <Section title="Group Assignment" icon={Users}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {isSuperAdmin ? 'Select groups to assign this API to (multiple selection)' : 'Select your groups to assign this API to (multiple selection)'}
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                            {isSuperAdmin 
                                ? 'Select all groups that should have access to this API. You can select multiple groups.' 
                                : 'Select which of your groups should have access to this API. You can select multiple groups.'}
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
                            {availableGroups.map(group => (
                                <label
                                    key={group.id}
                                    className="flex items-start space-x-3 p-3 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-indigo-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGroupIds.includes(group.id)}
                                        onChange={() => handleGroupToggle(group.id)}
                                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">{group.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">({group.code})</span>
                                        </div>
                                        {group.description && (
                                            <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* General Settings Section */}
            <Section title="General Configuration" icon={Settings}>
                <InputField
                    name="baseUrl"
                    label="Base URL (Optional)"
                    value={config.baseUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://api.example.com/v1"
                    helpText="Overrides the URL from the Swagger/Postman files if specified."
                />
            </Section>

            {/* Network Settings Section */}
            <Section title="Network Configuration" icon={Timer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SliderInputField
                        label="Timeout"
                        name="timeoutSeconds"
                        value={config.timeoutSeconds}
                        onChange={handleChange}
                        min={5}
                        max={180}
                        unit="s"
                        helpText="Maximum time to wait for a response. Recommended: 30s."
                    />
                    <SliderInputField
                        label="Max Retries"
                        name="maxRetries"
                        value={config.maxRetries}
                        onChange={handleChange}
                        min={0}
                        max={10}
                        unit=""
                        helpText="How many times to retry a failed request."
                    />
                </div>
            </Section>
            
            {/* Authentication Settings Section */}
            <Section title="Authentication" icon={Lock}>
                {/* Dropdown to select authentication type */}
                <div className="relative">
                    <label htmlFor="auth.authType" className="block text-sm font-medium text-gray-700">Authentication Type</label>
                    <select
                        id="auth.authType"
                        name="auth.authType"
                        value={config.auth.authType}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    >
                        <option value="none">No Authentication</option>
                        <option value="api_key">API Key</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="basic">Basic Auth</option>
                        <option value="oauth2">OAuth 2.0</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                {/* Container for authentication fields that are conditionally rendered based on the selected type */}
                {config.auth.authType !== 'none' && (
                    <div className="mt-6 p-5 bg-slate-50 rounded-md space-y-4 border border-slate-200">
                        {config.auth.authType === 'api_key' && (
                            <>
                                <InputField name="auth.apiKeyName" label="Header/Query Name" value={config.auth.apiKeyName} onChange={handleChange} />
                                <InputField name="auth.apiKey" label="API Key Value" value={config.auth.apiKey} onChange={handleChange} type="password" placeholder="Enter your secret key" />
                                <div className="relative">
                                    <label htmlFor="auth.addApiKeyTo" className="block text-sm font-medium">Add Key To</label>
                                    <select
                                        id="auth.addApiKeyTo"
                                        name="auth.addApiKeyTo"
                                        value={config.auth.addApiKeyTo}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                    >
                                        <option value="header">Header</option>
                                        <option value="query">Query Parameter</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </>
                        )}

                        {config.auth.authType === 'bearer' && (
                            <InputField name="auth.bearerToken" label="Bearer Token" value={config.auth.bearerToken} onChange={handleChange} type="password" placeholder="Enter your bearer token" />
                        )}

                        {config.auth.authType === 'basic' && (
                            <>
                                <InputField name="auth.basicAuthUsername" label="Username" value={config.auth.basicAuthUsername} onChange={handleChange} placeholder="Enter username" />
                                <InputField name="auth.basicAuthPassword" label="Password" value={config.auth.basicAuthPassword} onChange={handleChange} type="password" placeholder="Enter password" />
                            </>
                        )}
                        
                        {config.auth.authType === 'oauth2' && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="auth.oauth2.grantType" className="block text-sm font-medium">OAuth 2.0 Grant Type</label>
                                    <select
                                        id="auth.oauth2.grantType"
                                        name="auth.oauth2.grantType"
                                        value={config.auth.oauth2?.grantType || 'client_credentials'}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
                                    >
                                        <option value="client_credentials">Client Credentials</option>
                                        <option value="password">Password</option>
                                    </select>
                                </div>

                                <InputField name="auth.oauth2.tokenUrl" label="Token URL" value={config.auth.oauth2?.tokenUrl} onChange={handleChange} />
                                <InputField name="auth.oauth2.clientId" label="Client ID" value={config.auth.oauth2?.clientId} onChange={handleChange} />
                                <InputField name="auth.oauth2.clientSecret" label="Client Secret" value={config.auth.oauth2?.clientSecret} onChange={handleChange} type="password" />
                                <InputField name="auth.oauth2.scopes" label="Scopes (space-separated)" value={config.auth.oauth2?.scopes} onChange={handleChange} />
                                
                                {config.auth.oauth2?.grantType === 'password' && (
                                    <div className="mt-4 pt-4 border-t border-slate-300 space-y-4">
                                        <p className="text-sm font-medium text-gray-700">Resource Owner Credentials</p>
                                        <InputField name="auth.oauth2.username" label="Username" value={config.auth.oauth2?.username} onChange={handleChange} />
                                        <InputField name="auth.oauth2.password" label="Password" value={config.auth.oauth2?.password} onChange={handleChange} type="password" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Section>

            {/* Advanced Settings Section */}
            <Section title="Advanced Settings" icon={Zap}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="enableLogging" type="checkbox" name="enableLogging" checked={config.enableLogging} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enableLogging" className="font-medium text-gray-700">Enable Logging</label>
                        <p className="text-xs text-gray-500">Logs API requests and responses. Useful for debugging.</p>
                    </div>
                </div>
                 <SliderInputField
                    label="Rate Limit"
                    name="rateLimit"
                    value={config.rateLimit}
                    onChange={handleChange}
                    min={0}
                    max={100}
                    unit=" req/s"
                    helpText="Requests per second. Use 0 for no limit."
                />
            </Section>

            {/* Final Save Button to submit the configuration */}
            <div className="pt-5">
                <button
                    onClick={onSave}
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {isLoading ? 'Saving...' : saveButtonText}
                </button>
            </div>
        </div>
    );
};

export default ConfigurationStep;