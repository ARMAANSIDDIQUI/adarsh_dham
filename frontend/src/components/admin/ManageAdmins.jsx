// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaUsers, FaEdit, FaTrashAlt, FaKey, FaTimes, FaPlusCircle } from 'react-icons/fa';
import api from '../../api/api.js';

// Define the roles globally
const roles = ['admin', 'super-operator', 'operator', 'satsang-operator'];

// Helper component for the Modal (to keep the main component cleaner)
const AdminModal = ({ user, modalOpen, setModalOpen, fetchUsers, setError }) => {
  const [updateForm, setUpdateForm] = useState({ name: user.name, phone: user.phone });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [deleteStep, setDeleteStep] = useState(false); // State for delete confirmation

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/update-details/${user._id}`, updateForm);
      fetchUsers();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user details.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/change-password/${user._id}`, passwordForm);
      fetchUsers();
      setPasswordForm({ newPassword: '' });
      // Keep modal open, but provide success feedback if needed, or close it after a brief pause
      // For now, closing the modal
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/delete-admin/${user._id}`);
      fetchUsers();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 overflow-y-auto flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md mx-auto rounded-xl shadow-2xl p-6 md:p-8">
        <button 
          onClick={() => setModalOpen(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        <h3 className="text-2xl font-bold mb-6 text-pink-500 border-b pb-2">
          Manage {user.name}
        </h3>

        {deleteStep ? (
          <div className="space-y-4">
            <p className="text-red-600 font-semibold">
              Are you sure you want to permanently delete **{user.name}**? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleDeleteUser} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                <FaTrashAlt className="mr-2" /> Yes, Delete
              </Button>
              <Button 
                onClick={() => setDeleteStep(false)} 
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Update Details Form */}
            <form onSubmit={handleUpdateDetails} className="space-y-4 border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <FaEdit className="mr-2 text-pink-400" /> Update Details
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <input type="text" name="name" value={updateForm.name} onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <input type="text" name="phone" value={updateForm.phone} onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" />
              </div>
              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg">
                Save Changes
              </Button>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-4 mb-6 border-b pb-6">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <FaKey className="mr-2 text-pink-400" /> Change Password
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-500">New Password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" />
              </div>
              <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg">
                <FaKey className="mr-2" /> Set New Password
              </Button>
            </form>

            {/* Delete Button */}
            <div className="pt-4">
              <Button 
                onClick={() => setDeleteStep(true)} 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
              >
                <FaTrashAlt className="mr-2" /> Delete Admin
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


const ManageAdmins = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', phone: '', password: '', roles: [] });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin');
      setUsers(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, role, hasRole) => {
    try {
      // Optimistic update
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, roles: hasRole ? u.roles.filter(r => r !== role) : [...u.roles, role] } : u
      ));
      
      await api.post(`/admin/toggle-role/${userId}`, { role, hasRole: !hasRole });
      
    } catch (err) {
      setError('Failed to update user role. Reverting changes.');
      // Revert if API fails
      fetchUsers(); 
    }
  };

  const handleNewAdminChange = (e) => {
    const { name, value } = e.target;
    setNewAdminForm({ ...newAdminForm, [name]: value });
  };

  const handleNewAdminRoleChange = (role) => {
    setNewAdminForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/add-admin', newAdminForm);
      setNewAdminForm({ name: '', phone: '', password: '', roles: [] });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add admin.');
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  if (loading) return <div className="text-center mt-20 text-xl text-gray-600">Loading administrator list...</div>;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-pink-500 pb-2 inline-block">
        <FaUsers className="inline mr-3 text-pink-500"/> Manage Administrators
      </h2>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">{error}</div>}

      {/* --- Add New Admin Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-pink-600 flex items-center">
            <FaPlusCircle className="mr-2"/> Add New Admin Account
        </h3>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="name" value={newAdminForm.name} onChange={handleNewAdminChange} placeholder="Full Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" required />
            <input type="text" name="phone" value={newAdminForm.phone} onChange={handleNewAdminChange} placeholder="Phone Number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" required />
            <input type="password" name="password" value={newAdminForm.password} onChange={handleNewAdminChange} placeholder="Temporary Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {roles.map(role => (
                <label key={role} className="inline-flex items-center p-2 rounded-full bg-pink-50 hover:bg-pink-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAdminForm.roles.includes(role)}
                    onChange={() => handleNewAdminRoleChange(role)}
                    className="form-checkbox h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                    {role.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md">
            <FaPlusCircle className="inline mr-2" /> Create Admin
          </Button>
        </form>
      </div>

      {/* --- Admin List Table --- */}
      <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              {roles.map(role => (
                <th key={role} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">
                  {role.replace('-', ' ').split(' ').map(s => s.charAt(0)).join('')}
                  <span className="hidden sm:inline">({role.replace('-', ' ')})</span>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {(users || []).map((user) => (
              <tr key={user._id} className="hover:bg-pink-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                {roles.map((role) => {
                  const hasRole = user.roles?.includes(role);
                  return (
                    <td key={role} className="px-4 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasRole}
                          onChange={() => handleRoleToggle(user._id, role, hasRole)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => openUserModal(user)} 
                    className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100 transition-colors"
                    aria-label={`Edit ${user.name}`}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Management Modal */}
      {modalOpen && selectedUser && (
        <AdminModal 
            user={selectedUser} 
            modalOpen={modalOpen} 
            setModalOpen={setModalOpen} 
            fetchUsers={fetchUsers} 
            setError={setError} 
        />
      )}
    </motion.div>
  );
};

export default ManageAdmins;
