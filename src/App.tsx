import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/security/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage'; 

import SetupTab from './components/Setup/SetupTab';
import ApiList from './components/ApiDetails/ApiList';
import ManageApiPage from './components/ApiDetails/ManageApiPage';
import ChatTab from './components/Chat/ChatTab';

/**
 * The main application component.
 * It is responsible for setting up the application's routing structure.
 * It uses react-router-dom to define public and protected routes.
 */
const AlesquiIntelligenceApp: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Wrap all protected routes within the main AppLayout */}
                <Route element={<AppLayout />}>
                    
                    {/* --- Group 1: Routes that only require authentication --- */}
                    {/* This ProtectedRoute has no 'roles' prop, so it only checks if the user is logged in. */}
                    <Route element={<ProtectedRoute />}>
                        {/* Default redirect for logged-in users */}
                        <Route path="/" element={<Navigate to="/chat" replace />} />
                        <Route path="/chat" element={<ChatTab />} />
                    </Route>

                    {/* --- Group 2: Routes that require the 'ROLE_IT' role --- */}
                    {/* We pass the required role to this ProtectedRoute. */}
                    {/* The component will handle both authentication and role validation. */}
                    <Route element={<ProtectedRoute roles={['ROLE_IT']} />}>
                        <Route path="/setup" element={<SetupTab />} />
                        <Route path="/apis" element={<ApiList />} />
                        <Route path="/apis/:apiId" element={<ManageApiPage />} />
                    </Route>

                </Route>

                {/* Catch-all route for any other undefined URL */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AlesquiIntelligenceApp;