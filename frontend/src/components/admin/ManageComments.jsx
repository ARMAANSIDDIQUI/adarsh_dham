import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes, FaUser, FaSearch, FaUndo } from 'react-icons/fa';
import api from '../../api/api';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const style = useMemo(() => {
        switch (status) {
            case 'approved':
                return { text: 'Approved', classes: 'bg-emerald-100 text-emerald-800' };
            case 'rejected':
                return { text: 'Rejected', classes: 'bg-red-100 text-red-800' };
            default:
                return { text: 'Pending', classes: 'bg-yellow-100 text-yellow-800' };
        }
    }, [status]);

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.classes}`}>
            {style.text}
        </span>
    );
};


const ManageComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [statusFilter, setStatusFilter] = useState('pending'); 

    const fetchAllComments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/comments/all');
            setComments(data);
        } catch (err) {
            setError('Failed to fetch comments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllComments();
    }, []);

    // --- CORRECTED FUNCTION ---
    const handleAction = async (commentId, action) => {
        try {
            await api.put(`/comments/${action}/${commentId}`);
            toast.success(`Comment ${action}d successfully!`);
            
            // Explicitly set the new status instead of guessing
            const newStatus = action === 'approve' ? 'approved' : 'rejected';

            setComments(prevComments =>
                prevComments.map(c =>
                    c._id === commentId ? { ...c, status: newStatus } : c
                )
            );
        } catch (err) {
            toast.error(`Failed to ${action} comment.`);
            console.error(err);
        }
    };
    // --- END CORRECTION ---

    const handleReconsider = async (commentId) => {
        try {
            await api.put(`/comments/reconsider/${commentId}`);
            toast.success('Comment status has been reset to pending.');
            setComments(prevComments =>
                prevComments.map(c =>
                    c._id === commentId ? { ...c, status: 'pending' } : c
                )
            );
        } catch (err) {
            toast.error('Failed to reset comment status.');
            console.error(err);
        }
    };

    const handleDateChange = (e) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateRange({ startDate: '', endDate: ''});
        setStatusFilter('pending');
    };

    const filteredComments = useMemo(() => {
        return comments.filter(comment => {
            const matchesStatus = statusFilter ? comment.status === statusFilter : true;

            let matchesDate = true;
            if (dateRange.startDate || dateRange.endDate) {
                const commentDate = new Date(comment.createdAt);
                commentDate.setHours(0, 0, 0, 0);

                if (dateRange.startDate) {
                    const startDate = new Date(dateRange.startDate);
                    if (commentDate < startDate) matchesDate = false;
                }
                if (dateRange.endDate) {
                    const endDate = new Date(dateRange.endDate);
                    if (commentDate > endDate) matchesDate = false;
                }
            }

            const lowercasedSearch = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (comment.user?.name || '').toLowerCase().includes(lowercasedSearch) ||
                (comment.user?.phone || '').includes(searchTerm);

            return matchesStatus && matchesDate && matchesSearch;
        });
    }, [comments, searchTerm, dateRange, statusFilter]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 bg-neutral min-h-screen font-body"
        >
            <h2 className="text-3xl font-bold font-heading mb-6 text-gray-800 border-b-4 border-primary pb-2">Manage User Comments</h2>
            
            <div className="bg-card p-4 rounded-2xl shadow-soft mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="relative md:col-span-2">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by user name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 pl-10 border border-background rounded-lg w-full focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="flex-grow">
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border border-background rounded-lg w-full focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="">All Statuses</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-600 shrink-0">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="p-2 border border-background rounded-lg w-full focus:ring-primary focus:border-primary"
                    />
                </div>
                 <div className="flex items-center space-x-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-600 shrink-0">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="p-2 border border-background rounded-lg w-full focus:ring-primary focus:border-primary"
                    />
                </div>
                <Button onClick={clearFilters} className="bg-gray-500 hover:bg-gray-600 text-white md:col-span-5">Clear Filters</Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-primary text-4xl" /></div>
            ) : error ? (
                <p className="text-highlight bg-highlight/10 p-3 rounded-xl text-center shadow-soft">{error}</p>
            ) : (
                <div className="bg-card rounded-2xl shadow-soft p-6">
                    {filteredComments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredComments.map(comment => (
                                <div key={comment._id} className="p-4 border border-background rounded-xl bg-background/50 flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-700 italic">"{comment.content}"</p>
                                            <StatusBadge status={comment.status} />
                                        </div>
                                        <div className="text-xs text-gray-700 mt-2 flex items-center flex-wrap">
                                            <FaUser className="mr-2" />
                                            <span>By: <strong>{comment.user?.name || 'Unknown User'}</strong> ({comment.user?.phone})</span>
                                            <span className="mx-2">|</span>
                                            <span>Submitted: {new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 self-end sm:self-center sm:ml-4">
                                        {comment.status === 'pending' ? (
                                            <>
                                                <Button onClick={() => handleAction(comment._id, 'approve')} className="bg-primary hover:bg-primaryDark text-white text-xs px-3 py-1 rounded-lg"><FaCheck className="inline mr-1" /> Approve</Button>
                                                <Button onClick={() => handleAction(comment._id, 'reject')} className="bg-highlight hover:bg-primaryDark text-white text-xs px-3 py-1 rounded-lg"><FaTimes className="inline mr-1" /> Reject</Button>
                                            </>
                                        ) : (
                                            <Button onClick={() => handleReconsider(comment._id)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded-lg"><FaUndo className="inline mr-1" /> Reconsider</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-700 py-8">No comments match your filters.</p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default ManageComments;