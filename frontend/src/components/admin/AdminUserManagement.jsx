import React, { useState, useEffect } from 'react';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaSpinner, FaLock, FaUser, FaCheck, FaTimes, FaKey, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENT DEFINED OUTSIDE ---
// By defining the modal component here, it remains stable across re-renders of its parent.
// This prevents it from being recreated on every keystroke, which solves the focus issue.
const PasswordModal = ({
    isOpen,
    user,
    loading,
    error,
    onClose,
    onSubmit,
    passwordInput,
    onPasswordChange
}) => {
    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <motion.div
                        key={user._id} // Key ensures component resets for different users
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md"
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaLock className="mr-3 text-pink-500" /> Reset Password
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Changing password for: <span className="font-semibold">{user.name} ({user.phone})</span>
                        </p>

                        <form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password (Min 6 chars)
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={passwordInput}
                                    onChange={onPasswordChange}
                                    className={`w-full px-4 py-2 border rounded-lg shadow-sm transition-colors ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500'}`}
                                    minLength="6"
                                    required
                                    autoFocus // Automatically focus the input when the modal opens
                                    disabled={loading}
                                />
                            </div>
                            
                            {error && (
                                <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
                            )}

                            <div className="flex justify-end space-x-3">
                                <Button 
                                    type="button" 
                                    onClick={onClose}
                                    className="bg-gray-400 hover:bg-gray-500 text-gray-800"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-pink-600 hover:bg-pink-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <><FaKey className="inline-block mr-2"/> Set New Password</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


// --- MAIN PAGE COMPONENT ---
const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState(null);
    
    // States for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/all-users');
            setUsers(res.data);
            setGlobalError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setGlobalError(err.response?.data?.message || 'Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setCurrentUser(user);
        setPasswordInput('');
        setModalError(null);
        setIsModalLoading(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setCurrentUser(null), 300); // Delay clearing for animation
    };
    
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordInput.length < 6) {
            setModalError('Password must be at least 6 characters.');
            return;
        }

        setIsModalLoading(true);
        setModalError(null);
        setGlobalMessage(null);

        try {
            await api.put(`/admin/admin-change-password/${currentUser._id}`, {
                newPassword: passwordInput
            });

            setGlobalMessage(`Password successfully changed for ${currentUser.name}.`);
            handleCloseModal();
        
        } catch (err) {
            setModalError(err.response?.data?.message || 'Failed to change password on server.');
            setIsModalLoading(false);
        }
    };

    if (loading) return (
        <div className="text-center p-10">
            <FaSpinner className="animate-spin text-4xl text-pink-500 mx-auto" /> 
            <p className="mt-2">Loading Users...</p>
        </div>
    );

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles?.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b-4 border-pink-400 pb-3 flex items-center">
                <FaUser className="inline-block mr-3 text-pink-500" /> User Management
            </h2>

            {globalError && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 flex items-center shadow-md"><FaTimes className="mr-2"/>{globalError}</div>}
            {globalMessage && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 flex items-center shadow-md"><FaCheck className="mr-2"/>{globalMessage}</div>}

            <div className="mb-6 flex items-center max-w-md">
                <div className="relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm"
                    />
                </div>
            </div>

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
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-pink-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{user.roles.join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Button 
                                        onClick={() => handleOpenModal(user)}
                                        className="text-sm bg-pink-500 hover:bg-pink-600 py-2 px-3"
                                    >
                                        <FaLock className="inline-block mr-2" />Reset Password
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-gray-500">
                                    {users.length > 0 ? 'No users match your search.' : 'No users found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Render the stable modal component and pass props to it */}
            <PasswordModal
                isOpen={isModalOpen}
                user={currentUser}
                loading={isModalLoading}
                error={modalError}
                onClose={handleCloseModal}
                onSubmit={handleChangePassword}
                passwordInput={passwordInput}
                onPasswordChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (modalError) setModalError(null);
                }}
            />
        </div>
    );
};

export default AdminUserManagement;