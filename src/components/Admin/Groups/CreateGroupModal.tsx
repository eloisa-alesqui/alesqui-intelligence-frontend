import React, { useState } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { X, Loader2, AlertCircle, Users, Tag, FileText } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CreateGroupModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const { addNotification } = useNotifications();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ code?: string; name?: string }>({});

  const validateCode = (code: string): string | null => {
    if (!code.trim()) return 'Code is required';
    if (!/^[a-z0-9-]+$/.test(code)) return 'Only lowercase letters, numbers and dashes are allowed';
    return null;
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const codeError = validateCode(code);
    if (codeError) {
      newErrors.code = codeError;
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setSubmitting(true);
      await adminService.createGroup({ code: code.trim(), name: name.trim(), description: description.trim() });
      addNotification('Group created successfully', 'success');
      onCreated();
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('already exists')) {
        setErrors({ code: 'This code already exists' });
      } else {
        addNotification(err.message || 'Error creating group', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Create New Group</h3>
          </div>
          <button 
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Code Field */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
              <Tag className="w-4 h-4 inline mr-1.5" />
              Code (unique)
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={e => {
                setCode(e.target.value.trim());
                setErrors(prev => ({ ...prev, code: undefined }));
              }}
              disabled={submitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.code 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
              placeholder="analytics"
              autoComplete="off"
            />
            {errors.code && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.code}
              </p>
            )}
            {!errors.code && code && (
              <p className="mt-1.5 text-xs text-gray-500">
                Use lowercase letters, numbers and dashes only
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              <Users className="w-4 h-4 inline mr-1.5" />
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setErrors(prev => ({ ...prev, name: undefined }));
              }}
              disabled={submitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
              placeholder="Analytics Team"
              autoComplete="off"
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              <FileText className="w-4 h-4 inline mr-1.5" />
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              rows={3}
              placeholder="Optional details about this group..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
