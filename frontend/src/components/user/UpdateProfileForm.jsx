import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api.js';
import { updateUser } from '../../redux/slices/authSlice.js';
import { FaUser, FaSpinner } from 'react-icons/fa';
import ThemedInput from '../common/ThemedInput.jsx'; 
import { useTranslation } from '../../hooks/useTranslation';
import PhoneInput from '../common/PhoneInput.jsx';

const UpdateProfileForm = () => {
    const dispatch = useDispatch();
    const t = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    // Determines if the button should be disabled:
    // 1. If loading.
    // 2. If name is empty (trimmed).
    // 3. If name hasn't changed from the initial user state.
    const isNameChanged = name.trim() !== user?.name;
    const isButtonDisabled = loading || name.trim() === '' || !isNameChanged;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isButtonDisabled) return;

        setLoading(true);

        try {
            // Only send the name field for update
            const res = await api.put(`/users/profile`, { name });
            
            // Dispatch the updated user data to Redux
            dispatch(updateUser(res.data));
            toast.success(t.profile.updateForm.success);
        } catch (err) {
            console.error("Profile update failed:", err);
            const errorMessage = err.response?.data?.message || t.profile.updateForm.error;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 font-body bg-card p-6 rounded-2xl shadow-soft h-full">
            <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark border-b border-background pb-2">{t.profile.updateForm.button}</h3>
            <ThemedInput 
                label={t.profile.updateForm.name} 
                name="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                icon={<FaUser />}
            />
            <div>
                <PhoneInput 
                    label={t.profile.updateForm.phone} 
                    value={user?.phone || ''} 
                    disabled 
                />
            </div>
            <p className="text-xs text-gray-700 -mt-2">{t.profile.updateForm.phoneNotice}</p>
            
            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isButtonDisabled} 
                    className={`w-full text-lg py-3 inline-flex justify-center items-center text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 
                        ${isButtonDisabled 
                            ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                            : 'bg-primaryDark hover:bg-highlight'
                        }`}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2 h-5 w-5" /> {t.profile.updateForm.updating}
                        </>
                    ) : (
                        t.profile.updateForm.button
                    )}
                </button>
            </div>
        </form>
    );
};

export default UpdateProfileForm;