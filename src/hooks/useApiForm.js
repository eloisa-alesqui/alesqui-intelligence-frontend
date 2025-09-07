import { useState, useRef } from 'react';
import { apiService } from '../services/apiService';
import { apiUnificationService } from '../services/apiUnificationService';
import { swaggerService } from '../services/swaggerService';
import { postmanService } from '../services/postmanService';

const initialApiForm = {
    name: '',
    team: '',
    description: '',
    swaggerFile: null,
    postmanFile: null,
    swaggerUploaded: false,
    postmanUploaded: false,
    unified: false
};

const initialApiConfiguration = {
    baseUrl: '',
    timeoutSeconds: 30,
    headers: {}, 
    authRequired: false,
    authToken: '',
    authType: 'Bearer',
    maxRetries: 3,
    enableLogging: true,
    rateLimit: 0,
};

export const useApiForm = (addNotification, onApiConfigured) => {
    const [apiForm, setApiForm] = useState(initialApiForm);
    const [apiConfig, setApiConfig] = useState(initialApiConfiguration);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const swaggerFileRef = useRef(null);
    const postmanFileRef = useRef(null);

    const updateForm = (updates) => {
        setApiForm(prev => ({ ...prev, ...updates }));
    };

    const updateApiConfig = (updates) => {
        setApiConfig(prev => ({ ...prev, ...updates }));
    };

    const resetForm = () => {
        setApiForm(initialApiForm);
        setCurrentStep(1);
        if (swaggerFileRef.current) swaggerFileRef.current.value = '';
        if (postmanFileRef.current) postmanFileRef.current.value = '';
    };

    const handleSwaggerUpload = async () => {
        if (!apiForm.swaggerFile || !apiForm.name) {
            addNotification('Please select a Swagger file and provide an API name', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await swaggerService.importFromFile(
                apiForm.swaggerFile,
                {
                    name: apiForm.name,
                    team: apiForm.team || 'Default',
                    createdBy: 'current-user',
                    description: apiForm.description
                }
            );
            addNotification('Swagger collection uploaded successfully');
            setApiForm(prev => ({ ...prev, swaggerUploaded: true }));
            setCurrentStep(2);
        } catch (error) {
            addNotification('Error uploading Swagger collection: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostmanUpload = async () => {
        if (!apiForm.postmanFile) {
            addNotification('Please select a Postman file', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await postmanService.importFromFile(
                apiForm.postmanFile,
                {
                    name: apiForm.name,
                    team: apiForm.team || 'Default',
                    description: apiForm.description
                }
            );

            addNotification('Postman collection uploaded successfully');
            setApiForm(prev => ({ ...prev, postmanUploaded: true }));
            setCurrentStep(3);
        } catch (error) {
            addNotification('Error uploading Postman collection: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipPostman = () => {
        setCurrentStep(3);
    };

    const handleUnifyAPI = async () => {
        setIsLoading(true);
        try {
            await apiUnificationService.unifyAndSaveApiDocuments(apiForm.name);
            addNotification(`API ${apiForm.name} unified successfully`);
            
            setCurrentStep(4); 
            
        } catch (error) {
            addNotification('Error unifying API: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfiguration = async () => {
        setIsLoading(true);
        try {
            await apiUnificationService.updateConfiguration(apiForm.name, apiConfig);

            addNotification(`Configuration for ${apiForm.name} saved successfully`);
            
            // Now we finish the flow by calling the callback and resetting the form.
            const newApi = {
                id: apiForm.name, // Use a more stable ID if available from the backend response
                name: apiForm.name,
                team: apiForm.team || 'Default',
                description: apiForm.description || '',
                dateConfigured: new Date().toLocaleDateString()
            };
            onApiConfigured(newApi);
            resetForm();
            addNotification('API setup complete! You can now start chatting.');

        } catch (error) {
            addNotification('Error saving configuration: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        apiForm,
        currentStep,
        isLoading,
        swaggerFileRef,
        postmanFileRef,
        updateForm,
        resetForm,
        handleSwaggerUpload,
        handlePostmanUpload,
        handleSkipPostman,
        apiConfig,
        updateApiConfig,
        handleUnifyAPI,
        handleSaveConfiguration
    };
};