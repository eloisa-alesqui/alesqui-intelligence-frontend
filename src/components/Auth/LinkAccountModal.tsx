import React from 'react';
import { X, Loader2, Link2, Info } from 'lucide-react';

interface LinkAccountModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

const LinkAccountModal: React.FC<LinkAccountModalProps> = ({ onConfirm, onCancel, isLoading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-xl border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Link your account</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            An account with this email already exists using classic registration.
                            Would you like to link Google to your account? You'll be able to sign in with either method.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Link Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkAccountModal;
