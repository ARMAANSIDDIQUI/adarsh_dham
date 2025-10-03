import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaUserClock, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const PasswordResetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/password-requests/pending');
            setRequests(data);
        } catch (err) {
            setError('Failed to fetch password requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleResolve = async (requestId) => {
        try {
            await api.put(`/password-requests/${requestId}/resolve`);
            toast.success('Request marked as resolved.');
            setRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resolve request.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 bg-gray-100 min-h-screen"
        >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-4 border-pink-500 pb-2">Password Reset Requests</h2>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-r-lg" role="alert">
                <p className="font-bold flex items-center"><FaInfoCircle className="mr-2"/>Instructions</p>
                <p>Review the requests below. After contacting the user and resetting their password, mark the request as "Resolved".</p>
                <p className="mt-2">You can reset passwords from the <Link to="/admin/user-management" className="font-semibold underline hover:text-blue-900">User Management</Link> page.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : (
                <div className="space-y-4">
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req._id} className="bg-white p-5 rounded-lg shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <p className="font-bold text-lg text-gray-800">{req.user?.name || 'User Not Found'}</p>
                                        <p className="text-sm text-gray-600">Phone: {req.phone}</p>
                                        <p className="text-xs text-gray-400">Requested on: {new Date(req.createdAt).toLocaleString()}</p>
                                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-sm font-semibold text-gray-700">User's Reason:</p>
                                            <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 self-center">
                                        <Button onClick={() => handleResolve(req._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                            <FaCheck className="mr-2" /> Mark as Resolved
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <FaUserClock className="mx-auto text-5xl text-gray-300" />
                            <p className="mt-4 text-gray-500">No pending password requests.</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default PasswordResetRequests;