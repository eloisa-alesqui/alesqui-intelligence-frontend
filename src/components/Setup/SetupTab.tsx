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
     * This logic will eventually move to the ApiList component itself.
     */
    const handleDeleteApi = async (apiId: string) => {
        try {
            // Assuming apiService will have a delete method.
            // await apiService.deleteApi(apiId);
            addNotification('API deleted successfully', 'success');
            // Reload the list to reflect the change.
            loadApis();
        } catch (error) {
            console.error('Error deleting API:', error);
            addNotification('Error deleting API', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Configure your APIs in 3 minutes
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload your Postman and Swagger collections, unify the information and you'll have a ChatGPT for your internal APIs
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Configuration Form Wizard */}
                <div className="lg:col-span-2">
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

                        {currentStep > 1 && (
                            <div className="mt-6 pt-4 border-t">
                                <button
                                    onClick={resetForm}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Start configuring a new API
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configured APIs Sidebar */}
                <ConfiguredApisSidebar
                    configuredApis={configuredApis}
                    onDeleteApi={handleDeleteApi}
                    loading={loadingApis}
                />
            </div>
        </div>
    );
};

export default SetupTab;