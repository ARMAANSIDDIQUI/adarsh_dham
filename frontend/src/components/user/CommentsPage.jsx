// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaUserCircle, FaTrashAlt } from 'react-icons/fa';
import api from '../../api/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../../hooks/useTranslation';

// Simple Confirmation Modal for Deletion
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, title, cancelText, confirmText }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50 font-body">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card p-6 rounded-2xl shadow-soft w-full max-w-sm m-4"
            >
                <h3 className="text-xl font-bold font-heading text-primaryDark mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                        {confirmText || 'Delete'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


const CommentsPage = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [commentToDelete, setCommentToDelete] = useState(null);
    const t = useTranslation();

    const isCommentEmpty = newComment.trim() === '';
    const isButtonDisabled = submitting || isCommentEmpty;

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/comments'); 
            setComments(data);
        } catch (err) {
            setError(t.comments.error.fetchFail);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [isAuthenticated, t.comments.error.fetchFail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isCommentEmpty) {
            toast.error(t.comments.error.empty);
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/comments', { content: newComment });
            setNewComment('');
            toast.success(t.comments.error.submitSuccess);
            if (isAuthenticated) {
                fetchComments();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t.comments.error.submitFail);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;

        try {
            await api.delete(`/comments/${commentToDelete}`);
            toast.success(t.comments.error.deleteSuccess);
            setComments(prev => prev.filter(c => c._id !== commentToDelete));
        } catch (err) {
            toast.error(err.response?.data?.message || t.comments.error.deleteFail);
            console.error(err);
        } finally {
            setCommentToDelete(null); 
        }
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 bg-neutral min-h-screen font-body"
        >
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold font-heading mb-6 text-primaryDark border-b-4 border-primary pb-2 text-center">{t.comments.title}</h2>

                {isAuthenticated ? (
                    <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                        <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark">{t.comments.leaveReview}</h3>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t.comments.placeholder}
                                className="w-full p-3 border border-background bg-neutral/50 rounded-lg focus:ring-2 focus:ring-primary transition"
                                rows="4"
                                disabled={submitting}
                            />
                            <div className="text-right mt-4">
                                <button
                                    type="submit"
                                    disabled={isButtonDisabled}
                                    className={`inline-flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50
                                        ${isButtonDisabled
                                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                            : 'bg-primary hover:bg-primaryDark'
                                        }`}
                                >
                                    {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                                    {submitting ? t.comments.submitting : t.comments.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <p className="p-4 mb-8 text-center bg-card rounded-2xl shadow-soft text-gray-700">
                        {t.comments.loginPrompt} <a href="/login" className="text-highlight font-semibold hover:underline">{t.comments.loginLink}</a> {t.comments.loginSuffix}
                    </p>
                )}

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <FaSpinner className="animate-spin text-primary text-3xl" />
                        </div>
                    ) : error ? (
                        <p className="text-highlight text-center">{error}</p>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => {
                            const isOwner = isAuthenticated && user.id === comment.user._id;
                            return (
                                <motion.div
                                    key={comment._id}
                                    className="p-5 bg-card rounded-2xl shadow-soft"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-start">
                                        <FaUserCircle className="text-3xl text-gray-400 mr-4 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold font-heading text-primaryDark">{comment.user?.name || t.comments.anonymous}</p>
                                                <div className="flex items-center space-x-4">
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => setCommentToDelete(comment._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete Comment"
                                                        >
                                                            <FaTrashAlt />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                                            </p>
                                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <p className="text-gray-700 text-center italic py-4">{t.comments.noComments}</p>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!commentToDelete}
                message={t.comments.deleteMessage}
                title={t.comments.deleteTitle}
                confirmText={t.comments.deleteButton}
                cancelText={t.common.cancel}
                onConfirm={handleDelete}
                onCancel={() => setCommentToDelete(null)}
            />
        </motion.div>
    );
};

export default CommentsPage;