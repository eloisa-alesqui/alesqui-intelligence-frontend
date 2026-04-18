import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react';
import GoogleSignInButton from '../components/Auth/GoogleSignInButton';
import LinkAccountModal from '../components/Auth/LinkAccountModal';
import { googleAuthService } from '../services/googleAuthService';

// Import your logo image. Adjust the path if necessary.
import logo from '../assets/logo.png'; // Make sure this path is correct

/**
 * LoginPage component handles user authentication.
 * It provides a form for users to enter their username and password to log in.
 * Upon successful login, it redirects the user to the dashboard.
 */
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState(''); // Corrected: back to username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkChallenge, setLinkChallenge] = useState<string | null>(null);
    const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const { login, loginWithToken } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    // Check for password reset success message
    useEffect(() => {
        const resetSuccess = sessionStorage.getItem('passwordResetSuccess');
        if (resetSuccess === 'true') {
            setSuccessMessage('Password successfully reset! You can now log in with your new password.');
            sessionStorage.removeItem('passwordResetSuccess');
            
            // Clear success message after 15 seconds
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 15000);
            
            return () => clearTimeout(timer);
        }
    }, []);

    /**
     * Handles the form submission for user login.
     * Prevents default form submission, sets loading state, attempts login,
     * and navigates or displays an error message.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage(''); // Clear success message on new login attempt
        setIsLoading(true);

        try {
            // The 'login' function from AuthContext expects username and password
            const success = await login(username, password); 
            if (success) {
                navigate('/dashboard'); // Redirect to dashboard on successful login
            } else {
                setError('Invalid username or password. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        setIsGoogleLoading(true);
        try {
            const result = await googleAuthService.loginWithGoogle(credential);
            if (result.linkRequired) {
                setPendingIdToken(credential);
                setLinkChallenge(result.linkChallenge || null);
                setShowLinkModal(true);
            } else {
                loginWithToken(result.accessToken!, result.refreshToken!);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleLinkConfirm = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await googleAuthService.confirmGoogleLink(pendingIdToken!, linkChallenge!);
            loginWithToken(result.accessToken!, result.refreshToken!);
            setShowLinkModal(false);
            setPendingIdToken(null);
            setLinkChallenge(null);
            addNotification('Account linked successfully', 'success');
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleLinkCancel = () => {
        setShowLinkModal(false);
        setPendingIdToken(null);
        setLinkChallenge(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    {/* Logo */}
                    <img
                        className="mx-auto h-24 sm:h-32 lg:h-48 w-auto mb-4"
                        src={logo}
                        alt="Alesqui Intelligence Logo"
                    />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Alesqui
                    </h1>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Intelligence
                    </h1>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Username Field with a visible Label */}
                        <div>
                            <label 
                                htmlFor="username" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g., user123"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field with a visible Label */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        {successMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="mt-2 text-sm text-red-600 text-center">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="mt-6 group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2 -ml-1" />
                                    Log In
                                </>
                            )}
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-gray-600 hover:text-blue-600 underline transition-colors"
                            disabled={isLoading}
                        >
                            Forgot your password?
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <div className="flex justify-center">
                        <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading || isGoogleLoading} />
                    </div>
                </form>

                {showLinkModal && (
                    <LinkAccountModal onConfirm={handleLinkConfirm} onCancel={handleLinkCancel} isLoading={isGoogleLoading} />
                )}
            </div>
        </div>
    );
};

export default LoginPage;