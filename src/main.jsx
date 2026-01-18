import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AlesquiIntelligenceApp from './App.tsx'
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DeploymentProvider } from './context/DeploymentContext';

createRoot(document.getElementById('root')).render(
    <DeploymentProvider>
      <AuthProvider>
        <NotificationProvider>
          <AlesquiIntelligenceApp />
        </NotificationProvider>
      </AuthProvider>
    </DeploymentProvider>
)
