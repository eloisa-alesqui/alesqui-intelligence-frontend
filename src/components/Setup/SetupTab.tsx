import React, { useState, useEffect, useCallback } from 'react';
import { apiService, ApiDocument } from '../../services/apiService';
import { useNotifications } from '../../context/NotificationContext';
import { useApiForm } from '../../hooks/useApiForm';

import StepProgress from './StepProgress';
import SwaggerStep from './SwaggerStep';
import PostmanStep from './PostmanStep';
import UnifyStep from './UnifyStep';
import ConfigurationStep from './ConfigurationStep';
import ConfiguredApisSidebar from '../ApiList/ConfiguredApisSidebar';

/**
 * The main component for the "Setup" tab.
 *
 * It orchestrates a multi-step wizard for configuring a new API by uploading
 * Swagger and Postman files. It uses the `useApiForm` hook to manage the
 * complex form state and logic. It also displays a sidebar with a list of
 * currently configured APIs.
 */
const SetupTab: React.FC = () => {
    const { addNotification } = useNotifications();

    const [configuredApis, setConfiguredApis] = useState<ApiDocument[]>([]);
    const [loadingApis, setLoadingApis] = useState(true);

    /**
     * Callback function passed to useApiForm. It's triggered when a new API
     * is successfully configured, then it reloads the list of APIs.
     */
    const handleApiConfigured = useCallback((newApi: ApiDocument) => {
        // We'll reload the list from the server to ensure data is fresh.
        loadApis();
    }, []); // Empty dependency array if loadApis is memoized or defined outside.

    const {
        apiForm,
        currentStep,
        isLoading,
        updateForm,
        resetForm,
        handleSwaggerUpload,
        handlePostmanUpload,
        handleSkipPostman,
        handleUnifyAPI,
        apiConfig,
        updateApiConfig,
        handleSaveConfiguration
    } = useApiForm({ onApiConfigured: handleApiConfigured });

    /**
     * Fetches the list of configured APIs from the server.
     * Memoized with useCallback to prevent re-creation on every render.
     */
    const loadApis = useCallback(async () => {
        try {
            setLoadingApis(true);
            const data = await apiService.getAllApisSimple();
            setConfiguredApis(data);
        } catch (error) {
            console.error('Error loading APIs:', error);
            addNotification('Error loading configured APIs', 'error');
        } finally {
            setLoadingApis(false);
        }
    }, [addNotification]);

    // Load APIs on initial component mount.
    useEffect(() => {
        loadApis();
    }, [loadApis]);

    /**
     * Handles the deletion of an API from the sidebar.
     * It calls the apiService to delete the document and then reloads the list.
     */
    const handleDeleteApi = async (apiId: string, apiName: string) => {
        // We use the apiName in the confirmation message, but only apiId for the call.
        try {
            // Call the service to delete the API from the backend.
            await apiService.deleteApi(apiId);
            
            // Show a success notification.
            addNotification(`API "${apiName}" deleted successfully`, 'success');
            
            // Reload the list of APIs to reflect the change in the UI.
            loadApis();

        } catch (error) {
            console.error(`Error deleting API ${apiName}:`, error);
            // Show an error notification if something goes wrong.
            addNotification(`Error deleting API "${apiName}"`, 'error');
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Configure your APIs in 5 minutes
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload your Swagger and Postman collections, unify the information, and get a powerful conversational AI for your internal APIs
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                <div className="w-full lg:flex-[2] xl:flex-[3]">
                    <div className="bg-white rounded-lg shadow p-6">

                        <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            {currentStep === 1 && 'Step 1: API Information & Swagger'}
                            {currentStep === 2 && 'Step 2: Postman Collection (Optional)'}
                            {currentStep === 3 && 'Step 3: Unify API'}
                            {currentStep === 4 && 'Step 4: API Execution Configuration'}
                        </h3>
                        <StepProgress currentStep={currentStep} apiForm={apiForm} steps={4} />
                        {currentStep === 1 && (
                            <SwaggerStep
                                apiForm={apiForm}
                                updateForm={updateForm}
                                onUpload={handleSwaggerUpload}
                                isLoading={isLoading}
                            />
                        )}
                        {currentStep === 2 && (
                            <PostmanStep
                                apiForm={apiForm}
                                updateForm={updateForm}
                                onUpload={handlePostmanUpload}
                                onSkip={handleSkipPostman}
                                isLoading={isLoading}
                            />
                        )}
                        {currentStep === 3 && (
                            <UnifyStep
                                apiForm={apiForm}
                                onUnify={handleUnifyAPI}
                                isLoading={isLoading}
                            />
                        )}
                        {currentStep === 4 && (
                            <ConfigurationStep
                                config={apiConfig}
                                setConfig={updateApiConfig}
                                onSave={handleSaveConfiguration}
                                isLoading={isLoading}
                                apiName={apiForm.name}
                            />
                        )}
                    </div>
                </div>

                <div className="w-full lg:flex-1 sticky top-8">
                    <ConfiguredApisSidebar
                        configuredApis={configuredApis}
                        onDeleteApi={handleDeleteApi}
                        loading={loadingApis}
                    />
                </div>
            </div>
        </div>
    );
};

export default SetupTab;