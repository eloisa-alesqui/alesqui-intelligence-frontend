import React, { useRef } from 'react';
import { Upload, CheckCircle, Zap } from 'lucide-react';

const PostmanStep = ({ apiForm, updateForm, onUpload, onSkip, isLoading }) => {
    const postmanFileRef = useRef(null);

    const handleFileChange = (e) => {
        updateForm({ postmanFile: e.target.files[0] });
    };

    return (
        <div className="space-y-4">
            {/* Success message for Swagger upload */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="flex">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <div>
                        <h4 className="text-sm font-medium text-green-800">Swagger Uploaded Successfully</h4>
                        <p className="text-sm text-green-700">API: {apiForm.name}</p>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postman Collection File (JSON) *
                </label>
                <input
                    ref={postmanFileRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    required
                />
                <p className="mt-2 text-sm text-gray-500">
                    Export your Postman collection as JSON format
                </p>
            </div>

            <button
                onClick={onUpload}
                disabled={isLoading || !apiForm.postmanFile}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload Postman & Continue'}
            </button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">Opcional</span>
                </div>
            </div>

            <button
                onClick={onSkip}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                <Zap className="w-4 h-4 mr-2 text-gray-400" />
                Skip and Continue
            </button>
        </div>
    );
};

export default PostmanStep;