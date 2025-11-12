import React, { useState } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { X, Loader2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const validCode = /^[a-z0-9-]+$/.test(code); // slug rule

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validCode) {
      setError('The code must use lowercase letters, numbers or dashes (no spaces).');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await adminService.createGroup({ code, name, description });
      addNotification('Group created', 'success');
      onCreated();
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('already exists')) {
        setError('The code already exists.');
      } else {
        setError(err.message || 'Error creating group');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Group</h2>
            <p className="text-sm text-gray-500">Define slug, name and description</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-center border border-red-200">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code (unique slug)</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.trim())}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 ${code && !validCode ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="analytics"
            />
            {!validCode && code && (
              <p className="text-xs text-red-600 mt-1">Only lowercase, numbers and dashes are allowed.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Analytics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional details about the group"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={submitting || !code || !name || !validCode}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
