import React, { useState, useEffect } from 'react';
import api from '../../api/api.js'; // Assuming this path is correct in your real project structure
import Button from '../common/Button.jsx'; // Assuming this path is correct in your real project structure
import { FaSpinner, FaLock, FaUser, FaCheck, FaTimes, FaKey } from 'react-icons/fa'; 
import { motion, AnimatePresence } from 'framer-motion';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, user: null, newPassword: '', loading: false });

    // --- FUNCTION TO FETCH REAL USERS ---
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // This API call hits the actual backend endpoint to fetch all users
            const res = await api.get('/admin/all-users');
            setUsers(res.data);
            setGlobalError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setGlobalError(err.response?.data?.message || 'Failed to fetch user data. Check network and admin permissions.');
        } finally {
            setLoading(false);
        }
    };
    // ------------------------------------

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (modal.newPassword.length < 6) {
            setGlobalError('Password must be at least 6 characters.');
            return;
        }

        setModal(prev => ({ ...prev, loading: true }));
        setGlobalError(null);
        setGlobalMessage(null);

        try {
            // API call to the actual backend endpoint to reset the user's password
            await api.put(`/admin/admin-change-password/${modal.user._id}`, {
                newPassword: modal.newPassword
            });
            
            setGlobalMessage(`Password successfully changed for ${modal.user.name}. The user has been notified.`);
            setModal({ isOpen: false, user: null, newPassword: '', loading: false });
        } catch (err) {
            setGlobalError(err.response?.data?.message || 'Failed to change password on server.');
            setModal(prev => ({ ...prev, loading: false }));
        }
    };

    const PasswordModal = () => (
        <AnimatePresence>
            {modal.isOpen && modal.user && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md"
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaLock className="mr-3 text-pink-500" /> Reset Password
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Changing password for: <span className="font-semibold">{modal.user.name} ({modal.user.phone})</span>
                        </p>
                        
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-6">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password (Min 6 chars)</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={modal.newPassword}
                                    onChange={(e) => setModal(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-colors"
                                    minLength="6"
                                    required
                                    disabled={modal.loading}
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <Button 
                                    type="button" 
                                    onClick={() => setModal({ isOpen: false, user: null, newPassword: '', loading: false })}
                                    className="bg-gray-400 hover:bg-gray-500 text-gray-800"
                                    disabled={modal.loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-pink-600 hover:bg-pink-700 text-white"
                                    disabled={modal.loading}
                                >
                                    {modal.loading ? <FaSpinner className="animate-spin" /> : <><FaKey className="inline-block mr-2"/> Set New Password</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (loading) return <div className="text-center p-10"><FaSpinner className="animate-spin text-4xl text-pink-500 mx-auto" /> <p className="mt-2">Loading Users...</p></div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b-4 border-pink-400 pb-3">
                <FaUser className="inline-block mr-3 text-pink-500" /> User Management
            </h2>

            {globalError && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 flex items-center shadow-md"><FaTimes className="mr-2"/>{globalError}</div>}
            {globalMessage && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 flex items-center shadow-md"><FaCheck className="mr-2"/>{globalMessage}</div>}

            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-pink-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">
                                    {user.roles.join(', ')}
                                </td >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Button 
                                        onClick={() => setModal({ isOpen: true, user: user, newPassword: '', loading: false })}
                                        className="text-sm bg-pink-500 hover:bg-pink-600 py-2 px-3"
                                    >
                                        <FaLock className="inline-block mr-2" />Reset Password
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <p className="p-6 text-center text-gray-500">No users found.</p>
                )}
            </div>

            <PasswordModal />
        </div>
    );
};

export default AdminUserManagement;
