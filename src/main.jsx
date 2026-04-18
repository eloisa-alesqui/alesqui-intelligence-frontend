import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AlesquiIntelligenceApp from './App.tsx'
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DeploymentProvider } from './context/DeploymentContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <DeploymentProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <AuthProvider>
          <NotificationProvider>
            <AlesquiIntelligenceApp />
          </NotificationProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </DeploymentProvider>
)
