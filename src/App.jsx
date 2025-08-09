import React, { useState, useRef } from 'react';
import { Upload, MessageCircle, FileText, Zap, CheckCircle, AlertCircle, Send, Bot, User, Trash2, Plus, Database } from 'lucide-react';
import ApiList from './components/ApiList/ApiList';
import ChatTab from './components/Chat/ChatTab';
import Header from './components/Layout/Header';
import Notifications from './components/Layout/Notifications';
import SetupTab from './components/Setup/SetupTab';

const PostmanGPTApp = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [configuredApis, setConfiguredApis] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleDeleteApi = (apiId) => {
    setConfiguredApis(prev => prev.filter(api => api.id !== apiId));
    addNotification('API removed from list');
  };

  const handleApiConfigured = (newApi) => {
    setConfiguredApis(prev => [...prev, newApi]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <Notifications notifications={notifications} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)]">
        {activeTab === 'setup' && (
          <SetupTab 
            configuredApis={configuredApis}
            onApiConfigured={handleApiConfigured}
            onDeleteApi={handleDeleteApi}
            addNotification={addNotification}
          />
        )}

        {activeTab === 'apis' && (
          <ApiList />
        )}

        {activeTab === 'chat' && (
          <ChatTab 
            configuredApis={configuredApis}
            addNotification={addNotification}
          />
        )}
      </main>

    </div>
  );
};

export default PostmanGPTApp;