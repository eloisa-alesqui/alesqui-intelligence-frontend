import React, { useState } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { X, Loader2, Mail, Lock, Shield, CheckCircle, XCircle } from 'lucide-react';

interface CreateUserModalProps {
    onClose: () => void;
    onCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreated }) => {
    const { addNotification } = useNotifications();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState<string[]>(['ROLE_TRIAL']);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string; roles?: string }>({});

    const availableRoles = [
        { value: 'ROLE_SUPERADMIN', label: 'Super Admin', description: 'Full system access, user management, and configuration' },
        { value: 'ROLE_IT', label: 'IT', description: 'API configuration, diagnostics, and technical management' },
        { value: 'ROLE_BUSINESS', label: 'Business', description: 'Business user access to assigned APIs' },
        { value: 'ROLE_TRIAL', label: 'Trial', description: 'Limited trial access to the system' }
    ];

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score, label: 'Weak', color: 'text-red-600' };
        if (score <= 3) return { score, label: 'Moderate', color: 'text-amber-600' };
        return { score, label: 'Strong', color: 'text-green-600' };
    };

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
        if (!/\d/.test(pwd)) return 'Password must contain a number';
        if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Password must contain a special character';
        return null;
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!username.trim()) {
            newErrors.username = 'Email is required';
        } else if (!validateEmail(username)) {
            newErrors.username = 'Invalid email format';
        }

        const pwdError = validatePassword(password);
        if (pwdError) {
            newErrors.password = pwdError;
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
            await adminService.createUser({ username: username.trim(), password, roles });
            addNotification('User created successfully', 'success');
            onCreated();
        } catch (err: any) {
            addNotification(err.message || 'Error creating user', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleRole = (role: string) => {
        setRoles(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
        setErrors(prev => ({ ...prev, roles: undefined }));
    };

    const passwordStrength = password ? getPasswordStrength(password) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
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

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Lock className="w-4 h-4 inline mr-1.5" />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                setErrors(prev => ({ ...prev, password: undefined }));
                            }}
                            disabled={submitting}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.password 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                        
                        {/* Password Strength Indicator */}
                        {password && passwordStrength && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all ${
                                                passwordStrength.score <= 1 ? 'bg-red-500 w-1/4' :
                                                passwordStrength.score <= 3 ? 'bg-amber-500 w-2/4' :
                                                'bg-green-500 w-full'
                                            }`}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {errors.password}
                            </p>
                        )}
                        
                        {!errors.password && password && (
                            <p className="mt-1.5 text-xs text-gray-500">
                                Must be 8+ characters with uppercase, lowercase, number, and special character
                            </p>
                        )}
                    </div>

                    {/* Roles Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Shield className="w-4 h-4 inline mr-1.5" />
                            Roles
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
                                        type="checkbox"
                                        checked={roles.includes(role.value)}
                                        onChange={() => toggleRole(role.value)}
                                        disabled={submitting}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
