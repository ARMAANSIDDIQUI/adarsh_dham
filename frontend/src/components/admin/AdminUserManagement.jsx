import React, { useState, useEffect } from 'react';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaSpinner, FaLock, FaUser, FaCheck, FaTimes, FaKey, FaSearch, FaEye, FaEyeSlash, FaEdit, FaSave } from 'react-icons/fa'; // Added FaEdit, FaSave
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import PhoneInput, { validatePhoneNumber } from '../common/PhoneInput.jsx';

const UserDetailsModal = ({
    isOpen,
    user,
    loading,
    error,
    onClose,
    onSubmit,
    formData,
    onFormChange
}) => {
    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-body">
                    <motion.div
                        key={user._id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-card p-6 md:p-8 rounded-2xl shadow-soft w-full max-w-md"
                    >
                        <h3 className="text-2xl font-bold text-primaryDark font-heading mb-6 flex items-center">
                            <FaEdit className="mr-3 text-primary" /> Edit User Details
                        </h3>

                        <form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => onFormChange('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <PhoneInput
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(val) => onFormChange('phone', val)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-highlight text-sm mb-4 text-center">{error}</p>
                            )}

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-background hover:bg-opacity-80 text-primaryDark"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primaryDark hover:bg-highlight text-white"
                                    disabled={loading}
                                >
                                    {loading ? <FaSpinner className="animate-spin inline-block mr-2" /> : <><FaSave className="inline-block mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

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
    // New state to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Reset visibility state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setShowPassword(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-body">
                    <motion.div
                        key={user._id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-card p-6 md:p-8 rounded-2xl shadow-soft w-full max-w-md"
                    >
                        <h3 className="text-2xl font-bold text-primaryDark font-heading mb-6 flex items-center">
                            <FaLock className="mr-3 text-primary" /> Reset Password
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Changing password for: <span className="font-semibold">{user.name} ({user.phone})</span>
                        </p>

                        <form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password (Min 6 chars)
                                </label>
                                <div className="relative">
                                    {/* Input field with dynamic type */}
                                    <input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordInput}
                                        onChange={onPasswordChange}
                                        // Increased right padding for the toggle icon
                                        className={`w-full pr-10 pl-4 py-2 border rounded-lg shadow-sm transition-colors ${error ? 'border-highlight focus:border-highlight focus:ring-highlight' : 'border-background focus:border-primary focus:ring-primary'}`}
                                        minLength="6"
                                        required
                                        autoFocus
                                        disabled={loading}
                                    />
                                    {/* Password Toggle Icon */}
                                    <span
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <p className="text-highlight text-sm mb-4 text-center">{error}</p>
                            )}

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-background hover:bg-opacity-80 text-primaryDark"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primaryDark hover:bg-highlight text-white"
                                    disabled={loading}
                                >
                                    {loading ? <FaSpinner className="animate-spin inline-block mr-2" /> : <><FaKey className="inline-block mr-2" /> Set New Password</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [editFormData, setEditFormData] = useState({ name: '', phone: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/all-users');
            setUsers(Array.isArray(res.data) ? res.data : []);
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

    const handleOpenPasswordModal = (user) => {
        setCurrentUser(user);
        setPasswordInput('');
        setModalError(null);
        setIsModalLoading(false);
        setIsPasswordModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setCurrentUser(user);
        setEditFormData({ name: user.name, phone: user.phone });
        setModalError(null);
        setIsModalLoading(false);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsPasswordModalOpen(false);
        setIsEditModalOpen(false);
        setTimeout(() => setCurrentUser(null), 300);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!validatePhoneNumber(editFormData.phone)) {
            setModalError('Please enter a valid phone number.');
            return;
        }

        setIsModalLoading(true);
        setModalError(null);
        setGlobalMessage(null);

        try {
            await api.put(`/admin/update-user-details/${currentUser._id}`, editFormData);

            // Optimistic UI update or refetch
            setUsers(users.map(u => u._id === currentUser._id ? { ...u, ...editFormData } : u));

            setGlobalMessage(`User details updated for ${editFormData.name}.`);
            toast.success(`User details updated successfully.`);
            handleCloseModals();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update user details.';
            setModalError(msg);
            toast.error(msg);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordInput.length < 6) {
            setModalError('Password must be at least 6 characters.');
            toast.error('Password must be at least 6 characters.');
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
            toast.success(`Password successfully changed for ${currentUser.name}.`);
            handleCloseModals();

        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password on server.';
            setModalError(msg);
            setIsModalLoading(false);
            toast.error(msg);
        }
    };

    if (loading) return (
        <div className="text-center p-10 font-body text-gray-700">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto" />
            <p className="mt-2">Loading Users...</p>
        </div>
    );

    const filteredUsers = Array.isArray(users) ? users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.roles && user.roles.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    return (
        <div className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-heading mb-8 border-b-4 border-primary pb-3 flex items-center">
                <FaUser className="inline-block mr-3 text-primary" /> User Management
            </h2>

            {globalError && <div className="bg-highlight/10 text-highlight p-4 rounded-xl mb-4 flex items-center shadow-soft"><FaTimes className="mr-2" />{globalError}</div>}
            {globalMessage && <div className="bg-accent/10 text-accent p-4 rounded-xl mb-4 flex items-center shadow-soft"><FaCheck className="mr-2" />{globalMessage}</div>}

            <div className="mb-6 flex items-center max-w-md">
                <div className="relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-card rounded-2xl shadow-soft overflow-x-auto">
                <table className="min-w-full divide-y divide-background">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-background">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-background transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-700">{user.roles ? user.roles.join(', ') : 'User'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                    <Button
                                        onClick={() => handleOpenEditModal(user)}
                                        className="text-sm bg-accent hover:bg-highlight text-white py-2 px-3"
                                        title="Edit Details"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        onClick={() => handleOpenPasswordModal(user)}
                                        className="text-sm bg-primaryDark hover:bg-highlight text-white py-2 px-3"
                                        title="Reset Password"
                                    >
                                        <FaLock />
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

            <UserDetailsModal
                isOpen={isEditModalOpen}
                user={currentUser}
                loading={isModalLoading}
                error={modalError}
                onClose={handleCloseModals}
                onSubmit={handleUpdateUser}
                formData={editFormData}
                onFormChange={(field, value) => {
                    setEditFormData(prev => ({ ...prev, [field]: value }));
                    if (modalError) setModalError(null);
                }}
            />

            <PasswordModal
                isOpen={isPasswordModalOpen}
                user={currentUser}
                loading={isModalLoading}
                error={modalError}
                onClose={handleCloseModals}
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