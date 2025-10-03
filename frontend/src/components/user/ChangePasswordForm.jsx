import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import Button from '../common/Button';
import { FaLock, FaSpinner } from 'react-icons/fa';

// ✅ MOVED OUTSIDE: This component is now defined only once, which preserves focus.
// It now also accepts an `onChange` handler as a prop.
const PasswordInput = ({ name, placeholder, value, onChange }) => (
    <div className="mt-1 relative">
        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
            type="password"
            name={name}
            value={value}
            onChange={onChange} // Use the passed-in handler
            required
            minLength="6"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder={placeholder}
        />
    </div>
);

const ChangePasswordForm = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            // Using the correct endpoint from your userController
            const { data } = await api.put('/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success(data.message || 'Password changed successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <PasswordInput 
                        name="currentPassword" 
                        placeholder="Enter your current password" 
                        value={formData.currentPassword} 
                        onChange={handleChange} // Pass the handler
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <PasswordInput 
                        name="newPassword" 
                        placeholder="Minimum 6 characters" 
                        value={formData.newPassword} 
                        onChange={handleChange} // Pass the handler
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <PasswordInput 
                        name="confirmNewPassword" 
                        placeholder="Re-enter new password" 
                        value={formData.confirmNewPassword} 
                        onChange={handleChange} // Pass the handler
                    />
                </div>
                <div className="text-right pt-2">
                    <Button type="submit" disabled={loading}>
                        {loading && <FaSpinner className="animate-spin mr-2" />}
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;