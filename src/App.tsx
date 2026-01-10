import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Security/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage'; 

import SetupTab from './components/Setup/SetupTab';
import ApiList from './components/ApiDetails/ApiList';
import ManageApiPage from './components/ApiDetails/ManageApiPage';
import ChatTab from './components/Chat/ChatTab';
import DiagnosticsTab from './components/Diagnostics/DiagnosticsTab';
import AdminLayout from './components/Admin/AdminLayout';
import GroupList from './components/Admin/Groups/GroupList';
import GroupDetail from './components/Admin/Groups/GroupDetail';
import UserList from './components/Admin/Users/UserList';
import UserDetail from './components/Admin/Users/UserDetail';

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
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/activate-account" element={<ActivateAccountPage />} />
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

                    {/* --- Group 2: Routes that require the 'ROLE_IT', 'ROLE_SUPERADMIN' or 'ROLE_TRIAL' role --- */}
                    {/* We pass the required role to this ProtectedRoute. */}
                    {/* The component will handle both authentication and role validation. */}
                    <Route element={<ProtectedRoute roles={['ROLE_IT', 'ROLE_SUPERADMIN', 'ROLE_TRIAL']} />}>
                        <Route path="/setup" element={<SetupTab />} />
                        <Route path="/apis" element={<ApiList />} />
                        <Route path="/apis/:apiId" element={<ManageApiPage />} />
                        <Route path="/diagnostics" element={<DiagnosticsTab />} />
                    </Route>

                    {/* Administration module (SUPERADMIN only) */}
                    <Route element={<ProtectedRoute roles={['ROLE_SUPERADMIN']} />}>
                        <Route path="/admin" element={<AdminLayout />}> 
                            <Route path="groups" element={<GroupList />} />
                            <Route path="groups/:groupId" element={<GroupDetail />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="users/:userId" element={<UserDetail />} />
                        </Route>
                    </Route>

                </Route>

                {/* Catch-all route for any other undefined URL */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AlesquiIntelligenceApp;