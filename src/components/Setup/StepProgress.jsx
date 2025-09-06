import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepProgress = ({ currentStep, apiForm }) => {
    const getStepStatus = (step) => {
        if (step === 1) return apiForm.swaggerUploaded ? 'completed' : currentStep === 1 ? 'current' : 'pending';
        if (step === 2) {
            if (apiForm.postmanUploaded || currentStep > 2) return 'completed';
            return currentStep === 2 ? 'current' : 'pending';
        }
        if (step === 3) return apiForm.unified ? 'completed' : currentStep === 3 ? 'current' : 'pending';
    };

    const getStepClasses = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 text-white';
            case 'current':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-200 text-gray-600';
        }
    };

    const getConnectorClasses = (step) => {
        const status = getStepStatus(step);
        return status === 'completed' ? 'bg-green-500' : 'bg-gray-200';
    };

    return (
        <div className="flex items-center mb-8">
            {[1, 2, 3].map((step) => {
                const status = getStepStatus(step);
                return (
                    <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClasses(status)}`}>
                            {status === 'completed' ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                step
                            )}
                        </div>
                        {step < 3 && (
                            <div className={`w-16 h-1 mx-2 ${getConnectorClasses(step)}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepProgress;