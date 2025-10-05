import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api.js';
import { updateUser } from '../../redux/slices/authSlice.js';
import { FaUser, FaPhoneAlt, FaSpinner } from 'react-icons/fa';
// Removed Button import as we're using native button
// import Button from '../common/Button.jsx'; 
import ThemedInput from '../common/ThemedInput.jsx'; 

const UpdateProfileForm = () => {
    const dispatch = useDispatch();
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
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error("Profile update failed:", err);
            const errorMessage = err.response?.data?.message || 'Profile update failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 font-body">
            <ThemedInput 
                label="Name" 
                name="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                icon={<FaUser />}
            />
            <ThemedInput 
                label="Phone Number" 
                name="phone" 
                value={user?.phone || ''} 
                disabled 
                icon={<FaPhoneAlt />}
            />
            <p className="text-xs text-gray-700 -mt-2">Phone number cannot be changed.</p>
            
            {/* Replaced Button with native button and dynamic styling */}
            <button 
                type="submit" 
                disabled={isButtonDisabled} 
                // Dynamic styling: Dull when disabled (loading or no valid change), bright when enabled.
                className={`w-full text-lg py-3 inline-flex justify-center items-center text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 
                    ${isButtonDisabled 
                        ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                        : 'bg-highlight hover:bg-primaryDark'
                    }`}
            >
                {loading ? (
                    <>
                        <FaSpinner className="animate-spin mr-2 h-5 w-5" /> Updating...
                    </>
                ) : (
                    'Update Details'
                )}
            </button>
        </form>
    );
};

export default UpdateProfileForm;
