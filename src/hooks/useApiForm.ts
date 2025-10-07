import { useState, useRef } from 'react';
import { useNotifications, NotificationType } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { apiUnificationService } from '../services/apiUnificationService';
import { swaggerService } from '../services/swaggerService';
import { postmanService } from '../services/postmanService';
import { ApiConfig, ApiFormState } from '../types';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * Defines the props required by the useApiForm hook.
 */
interface UseApiFormProps {
    /** A callback function to be executed when the entire API configuration is successfully completed. */
    onApiConfigured: (newApi: any) => void;
}

// ================================================================================================
// INITIAL STATE CONSTANTS
// ================================================================================================

const initialApiForm: ApiFormState = {
    name: '',
    team: '',
    description: '',
    swaggerFile: null,
    postmanFile: null,
    swaggerUploaded: false,
    postmanUploaded: false,
};

const initialApiConfiguration: ApiConfig = {
    baseUrl: '',
    timeoutSeconds: 30,
    maxRetries: 3,
    enableLogging: true,
    rateLimit: 0,
    auth: {
        authType: 'none', // Estado inicial limpio
    }
};

// ================================================================================================
// CUSTOM HOOK
// ================================================================================================

/**
 * A custom hook to manage the complex state and logic of the multi-step API configuration form.
 *
 * It encapsulates form data, step management, loading states, and all asynchronous
 * operations like file uploads and API unification. It uses the NotificationContext
 * to provide user feedback and the AuthContext to associate actions with the current user.
 *
 * @param props The props for the hook, including the onApiConfigured callback.
 */
export const useApiForm = ({ onApiConfigured }: UseApiFormProps) => {
    const { addNotification } = useNotifications();
    const { user } = useAuth();

    const [apiForm, setApiForm] = useState<ApiFormState>(initialApiForm);
    const [apiConfig, setApiConfig] = useState<ApiConfig>(initialApiConfiguration);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const swaggerFileRef = useRef<HTMLInputElement>(null);
    const postmanFileRef = useRef<HTMLInputElement>(null);

    const updateForm = (updates: Partial<ApiFormState>) => {
        setApiForm(prev => ({ ...prev, ...updates }));
    };

    const updateApiConfig = (field: string, value: any) => {
        setApiConfig(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            
            const keys = field.split('.');
            let currentLevel = newState;
    
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (currentLevel[key] === undefined || currentLevel[key] === null) {
                    currentLevel[key] = {};
                }
                currentLevel = currentLevel[key];
            }
    
            currentLevel[keys[keys.length - 1]] = value;
    
            return newState;
        });
    };

    const resetForm = () => {
        setApiForm(initialApiForm);
        setApiConfig(initialApiConfiguration);
        setCurrentStep(1);
        if (swaggerFileRef.current) swaggerFileRef.current.value = '';
        if (postmanFileRef.current) postmanFileRef.current.value = '';
    };

    const handleSwaggerUpload = async () => {
        if (!apiForm.swaggerFile || !apiForm.name) {
            addNotification('Please provide an API name and select a Swagger file', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await swaggerService.importFromFile(
                apiForm.swaggerFile, {
                    name: apiForm.name,
                    team: apiForm.team || 'Default',
                    createdBy: user?.sub || 'unknown-user',
                    description: apiForm.description
                }
            );
            addNotification('Swagger file uploaded successfully', 'success');
            updateForm({ swaggerUploaded: true });
            setCurrentStep(2);
        } catch (error: any) {
            addNotification(`Error uploading Swagger: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostmanUpload = async () => {
        if (!apiForm.postmanFile) {
            addNotification('Please select a Postman file', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            await postmanService.importFromFile(
                apiForm.postmanFile, {
                    name: apiForm.name,
                    team: apiForm.team || 'Default',
                    createdBy: user?.sub || 'unknown-user',
                    description: apiForm.description
                }
            );
            addNotification('Postman collection uploaded successfully', 'success');
            updateForm({ postmanUploaded: true });
            setCurrentStep(3);
        } catch (error: any) {
            addNotification(`Error uploading Postman: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnifyAPI = async () => {
        setIsLoading(true);
        try {
            await apiUnificationService.unifyAndSaveApiDocuments(apiForm.name);
            addNotification(`API '${apiForm.name}' unified successfully`, 'success');
            setCurrentStep(4);
        } catch (error: any) {
            addNotification(`Error unifying API: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfiguration = async () => {
        setIsLoading(true);
        try {
            const updatedDocument = await apiUnificationService.updateConfiguration(apiForm.name, apiConfig);
            addNotification(`Configuration for '${apiForm.name}' saved successfully`, 'success');
            onApiConfigured(updatedDocument);
            resetForm();
            addNotification('API setup complete! You can now start chatting.', 'info');
        } catch (error: any) {
            addNotification(`Error saving configuration: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        apiForm,
        apiConfig,
        currentStep,
        isLoading,
        swaggerFileRef,
        postmanFileRef,
        updateForm,
        updateApiConfig,
        resetForm,
        handleSwaggerUpload,
        handlePostmanUpload,
        handleUnifyAPI,
        handleSaveConfiguration,
        handleSkipPostman: () => setCurrentStep(3),
    };
};