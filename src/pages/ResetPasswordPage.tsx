import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { activationService } from '../services/activationService';
import logo from '../assets/logo.png';

/**
 * ResetPasswordPage component allows users to reset their password using a token.
 * Validates the token on page load and provides a form to set a new password.
 */
const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Token validation state
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');

    // Form state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [redirectSeconds, setRedirectSeconds] = useState(0);

    // Password validation state
    const [passwordTouched, setPasswordTouched] = useState(false);

    // Password requirements validation
    const passwordRequirements = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

    // Validate token on page load
    useEffect(() => {
        const tokenParam = searchParams.get('token');
        
        if (!tokenParam) {
            setIsValidatingToken(false);
            setTokenError('No reset token provided.');
            return;
        }

        setToken(tokenParam);
        validateToken(tokenParam);
    }, [searchParams]);

    // Auto-redirect timer (3 seconds after success)
    useEffect(() => {
        if (redirectSeconds > 0) {
            const timer = setTimeout(() => {
                setRedirectSeconds(redirectSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (redirectSeconds === 0 && isSuccess) {
            // Store success message for login page
            sessionStorage.setItem('passwordResetSuccess', 'true');
            navigate('/login');
        }
    }, [redirectSeconds, isSuccess, navigate]);

    /**
     * Validates the reset token with the backend
     */
    const validateToken = async (tokenValue: string) => {
        try {
            const response = await activationService.validateResetToken(tokenValue);
            
            if (response.valid && response.email) {
                setIsValidToken(true);
                setEmail(response.email);
            } else if (response.expired) {
                setTokenError('This password reset link has expired.');
            } else {
                setTokenError('This password reset link is invalid or has expired.');
            }
        } catch (err: any) {
            console.error('Token validation error:', err);
            
            if (err.code === 'ERR_NETWORK' || !err.response) {
                setTokenError('Unable to validate reset link. Please check your connection.');
            } else {
                setTokenError('This password reset link is invalid or has expired.');
            }
        } finally {
            setIsValidatingToken(false);
        }
    };

    /**
     * Retries token validation (for network errors)
     */
    const handleRetryValidation = () => {
        setIsValidatingToken(true);
        setTokenError('');
        validateToken(token);
    };

    /**
     * Handles form submission for password reset
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords
        if (!allRequirementsMet) {
            setError('Please meet all password requirements.');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await activationService.resetPassword({
                token,
                newPassword
            });

            setIsSuccess(true);
            setRedirectSeconds(3);
        } catch (err: any) {
            console.error('Password reset error:', err);
            
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Unable to reset password. Please check your connection and try again.');
            } else {
                setError('Failed to reset password. Please try again or request a new reset link.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Password Requirement Item Component
     */
    const RequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <div className="flex items-center space-x-2">
            {met ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
            )}
            <span className={`text-sm ${met ? 'text-green-700' : 'text-gray-600'}`}>
                {text}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    {/* Logo */}
                    <img
                        className="mx-auto h-48 w-auto mb-4"
                        src={logo}
                        alt="Alesqui Intelligence Logo"
                    />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Reset Password
                    </h1>
                </div>

                {/* Loading State */}
                {isValidatingToken && (
                    <div className="text-center py-8">
                        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-gray-600">Validating reset link...</p>
                    </div>
                )}

                {/* Invalid/Expired Token State */}
                {!isValidatingToken && !isValidToken && (
                    <div className="space-y-6">
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {tokenError}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {tokenError.includes('connection') ? (
                                <button
                                    onClick={handleRetryValidation}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Retry
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Request a new reset link
                                </button>
                            )}
                            
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </button>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {isSuccess && (
                    <div className="space-y-6">
                        <div className="rounded-md bg-green-50 p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        Password successfully reset!
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>Your password has been updated. You can now log in with your new password.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <p>Redirecting to login in {redirectSeconds} seconds...</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Click here to login now
                            </button>
                        </div>
                    </div>
                )}

                {/* Valid Token - Show Reset Form */}
                {!isValidatingToken && isValidToken && !isSuccess && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Email Display */}
                        <div className="rounded-md bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Resetting password for:</span>{' '}
                                <span className="font-semibold">{email}</span>
                            </p>
                        </div>

                        {/* New Password Input */}
                        <div>
                            <label 
                                htmlFor="newPassword" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordTouched(true);
                                    }}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements Checklist */}
                        {passwordTouched && (
                            <div className="rounded-md bg-gray-50 p-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                                <RequirementItem met={passwordRequirements.minLength} text="At least 8 characters" />
                                <RequirementItem met={passwordRequirements.hasUppercase} text="At least one uppercase letter" />
                                <RequirementItem met={passwordRequirements.hasLowercase} text="At least one lowercase letter" />
                                <RequirementItem met={passwordRequirements.hasNumber} text="At least one number" />
                                <RequirementItem met={passwordRequirements.hasSpecial} text="At least one special character" />
                            </div>
                        )}

                        {/* Confirm Password Input */}
                        <div>
                            <label 
                                htmlFor="confirmPassword" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            
                            {/* Passwords Match Indicator */}
                            {confirmPassword && (
                                <div className="mt-2">
                                    {passwordsMatch ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Passwords match</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Passwords do not match</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Resetting password...</span>
                                    </>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
