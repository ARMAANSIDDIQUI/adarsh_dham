import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaTimesCircle, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';
import api from '../../api/api';
// import Button from '../common/Button'; // Removed custom Button import
import { toast } from 'react-toastify';

const CommentsPage = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isCommentEmpty = newComment.trim() === '';
    const isButtonDisabled = submitting || isCommentEmpty;

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/comments'); 
            // Only show comments that are 'approved' to the general public
            const filteredComments = data.filter(c => c.status === 'approved' || (isAuthenticated && user.id === c.user._id));
            setComments(filteredComments);
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
        if (isCommentEmpty) {
            toast.error("Comment cannot be empty.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/comments', { content: newComment });
            setNewComment('');
            toast.success('Your comment has been submitted for review!');
            // Only re-fetch the comments list if the user is authenticated (to see their pending comment)
            if (isAuthenticated) {
                fetchComments();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit comment.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIconAndText = (comment) => {
        // Only show status to the owner of the comment
        if (isAuthenticated && user.id === comment.user._id) {
            switch (comment.status) {
                case 'rejected':
                    return <span className="flex items-center text-xs text-highlight"><FaTimesCircle className="mr-1" /> Rejected</span>;
                case 'pending':
                    return <span className="flex items-center text-xs text-accent"><FaHourglassHalf className="mr-1" /> Pending Review</span>;
                case 'approved':
                    // We don't show "Approved" status as it's visible to everyone anyway
                    return null; 
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
                {isAuthenticated ? (
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
                                {/* Dynamic Button Implementation */}
                                <button
                                    type="submit"
                                    disabled={isButtonDisabled}
                                    className={`inline-flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 
                                        ${isButtonDisabled 
                                            ? 'bg-gray-400 cursor-not-allowed opacity-70' // Disabled/Dull state
                                            : 'bg-primary hover:bg-primaryDark' // Enabled state
                                        }`}
                                >
                                    {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <p className="p-4 mb-8 text-center bg-card rounded-2xl shadow-soft text-gray-700">
                        Please <a href="/login" className="text-highlight font-semibold hover:underline">log in</a> to leave a comment or review.
                    </p>
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
                            // All comments in the list are either approved, or pending/rejected comments belonging to the current user.
                            return (
                                <motion.div 
                                    key={comment._id} 
                                    className="p-5 bg-card rounded-2xl shadow-soft"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-start">
                                        {/* Adjusted user icon size for better alignment */}
                                        <FaUserCircle className="text-3xl text-gray-400 mr-4 flex-shrink-0" />
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
                                </motion.div>
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
