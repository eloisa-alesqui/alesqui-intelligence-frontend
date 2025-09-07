import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepProgress = ({ currentStep, apiForm, steps = 3 }) => {
    const getStepStatus = (step) => {
        if (step === 1) {
            return apiForm.swaggerUploaded ? 'completed' : (currentStep === 1 ? 'current' : 'pending');
        }
        if (step === 2) {
            return (apiForm.postmanUploaded || currentStep > 2) ? 'completed' : (currentStep === 2 ? 'current' : 'pending');
        }
        if (currentStep > step) {
            return 'completed';
        }
        if (currentStep === step) {
            return 'current';
        }
        return 'pending';
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

    const stepArray = Array.from({ length: steps }, (_, i) => i + 1);

    return (
        <div className="flex items-center mb-8">
            {stepArray.map((step) => {
                const status = getStepStatus(step);
                return (
                    <React.Fragment key={step}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClasses(status)}`}>
                            {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step}
                        </div>
                        {step < steps && (
                            <div className={`w-16 h-1 mx-2 ${getConnectorClasses(step)}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepProgress;