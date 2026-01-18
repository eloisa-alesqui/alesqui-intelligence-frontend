import React, { useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { useDeployment } from '../../../context/DeploymentContext';
import { X, Loader2, Mail, Shield, CheckCircle, XCircle, UserPlus, Info } from 'lucide-react';

interface CreateUserModalProps {
    onClose: () => void;
    onCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreated }) => {
    const { addNotification } = useNotifications();
    const { isCorporateMode } = useDeployment();
    const [username, setUsername] = useState('');
    const [roles, setRoles] = useState<string[]>(['ROLE_BUSINESS']);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; roles?: string }>({});

    const allRoles = [
        { value: 'ROLE_SUPERADMIN', label: 'Super Admin', description: 'Full system access, user management, and configuration' },
        { value: 'ROLE_IT', label: 'IT', description: 'API configuration, diagnostics, and technical management' },
        { value: 'ROLE_BUSINESS', label: 'Business', description: 'Business user access to assigned APIs' },
        { value: 'ROLE_TRIAL', label: 'Trial', description: 'Limited trial access to the system' }
    ];

    // Filter roles based on deployment mode:
    // In CORPORATE mode, exclude ROLE_TRIAL
    // In TRIAL mode, include all roles
    const availableRoles = useMemo(() => {
        if (isCorporateMode) {
            return allRoles.filter(role => role.value !== 'ROLE_TRIAL');
        }
        return allRoles;
    }, [isCorporateMode]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!username.trim()) {
            newErrors.username = 'Email is required';
        } else if (!validateEmail(username)) {
            newErrors.username = 'Invalid email format';
        }

        if (roles.length === 0) {
            newErrors.roles = 'At least one role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            setSubmitting(true);
            await adminService.createUser({ username: username.trim(), roles });
            addNotification('User created successfully. Activation email sent.', 'success');
            onCreated();
        } catch (err: any) {
            addNotification(err.message || 'Error creating user', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const selectRole = (role: string) => {
        setRoles([role]);
        setErrors(prev => ({ ...prev, roles: undefined }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            An activation email will be sent to the user to set their own password.
                        </p>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Mail className="w-4 h-4 inline mr-1.5" />
                            Email Address (Username)
                        </label>
                        <input
                            id="username"
                            type="email"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                setErrors(prev => ({ ...prev, username: undefined }));
                            }}
                            disabled={submitting}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.username 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            placeholder="user@example.com"
                            autoComplete="off"
                        />
                        {errors.username && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Roles Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Shield className="w-4 h-4 inline mr-1.5" />
                            Role
                        </label>
                        <div className="space-y-2">
                            {availableRoles.map(role => (
                                <label 
                                    key={role.value} 
                                    className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                                        roles.includes(role.value) 
                                            ? 'bg-blue-50 border-blue-300' 
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        checked={roles.includes(role.value)}
                                        onChange={() => selectRole(role.value)}
                                        disabled={submitting}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-sm text-gray-900">{role.label}</span>
                                        <p className="text-xs text-gray-600 mt-0.5">{role.description}</p>
                                    </div>
                                    {roles.includes(role.value) && (
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                    )}
                                </label>
                            ))}
                        </div>
                        {errors.roles && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {errors.roles}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
