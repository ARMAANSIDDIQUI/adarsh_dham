import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCommentAlt, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import api from '../api/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';
import PhoneInput from '../components/common/PhoneInput';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePhoneChange = (value) => {
        setPhone(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic length check for international
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 8) {
            toast.error('Please enter a valid phone number.');
            return;
        }

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

    const isFormValid = phone.replace(/\D/g, '').length >= 8 && reason.trim().length > 0;

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
                        <PhoneInput
                            label="Phone Number"
                            value={phone}
                            onChange={handlePhoneChange}
                            required
                            placeholder="Your registered phone number"
                        />
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
                        <Button 
                            type="submit" 
                            disabled={loading || !isFormValid} 
                            className={`w-full inline-flex justify-center items-center text-white transition-colors duration-200 
                                ${loading || !isFormValid 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-primaryDark hover:bg-highlight'
                                }`}
                        >
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