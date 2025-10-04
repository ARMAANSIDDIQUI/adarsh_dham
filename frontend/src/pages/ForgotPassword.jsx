import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhone, FaCommentAlt, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import api from '../api/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/password-requests', { phone, reason });
            toast.success(data.message);
            setPhone('');
            setReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral flex items-center justify-center p-4 font-body">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-soft"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading text-primaryDark">Forgot Password</h2>
                    <p className="mt-2 text-gray-700">Enter your details to request a password reset from an administrator.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 relative">
                            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full pl-10 pr-3 py-2 border border-background rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Your registered phone number"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason / Explanation</label>
                        <div className="mt-1 relative">
                            <FaCommentAlt className="absolute left-3 top-3 text-accent" />
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full pl-10 pr-3 py-2 border border-background rounded-md focus:ring-primary focus:border-primary"
                                placeholder="e.g., I lost my phone, I can't remember my old password, etc."
                                rows="3"
                            />
                        </div>
                    </div>
                    <div>
                        <Button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center bg-highlight hover:bg-primaryDark text-white">
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                            {loading ? 'Sending Request...' : 'Send Request'}
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;