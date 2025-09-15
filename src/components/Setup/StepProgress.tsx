import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ApiFormState } from '../../types'; // Assuming types.ts is in the same folder or adjust path

/**
 * Defines the properties required by the StepProgress component.
 */
interface StepProgressProps {
    /** The number of the step that is currently active. */
    currentStep: number;
    /** The state of the API form. Only certain flags (like `swaggerUploaded`) are needed, so it's a Partial type. */
    apiForm: Partial<ApiFormState>;
    /** The total number of steps in the wizard. Defaults to 4. */
    steps?: number;
}

/**
 * Represents the possible visual states for a single step in the progress bar.
 */
type StepStatus = 'completed' | 'current' | 'pending';

/**
 * A React functional component that renders a visual step progress indicator.
 * It dynamically styles each step based on its status (completed, current, or pending).
 */
const StepProgress: React.FC<StepProgressProps> = ({ currentStep, apiForm, steps = 4 }) => {

    /**
     * Determines the status of a given step number based on the current step and form state.
     * This function contains the core logic for the component's display.
     * @param step The step number to evaluate (e.g., 1, 2, 3).
     * @returns The status of the step as 'completed', 'current', or 'pending'.
     */
    const getStepStatus = (step: number): StepStatus => {
        // Step 1 is complete only if the Swagger file has been successfully uploaded.
        if (step === 1) {
            return apiForm.swaggerUploaded ? 'completed' : (currentStep === 1 ? 'current' : 'pending');
        }
        // Step 2 is complete if a Postman file was uploaded OR if the user skipped it (i.e., we are on a later step).
        if (step === 2) {
            return (apiForm.postmanUploaded || currentStep > 2) ? 'completed' : (currentStep === 2 ? 'current' : 'pending');
        }
        // For all other steps, the logic is simpler.
        if (currentStep > step) {
            return 'completed';
        }
        if (currentStep === step) {
            return 'current';
        }
        return 'pending';
    };

    /**
     * Returns the appropriate CSS classes for a step circle based on its status.
     * @param status The status of the step ('completed', 'current', or 'pending').
     * @returns A string of Tailwind CSS classes for styling.
     */
    const getStepClasses = (status: StepStatus): string => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 text-white';
            case 'current':
                return 'bg-blue-500 text-white';
            default: // 'pending'
                return 'bg-gray-200 text-gray-600';
        }
    };

    /**
     * Returns the appropriate CSS classes for the connector line preceding a step.
     * @param step The step number that the connector leads *from*.
     * @returns A string of Tailwind CSS classes for styling.
     */
    const getConnectorClasses = (step: number): string => {
        const status = getStepStatus(step);
        // The connector is colored green if the step it leads from is completed.
        return status === 'completed' ? 'bg-green-500' : 'bg-gray-200';
    };

    // Create a simple array of numbers representing the steps, e.g., [1, 2, 3, 4].
    const stepArray = Array.from({ length: steps }, (_, i) => i + 1);

    return (
        <div className="flex items-center mb-8">
            {stepArray.map((step) => {
                const status = getStepStatus(step);
                return (
                    <React.Fragment key={step}>
                        {/* The numbered circle for the step, showing a checkmark if completed. */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClasses(status)}`}>
                            {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step}
                        </div>
                        {/* The connector line to the next step (not rendered for the last step). */}
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