import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { ApiFormState } from '../../types';

/**
 * Defines the properties required by the SwaggerStep component.
 */
interface SwaggerStepProps {
    /** The current state of the API form, managed by a parent component or hook. */
    apiForm: ApiFormState;
    /** A callback function to update the parent's form state with partial changes. */
    updateForm: (update: Partial<ApiFormState>) => void;
    /** A callback function to trigger the file upload and proceed to the next step. */
    onUpload: () => void;
    /** A boolean flag to indicate if an upload process is currently active. */
    isLoading: boolean;
}

/**
 * A React functional component for Step 1 of the API configuration process.
 * It allows users to input API details and upload a Swagger (OpenAPI) specification file.
 */
const SwaggerStep: React.FC<SwaggerStepProps> = ({ apiForm, updateForm, onUpload, isLoading }) => {
    // A ref to the file input element. Can be used for imperative actions like clearing the input.
    const swaggerFileRef = useRef<HTMLInputElement>(null);

    /**
     * Handles the change event for the file input.
     * Extracts the first selected file and updates the form state.
     * @param e The React change event from the input element.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            updateForm({ swaggerFile: e.target.files[0] });
        }
    };

    /**
     * Updates the API name in the form state as the user types.
     * @param e The React change event from the input element.
     */
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateForm({ name: e.target.value });
    };

    /**
     * Updates the team name in the form state as the user types.
     * @param e The React change event from the input element.
     */
    const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateForm({ team: e.target.value });
    };

    /**
     * Updates the API description in the form state as the user types.
     * @param e The React change event from the textarea element.
     */
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateForm({ description: e.target.value });
    };

    // Determine if the submit button should be disabled for better readability.
    // It requires the API name and a selected Swagger file to be enabled.
    const isSubmitDisabled = isLoading || !apiForm.name || !apiForm.swaggerFile;

    return (
        <div className="space-y-4">
            {/* Section for API metadata input fields */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* API Name Input (Required) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Name *
                    </label>
                    <input
                        type="text"
                        value={apiForm.name}
                        onChange={handleNameChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Sales API"
                        required
                    />
                </div>
                {/* Team Name Input (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team (optional)
                    </label>
                    <input
                        type="text"
                        value={apiForm.team || ''}
                        onChange={handleTeamChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Backend Team"
                    />
                </div>
            </div>

            {/* API Description Input (Optional) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                </label>
                <textarea
                    value={apiForm.description || ''}
                    onChange={handleDescriptionChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="API description..."
                />
            </div>

            {/* Swagger File Upload Input (Required) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Swagger File (JSON/YAML) *
                </label>
                <input
                    ref={swaggerFileRef}
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                />
            </div>

            {/* Submit Button to finalize this step */}
            <button
                onClick={onUpload}
                disabled={isSubmitDisabled}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload Swagger & Continue'}
            </button>
        </div>
    );
};

export default SwaggerStep;