import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Reusable component for a password input field with a toggle to show/hide the password.
 * Incorporated here to ensure the file is self-contained and avoids module not found errors.
 */
const PasswordInput = ({ name, placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="mt-1 relative">
            {/* Lock icon for visual hint */}
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
            {/* Toggle button */}
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
    const t = useTranslation();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);

    // Checks if the button should be disabled: true if any field is empty.
    const isFormIncomplete = Object.values(formData).some(val => val.trim() === '');
    const isButtonDisabled = loading || isFormIncomplete;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword.length < 6) {
            toast.error(t.profile.passwordForm.lengthError);
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error(t.profile.passwordForm.matchError);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put('/users/change-password', {
                newPassword: formData.newPassword
            });
            toast.success(data.message || t.profile.passwordForm.success);
            // Reset form fields on success
            setFormData({ newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || t.profile.passwordForm.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-2xl shadow-soft font-body h-full">
            <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark border-b border-background pb-2">{t.profile.passwordForm.title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">{t.profile.passwordForm.new}</label>
                    <PasswordInput
                        name="newPassword"
                        placeholder={t.profile.passwordForm.newPlaceholder}
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">{t.profile.passwordForm.confirm}</label>
                    <PasswordInput
                        name="confirmNewPassword"
                        placeholder={t.profile.passwordForm.confirmPlaceholder}
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                    />
                </div>
                <div className="pt-2">
                    {/* Native button with dynamic styling logic: Dull when disabled (gray-400), Highlight when enabled */}
                    <button 
                        type="submit" 
                        disabled={isButtonDisabled} 
                        className={`w-full text-lg py-3 inline-flex justify-center items-center text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 
                            ${isButtonDisabled 
                                ? 'bg-gray-400 cursor-not-allowed opacity-70' // Disabled/Dull state
                                : 'bg-primaryDark hover:bg-highlight' // Enabled state
                            }`}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2 h-5 w-5" /> {t.profile.passwordForm.updating}
                            </>
                        ) : (
                            t.profile.passwordForm.button
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;