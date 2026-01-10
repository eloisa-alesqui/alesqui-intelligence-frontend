import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { activationService } from '../services/activationService';
import logo from '../assets/logo.png';

/**
 * ForgotPasswordPage component allows users to request a password reset link.
 * Implements security best practices and anti-spam measures.
 */
const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [redirectSeconds, setRedirectSeconds] = useState(0);
    
    const navigate = useNavigate();

    // Cooldown timer (60 seconds after successful submission)
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(cooldownSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownSeconds]);

    // Auto-redirect timer (10 seconds after success)
    useEffect(() => {
        if (redirectSeconds > 0) {
            const timer = setTimeout(() => {
                setRedirectSeconds(redirectSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (redirectSeconds === 0 && isSuccess && cooldownSeconds <= 50) {
            // Redirect when timer reaches 0
            navigate('/login');
        }
    }, [redirectSeconds, isSuccess, cooldownSeconds, navigate]);

    /**
     * Validates email format using HTML5 email validation
     */
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Handles the form submission for password reset request
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Client-side email validation
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await activationService.forgotPassword({ email });
            
            // Always show success message (security feature)
            setIsSuccess(true);
            setCooldownSeconds(60); // 60-second cooldown
            setRedirectSeconds(10);   // 10-second redirect timer
            setEmail(''); // Clear email field
        } catch (err: any) {
            console.error('Forgot password error:', err);
            
            // Handle specific error types
            if (err.response?.status >= 500) {
                setError('Something went wrong. Please try again later.');
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Unable to send reset link. Please check your connection and try again.');
            } else {
                // For any other errors, still show success message (security)
                setIsSuccess(true);
                setCooldownSeconds(60);
                setRedirectSeconds(10);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Manually navigate back to login
     */
    const handleBackToLogin = () => {
        navigate('/login');
    };

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
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {!isSuccess ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading || cooldownSeconds > 0}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                disabled={isLoading || cooldownSeconds > 0}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Sending...</span>
                                    </>
                                ) : cooldownSeconds > 0 ? (
                                    <span>Resend available in {cooldownSeconds}s</span>
                                ) : (
                                    <span>Send Recovery Link</span>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                disabled={isLoading}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to login
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md bg-green-50 p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        Check Your Email
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>
                                            If an account exists with this email, a password reset link has been sent. 
                                            Please check your inbox.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <p>
                                Redirecting to login in {redirectSeconds} seconds...
                            </p>
                            <button
                                onClick={handleBackToLogin}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Click here to return to login now
                            </button>
                        </div>

                        {cooldownSeconds > 0 && (
                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    You can request another reset link in {cooldownSeconds} seconds
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
