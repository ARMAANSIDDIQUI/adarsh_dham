import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // CORRECTED: Added this missing import
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaTimesCircle, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';
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
    }, [isAuthenticated]);

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
            fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit comment.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIconAndText = (comment) => {
        if (isAuthenticated && user.id === comment.user._id) {
            switch (comment.status) {
                case 'rejected':
                    return <span className="flex items-center text-xs text-highlight"><FaTimesCircle className="mr-1" /> Rejected</span>;
                case 'pending':
                    return <span className="flex items-center text-xs text-accent"><FaHourglassHalf className="mr-1" /> Pending Review</span>;
                default:
                    return null;
            }
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 bg-neutral min-h-screen font-body"
        >
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold font-heading mb-6 text-primaryDark border-b-4 border-primary pb-2">Comments & Reviews</h2>

                {/* New Comment Form */}
                {isAuthenticated && (
                    <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                        <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark">Leave a Review</h3>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full p-3 border border-background bg-neutral/50 rounded-lg focus:ring-2 focus:ring-primary transition"
                                rows="4"
                                disabled={submitting}
                            />
                            <div className="text-right mt-4">
                                <Button type="submit" disabled={submitting} className="inline-flex items-center bg-primary hover:bg-primaryDark text-white">
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
                            <FaSpinner className="animate-spin text-primary text-3xl" />
                        </div>
                    ) : error ? (
                        <p className="text-highlight text-center">{error}</p>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => {
                            const status = getStatusIconAndText(comment);
                            if (comment.status === 'rejected' && user?.id !== comment.user._id) {
                                return null;
                            }
                            return (
                                <div key={comment._id} className="p-5 bg-card rounded-2xl shadow-soft">
                                    <div className="flex items-start">
                                        <FaUserCircle className="text-3xl text-background mr-4 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold font-heading text-primaryDark">{comment.user?.name || 'Anonymous'}</p>
                                                {status && <div className="ml-4 flex-shrink-0">{status}</div>}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-700 text-center italic py-4">No comments yet. Be the first to leave a review!</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CommentsPage;