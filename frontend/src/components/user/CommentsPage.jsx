import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';
import api from '../../api/api';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const CommentsPage = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchComments = async () => {
        try {
            setLoading(true);
            // Use the new public endpoint
            const { data } = await api.get('/comments'); 
            setComments(data);
        } catch (err) {
            setError('Failed to fetch comments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [isAuthenticated]); // Refetch if user's login status changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/comments', { content: newComment });
            setNewComment('');
            toast.success('Your comment has been submitted for review!');
            fetchComments(); // Refresh the list with the new pending comment
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit comment.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIconAndText = (comment) => {
        // Only show status for the logged-in user's non-approved comments
        if (isAuthenticated && user.id === comment.user._id) {
            switch (comment.status) {
                case 'rejected':
                    return <span className="flex items-center text-xs text-rose-500"><FaTimesCircle className="mr-1" /> Rejected</span>;
                case 'pending':
                    return <span className="flex items-center text-xs text-amber-500"><FaHourglassHalf className="mr-1" /> Pending Review</span>;
                default:
                    return null; // Don't show status for approved comments
            }
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 bg-gray-50 min-h-screen"
        >
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-4 border-pink-500 pb-2">Comments & Reviews</h2>

                {/* New Comment Form - only show if logged in */}
                {isAuthenticated && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Leave a Review</h3>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 transition"
                                rows="4"
                                disabled={submitting}
                            />
                            <div className="text-right mt-4">
                                <Button type="submit" disabled={submitting} className="inline-flex items-center">
                                    {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <FaSpinner className="animate-spin text-pink-500 text-3xl" />
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => {
                            const status = getStatusIconAndText(comment);
                            // Hide rejected comments from public view (but not from the user who posted it)
                            if (comment.status === 'rejected' && user?.id !== comment.user._id) {
                                return null;
                            }
                            return (
                                <div key={comment._id} className="p-5 bg-white rounded-lg shadow">
                                    <div className="flex items-start">
                                        <FaUserCircle className="text-3xl text-gray-400 mr-4 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-800">{comment.user?.name || 'Anonymous'}</p>
                                                {status && <div className="ml-4 flex-shrink-0">{status}</div>}
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center italic py-4">No comments yet. Be the first to leave a review!</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CommentsPage;