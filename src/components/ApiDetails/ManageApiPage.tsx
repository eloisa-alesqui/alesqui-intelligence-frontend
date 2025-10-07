import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { apiService } from '../../services/apiService';
import { ApiDocument } from '../../types';
import ConfigurationStep from '../Setup/ConfigurationStep'; 
import { useNotifications } from '../../context/NotificationContext';
import Tabs from '../Common/Tabs';
import ApiDetailsTab from '../ApiDetails/ApiDetailsTab';

const ManageApiPage: React.FC = () => {
    const navigate = useNavigate();
    const { apiId } = useParams<{ apiId: string }>(); 
    const { addNotification } = useNotifications();
    const [api, setApi] = useState<ApiDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchApiData = async () => {
            if (!apiId) return;
            try {
                setLoading(true);
                const data = await apiService.getApiById(apiId); 
                setApi(data);
            } catch (error) {
                addNotification('Failed to load API data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchApiData();
    }, [apiId, addNotification]);

    const handleConfigChange = (name: string, value: any) => {
        setApi(prev => {
            if (!prev) return null;
    
            const newState = JSON.parse(JSON.stringify(prev));
            
            const keys = name.split('.');
            let currentLevel = newState.apiConfiguration;
    
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

    const handleSave = async () => {
        if (!api?.name || !api?.apiConfiguration) return;
        setIsSaving(true);
        try {
            await apiService.updateApiConfiguration(api.name, api.apiConfiguration);
            addNotification('Configuration saved successfully!', 'success');
            navigate('/apis'); 
        } catch (error) {
            addNotification('Failed to save configuration', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!api) return <div>API not found.</div>;

    const tabs = [
        { id: 'details', label: 'Details & Endpoints' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">{api.name}</h2>
                <p className="text-gray-600 mt-1">Manage and inspect your API configuration and documentation.</p>
            </div>

            <div className="mt-8">
                <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
                
                <div className="mt-6">
                    {activeTab === 'details' && <ApiDetailsTab api={api} />}
                    
                    {activeTab === 'settings' && (
                        <ConfigurationStep
                            config={api.apiConfiguration}
                            setConfig={handleConfigChange}
                            onSave={handleSave}
                            isLoading={isSaving}
                            apiName={api.name ?? 'API'}
                            title={`Editing Configuration for ${api.name}`}
                            description="Update the runtime settings for this API. Changes will be applied immediately."
                            saveButtonText="Save Changes"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageApiPage;