import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaInfoCircle, FaUserClock } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const PasswordResetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // CORRECTED THIS LINE
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
            className="p-4 md:p-8 bg-neutral min-h-screen font-body"
        >
            <h2 className="text-3xl font-bold font-heading mb-6 text-primaryDark border-b-4 border-primary pb-2">Password Reset Requests</h2>
            
            <div className="bg-accent/10 border-l-4 border-accent text-accent p-4 mb-6 rounded-r-lg" role="alert">
                <p className="font-bold flex items-center"><FaInfoCircle className="mr-2"/>Instructions</p>
                <p>Review the requests below. After contacting the user and resetting their password, mark the request as "Resolved".</p>
                <p className="mt-2">You can reset passwords from the <Link to="/admin/user-management" className="font-semibold underline hover:text-primaryDark">User Management</Link> page.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-primary text-4xl" /></div>
            ) : error ? (
                <p className="text-highlight bg-highlight/10 p-3 rounded-xl text-center shadow-soft">{error}</p>
            ) : (
                <div className="space-y-4">
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req._id} className="bg-card p-5 rounded-2xl shadow-soft">
                                <div className="flex flex-col sm:flex-row justify-between items-start">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <p className="font-bold font-heading text-lg text-primaryDark">{req.user?.name || 'User Not Found'}</p>
                                        <p className="text-sm text-gray-700">Phone: {req.phone}</p>
                                        <p className="text-xs text-gray-500">Requested on: {new Date(req.createdAt).toLocaleString()}</p>
                                        <div className="mt-3 p-3 bg-background rounded-xl border border-card h-full">
                                            <p className="text-sm font-semibold text-gray-700">User's Reason:</p>
                                            <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4">
                                        <Button onClick={() => handleResolve(req._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
                                            <FaCheck className="mr-2" /> Mark as Resolved
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                            <FaUserClock className="mx-auto text-5xl text-background" />
                            <p className="mt-4 text-gray-700">No pending password requests.</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default PasswordResetRequests;