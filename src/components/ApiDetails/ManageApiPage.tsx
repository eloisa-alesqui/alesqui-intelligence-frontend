import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { apiService, ApiUtils } from '../../services/apiService';
import { ApiDocument } from '../../types';
import ConfigurationStep from '../Setup/ConfigurationStep'; 
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { adminService, Group } from '../../services/adminService';
import Tabs from '../Common/Tabs';
import ApiDetailsTab from '../ApiDetails/ApiDetailsTab';

const ManageApiPage: React.FC = () => {
    const navigate = useNavigate();
    const { apiId } = useParams<{ apiId: string }>(); 
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const [api, setApi] = useState<ApiDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [apiGroups, setApiGroups] = useState<Group[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchApiData = async () => {
            if (!apiId) return;
            try {
                setLoading(true);
                const data = await apiService.getApiById(apiId); 
                setApi(data);
                
                // Cargar grupos de la API
                if (data) {
                    console.log('Fetching groups for API:', apiId);
                    const groups = await adminService.getApiGroups(apiId);
                    console.log('API groups loaded:', groups);
                    setApiGroups(groups);
                    setSelectedGroupIds(groups.map(g => g.id));
                }
            } catch (error) {
                console.error('Error loading API data:', error);
                addNotification('Failed to load API data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchApiData();
    }, [apiId, addNotification]);

    useEffect(() => {
        const loadAvailableGroups = async () => {
            if (!user) return;
            
            try {
                const isSuperAdmin = user.authorities.includes('ROLE_SUPERADMIN');
                const isIT = user.authorities.includes('ROLE_IT');
                
                if (isSuperAdmin) {
                    const groups = await adminService.listGroups();
                    setAvailableGroups(groups);
                } else if (isIT) {
                    const groups = await adminService.getCurrentUserGroups();
                    setAvailableGroups(groups);
                }
            } catch (error) {
                console.error('Error loading groups:', error);
            }
        };
        
        loadAvailableGroups();
    }, [user]);

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
        if (!api?.name || !api?.apiConfiguration || !apiId) return;
        
        // Check if user has permission to modify this API
        if (!ApiUtils.canModifyApi(api, user?.sub, user?.authorities)) {
            addNotification('You do not have permission to modify this API', 'error');
            return;
        }
        
        setIsSaving(true);
        try {
            await apiService.updateApiConfiguration(api.name, api.apiConfiguration);
            
            const currentGroupIds = apiGroups.map(g => g.id).sort();
            const newGroupIds = selectedGroupIds.sort();
            
            if (JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds)) {

                const groupsToRemove = currentGroupIds.filter(id => !newGroupIds.includes(id));
                for (const groupId of groupsToRemove) {
                    await adminService.removeApiFromGroup(groupId, apiId);
                }
                
                const groupsToAdd = newGroupIds.filter(id => !currentGroupIds.includes(id));
                if (groupsToAdd.length > 0) {
                    await adminService.assignApiToGroups(apiId, groupsToAdd);
                }
                
                addNotification('Configuration and groups saved successfully!', 'success');
            } else {
                addNotification('Configuration saved successfully!', 'success');
            }
            
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
                            availableGroups={availableGroups}
                            selectedGroupIds={selectedGroupIds}
                            onGroupSelectionChange={setSelectedGroupIds}
                            canModify={ApiUtils.canModifyApi(api, user?.sub, user?.authorities)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageApiPage;