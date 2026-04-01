import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DeploymentInfo } from '../types';
import { deploymentService } from '../services/deploymentService';

/**
 * Define the shape of the deployment context value
 */
interface DeploymentContextType {
    deploymentInfo: DeploymentInfo;
    isTrialMode: boolean;
    isCorporateMode: boolean;
    loading: boolean;
}

/**
 * Default deployment info (CORPORATE mode)
 */
const defaultDeploymentInfo: DeploymentInfo = {
    mode: 'CORPORATE',
    companyName: 'Alesqui Intelligence',
    selfRegistrationEnabled: false
};

/**
 * Create the context with default values
 */
const DeploymentContext = createContext<DeploymentContextType>({
    deploymentInfo: defaultDeploymentInfo,
    isTrialMode: false,
    isCorporateMode: true,
    loading: true
});

/**
 * Define props for the provider
 */
interface DeploymentProviderProps {
    children: ReactNode;
}

/**
 * Provider component that fetches and provides deployment information
 * to all child components through context.
 */
export const DeploymentProvider: React.FC<DeploymentProviderProps> = ({ children }) => {
    const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo>(defaultDeploymentInfo);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeploymentInfo = async () => {
            try {
                const info = await deploymentService.getDeploymentInfo();
                setDeploymentInfo(info);
            } catch (error) {
                console.error('Error fetching deployment info:', error);
                // Keep default CORPORATE mode on error
            } finally {
                setLoading(false);
            }
        };

        fetchDeploymentInfo();
    }, []);

    const isTrialMode = deploymentInfo.mode === 'TRIAL';
    const isCorporateMode = deploymentInfo.mode === 'CORPORATE';

    const value: DeploymentContextType = {
        deploymentInfo,
        isTrialMode,
        isCorporateMode,
        loading
    };

    return (
        <DeploymentContext.Provider value={value}>
            {children}
        </DeploymentContext.Provider>
    );
};

/**
 * Custom hook for consuming the DeploymentContext easily and safely.
 * @returns {DeploymentContextType} The deployment context value.
 */
export const useDeployment = (): DeploymentContextType => {
    const context = useContext(DeploymentContext);
    if (context === undefined) {
        throw new Error('useDeployment must be used within a DeploymentProvider');
    }
    return context;
};
