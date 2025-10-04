// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaUsers, FaEdit, FaTrashAlt, FaKey, FaTimes, FaPlusCircle } from 'react-icons/fa';
import api from '../../api/api.js';

const roles = ['admin', 'super-operator', 'operator', 'satsang-operator'];

const AdminModal = ({ user, modalOpen, setModalOpen, fetchUsers, setError }) => {
  const [updateForm, setUpdateForm] = useState({ name: user.name, phone: user.phone });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [deleteStep, setDeleteStep] = useState(false);

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto flex items-center justify-center p-4 font-body">
      <div className="relative bg-card w-full max-w-md mx-auto rounded-2xl shadow-soft p-6 md:p-8">
        <button 
          onClick={() => setModalOpen(false)} 
          className="absolute top-4 right-4 text-primaryDark hover:text-accent transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        <h3 className="text-2xl font-bold font-heading mb-6 text-primaryDark border-b border-background pb-2">
          Manage {user.name}
        </h3>

        {deleteStep ? (
          <div className="space-y-4">
            <p className="text-highlight font-semibold">
              Are you sure you want to permanently delete <strong>{user.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleDeleteUser} 
                className="flex-1 bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg"
              >
                <FaTrashAlt className="mr-2" /> Yes, Delete
              </Button>
              <Button 
                onClick={() => setDeleteStep(false)} 
                className="flex-1 bg-background hover:bg-opacity-80 text-primaryDark font-medium rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleUpdateDetails} className="space-y-4 border-b border-background pb-6 mb-6">
              <h4 className="font-semibold font-heading text-primaryDark flex items-center">
                <FaEdit className="mr-2 text-primary" /> Update Details
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" value={updateForm.name} onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" name="phone" value={updateForm.phone} onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" />
              </div>
              {/* CORRECTED: Changed to highlight pink */}
              <Button type="submit" className="w-full bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg">
                Save Changes
              </Button>
            </form>

            <form onSubmit={handleChangePassword} className="space-y-4 mb-6 border-b border-background pb-6">
              <h4 className="font-semibold font-heading text-primaryDark flex items-center">
                <FaKey className="mr-2 text-primary" /> Change Password
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" />
              </div>
              {/* CORRECTED: Changed to highlight pink */}
              <Button type="submit" className="w-full bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg">
                <FaKey className="mr-2" /> Set New Password
              </Button>
            </form>

            <div className="pt-4">
              <Button 
                onClick={() => setDeleteStep(true)} 
                className="w-full bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (userId, role, hasRole) => {
    try {
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, roles: hasRole ? u.roles.filter(r => r !== role) : [...u.roles, role] } : u
      ));
      await api.post(`/admin/toggle-role/${userId}`, { role, hasRole: !hasRole });
    } catch (err) {
      setError('Failed to update user role. Reverting changes.');
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.phone.includes(searchQuery);
    const matchesRole = roleFilter ? user.roles.includes(roleFilter) : true;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="text-center mt-20 text-xl text-gray-700 font-body">Loading administrator list...</div>;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-primary pb-2 inline-block font-heading">
        <FaUsers className="inline mr-3 text-primary"/> Manage Administrators
      </h2>

      {error && <div className="p-4 mb-4 text-highlight bg-highlight/10 rounded-xl font-medium">{error}</div>}

      <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primaryDark font-heading flex items-center">
            <FaPlusCircle className="mr-2"/> Add New Admin Account
        </h3>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="name" value={newAdminForm.name} onChange={handleNewAdminChange} placeholder="Full Name" className="w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" required />
            <input type="text" name="phone" value={newAdminForm.phone} onChange={handleNewAdminChange} placeholder="Phone Number" className="w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" required />
            <input type="password" name="password" value={newAdminForm.password} onChange={handleNewAdminChange} placeholder="Temporary Password" className="w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {roles.map(role => (
                <label key={role} className="inline-flex items-center p-2 rounded-full bg-background/50 hover:bg-background cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAdminForm.roles.includes(role)}
                    onChange={() => handleNewAdminRoleChange(role)}
                    className="form-checkbox h-4 w-4 text-primary border-background rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{role.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          {/* CORRECTED: Changed to highlight pink */}
          <Button type="submit" className="w-full md:w-auto bg-highlight hover:bg-primaryDark text-white font-semibold py-2 px-6 rounded-lg shadow-soft">
            <FaPlusCircle className="inline mr-2" /> Create Admin
          </Button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors capitalize"
        >
          <option value="">All Roles</option>
          {roles.map(role => <option key={role} value={role} className="capitalize">{role.replace('-', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-card shadow-soft rounded-2xl overflow-x-auto">
        <table className="min-w-full divide-y divide-background">
          <thead className="bg-background/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Phone</th>
              {roles.map(role => (
                <th key={role} className="px-4 py-3 text-center text-xs font-semibold font-heading text-primaryDark tracking-wider min-w-[100px] capitalize">
                  {role.replace('-', ' ').split(' ').map(s => s.charAt(0)).join('')}
                  <span className="hidden sm:inline"> ({role.replace('-', ' ')})</span>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-semibold font-heading text-primaryDark uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-background">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-background transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
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
                        <div className="w-10 h-5 bg-background peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-background after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => openUserModal(user)} 
                    className="text-accent hover:text-primaryDark p-2 rounded-full hover:bg-background transition-colors"
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