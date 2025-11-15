import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { activationService } from '../services/activationService';
import { Loader2, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

const ActivateAccountPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [expired, setExpired] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
    const [success, setSuccess] = useState(false);

    // Password requirements
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setTokenError('No activation token provided');
            return;
        }

        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            setLoading(true);
            const response = await activationService.validateToken(token!);
            
            if (response.valid && response.email) {
                setTokenValid(true);
                setEmail(response.email);
                setTokenError(null);
            } else {
                setTokenValid(false);
                setExpired(response.expired || false);
                setTokenError(response.message || 'Invalid activation token');
            }
        } catch (error: any) {
            setTokenValid(false);
            setTokenError(error.message || 'Error validating token');
        } finally {
            setLoading(false);
        }
    };

    const checkPasswordRequirements = (pwd: string) => {
        setRequirements({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /\d/.test(pwd),
            special: /[^a-zA-Z0-9]/.test(pwd),
        });
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        checkPasswordRequirements(value);
        setErrors(prev => ({ ...prev, password: undefined }));
    };

    const getPasswordStrength = (): { score: number; label: string; color: string } => {
        const score = Object.values(requirements).filter(Boolean).length;
        
        if (score <= 2) return { score, label: 'Weak', color: 'text-red-600' };
        if (score <= 4) return { score, label: 'Moderate', color: 'text-amber-600' };
        return { score, label: 'Strong', color: 'text-green-600' };
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        const allRequirementsMet = Object.values(requirements).every(Boolean);

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!allRequirementsMet) {
            newErrors.password = 'Password does not meet all requirements';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            setSubmitting(true);
            await activationService.activateAccount({ token: token!, password });
            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error: any) {
            setErrors({ password: error.message || 'Failed to activate account' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            await activationService.resendActivationEmail(email);
            alert('A new activation email has been sent.');
        } catch (error: any) {
            alert(error.message || 'Failed to resend activation email');
        }
    };

    const passwordStrength = password ? getPasswordStrength() : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Validating activation token...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h1>
                    <p className="text-gray-600 mb-4">
                        Your account has been successfully activated.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {expired ? 'Token Expired' : 'Invalid Token'}
                    </h1>
                    <p className="text-gray-600 text-center mb-6">
                        {tokenError || 'The activation link is invalid or has expired.'}
                    </p>
                    
                    {expired && email && (
                        <button
                            onClick={handleResendEmail}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-3"
                        >
                            Request New Activation Link
                        </button>
                    )}
                    
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Activate Your Account</h1>
                    <p className="text-gray-600">
                        Welcome! Set your password for <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Lock className="w-4 h-4 inline mr-1.5" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => handlePasswordChange(e.target.value)}
                                disabled={submitting}
                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errors.password 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && passwordStrength && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all ${
                                                passwordStrength.score <= 2 ? 'bg-red-500' :
                                                passwordStrength.score <= 4 ? 'bg-amber-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
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
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                        <ul className="space-y-1">
                            {[
                                { key: 'length', label: 'At least 8 characters' },
                                { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
                                { key: 'lowercase', label: 'One lowercase letter (a-z)' },
                                { key: 'number', label: 'One number (0-9)' },
                                { key: 'special', label: 'One special character (!@#$...)' },
                            ].map(req => (
                                <li key={req.key} className="flex items-center gap-2 text-xs">
                                    {requirements[req.key as keyof typeof requirements] ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                                    )}
                                    <span className={requirements[req.key as keyof typeof requirements] ? 'text-green-700' : 'text-gray-600'}>
                                        {req.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Lock className="w-4 h-4 inline mr-1.5" />
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => {
                                    setConfirmPassword(e.target.value);
                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                }}
                                disabled={submitting}
                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errors.confirmPassword 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.confirmPassword}
                            </p>
                        )}
                        {!errors.confirmPassword && confirmPassword && password === confirmPassword && (
                            <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Passwords match
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Activating Account...
                            </>
                        ) : (
                            <>
                                Activate Account
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ActivateAccountPage;
