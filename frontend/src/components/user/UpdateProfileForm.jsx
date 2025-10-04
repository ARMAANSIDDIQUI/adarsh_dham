import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api.js';
import { updateUser } from '../../redux/slices/authSlice.js';
import { FaUser, FaPhoneAlt } from 'react-icons/fa';
import Button from '../common/Button.jsx';
import ThemedInput from '../common/ThemedInput.jsx'; 

const UpdateProfileForm = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.put(`/users/profile`, { name });
            
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
            
            <Button type="submit" className="w-full text-lg py-3 shadow-soft bg-primary hover:bg-primaryDark text-white" disabled={loading}>
                {loading ? 'Updating...' : 'Update Details'}
            </Button>
        </form>
    );
};

export default UpdateProfileForm;