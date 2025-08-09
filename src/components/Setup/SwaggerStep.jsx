import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

const SwaggerStep = ({ apiForm, updateForm, onUpload, isLoading }) => {
    const swaggerFileRef = useRef(null);

    const handleFileChange = (e) => {
        updateForm({ swaggerFile: e.target.files[0] });
    };

    const handleNameChange = (e) => {
        updateForm({ name: e.target.value });
    };

    const handleTeamChange = (e) => {
        updateForm({ team: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        updateForm({ description: e.target.value });
    };

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team (optional)
                    </label>
                    <input
                        type="text"
                        value={apiForm.team}
                        onChange={handleTeamChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Backend Team"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                </label>
                <textarea
                    value={apiForm.description}
                    onChange={handleDescriptionChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="API description..."
                />
            </div>

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

            <button
                onClick={onUpload}
                disabled={isLoading || !apiForm.name || !apiForm.swaggerFile}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload Swagger & Continue'}
            </button>
        </div>
    );
};

export default SwaggerStep;