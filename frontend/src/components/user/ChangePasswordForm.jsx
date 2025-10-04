import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import Button from '../common/Button';
import { FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordInput = ({ name, placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="mt-1 relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                required
                minLength="6"
                className="w-full pl-10 pr-10 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm"
                placeholder={placeholder}
            />
            <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>
    );
};

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
        <div className="bg-card p-6 rounded-2xl shadow-soft font-body">
            <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <PasswordInput
                        name="currentPassword"
                        placeholder="Enter your current password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <PasswordInput
                        name="newPassword"
                        placeholder="Minimum 6 characters"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <PasswordInput
                        name="confirmNewPassword"
                        placeholder="Re-enter new password"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                    />
                </div>
                <div className="text-right pt-2">
                    <Button type="submit" disabled={loading} className="bg-highlight hover:bg-primaryDark text-white">
                        {loading && <FaSpinner className="animate-spin mr-2" />}
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;