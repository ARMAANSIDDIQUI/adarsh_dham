import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { setCredentials } from '../../redux/slices/authSlice'; // You'll need to add this to your authSlice
import Button from '../common/Button';
import { FaUser, FaSpinner } from 'react-icons/fa';

const UpdateProfileForm = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [name, setName] = useState(user.name);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { name });
            dispatch(setCredentials({ user: data, token: localStorage.getItem('token') }));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Edit Profile</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                </div>
                <div className="text-right mt-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <FaSpinner className="animate-spin mr-2" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfileForm;