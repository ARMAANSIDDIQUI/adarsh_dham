import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import api from '../../api/api';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const ManageComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingComments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/comments/pending');
            setComments(data);
        } catch (err) {
            setError('Failed to fetch pending comments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingComments();
    }, []);

    const handleAction = async (commentId, action) => {
        try {
            await api.put(`/comments/${action}/${commentId}`);
            toast.success(`Comment ${action}d successfully!`);
            // Remove the comment from the list to update the UI
            setComments(prevComments => prevComments.filter(c => c._id !== commentId));
        } catch (err) {
            toast.error(`Failed to ${action} comment.`);
            console.error(err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 bg-gray-100 min-h-screen"
        >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-4 border-pink-500 pb-2">Manage User Comments</h2>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-pink-500 text-4xl" />
                </div>
            ) : error ? (
                <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment._id} className="p-4 border rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <p className="text-gray-800 italic">"{comment.content}"</p>
                                        <div className="text-xs text-gray-500 mt-2 flex items-center">
                                            <FaUser className="mr-2" />
                                            <span>By: <strong>{comment.user?.name || 'Unknown User'}</strong> ({comment.user?.phone})</span>
                                            <span className="mx-2">|</span>
                                            <span>Submitted: {new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 self-end sm:self-center">
                                        <Button onClick={() => handleAction(comment._id, 'approve')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1">
                                            <FaCheck className="inline mr-1" /> Approve
                                        </Button>
                                        <Button onClick={() => handleAction(comment._id, 'reject')} className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 py-1">
                                            <FaTimes className="inline mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No pending comments to review.</p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default ManageComments;