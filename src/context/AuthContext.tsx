import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import apiClient from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

// Define the shape of our user data (the JWT payload)
interface UserPayload {
    sub: string; // 'subject', typically the username
    authorities: string[];
    iat: number; // 'issued at'
    exp: number; // 'expiration time'
}

// Define the shape of our context value
interface AuthContextType {
    token: string | null;
    user: UserPayload | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

// Create the context with the defined type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));

    const [user, setUser] = useState<UserPayload | null>(() => {
        const storedToken = localStorage.getItem('accessToken');
        try {
            return storedToken ? jwtDecode<UserPayload>(storedToken) : null;
        } catch (error) {
            console.error("Invalid token found in localStorage:", error);
            return null;
        }
    });

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/api/auth/login', { username, password });
            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            setToken(accessToken);
            setUser(jwtDecode<UserPayload>(accessToken));
            
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            logout();
            return false;
        }
    };

    const logout = (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
    };

    const authContextValue = useMemo<AuthContextType>(() => ({
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
    }), [token, user]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook for consuming the AuthContext easily and safely.
 * @returns {AuthContextType} The authentication context value.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};