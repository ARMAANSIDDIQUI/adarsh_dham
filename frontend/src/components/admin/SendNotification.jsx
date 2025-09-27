import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaPaperPlane, FaClock, FaExclamationCircle } from 'react-icons/fa'; // Added icons

const SendNotification = () => {
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState({ userId: '', role: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [ttl, setTtl] = useState({
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    
    const [totalTtlMinutes, setTotalTtlMinutes] = useState(1440);

    const roles = ['user', 'admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'];

    useEffect(() => {
        const d = ttl.days || 0;
        const h = ttl.hours || 0;
        const m = ttl.minutes || 0;
        const s = ttl.seconds || 0;
        const total = (d * 1440) + (h * 60) + m + (s / 60);
        setTotalTtlMinutes(Math.max(1, Math.round(total))); // Ensure a minimum of 1 minute TTL
    }, [ttl]);

    const handleTtlChange = (e) => {
        const { name, value } = e.target;
        setTtl(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const payload = {
            message,
            targetId: target.userId || undefined,
            targetRole: target.role || undefined,
            ttlMinutes: totalTtlMinutes
        };
        
        // Remove empty strings/fields to prevent sending empty targeting data
        if (target.userId === '') delete payload.targetId;
        if (target.role === '') delete payload.targetRole;
        
        try {
            await api.post('/notifications', payload);
            setStatus({ type: 'success', message: 'Notification sent successfully!' });
            setMessage('');
            setTarget({ userId: '', role: '' });
            setTtl({ days: 1, hours: 0, minutes: 0, seconds: 0 });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send notification.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-100 min-h-screen flex justify-center">
            <div className="w-full max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 border-pink-400 pb-2 text-center">
                    Send Notification
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Message Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Message</label>
                            <textarea 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                rows="4" 
                                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" 
                                placeholder="Enter the message content..."
                                required 
                            />
                        </div>

                        {/* TTL Inputs */}
                        <div className="p-4 border border-pink-100 bg-pink-50 rounded-lg">
                            <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                                <FaClock className="mr-2 text-pink-500" /> Disappears After (Time To Live)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="days" className="text-xs font-medium text-gray-600 block mb-1">Days</label>
                                    <input id="days" type="number" name="days" value={ttl.days} onChange={handleTtlChange} min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="hours" className="text-xs font-medium text-gray-600 block mb-1">Hours</label>
                                    <input id="hours" type="number" name="hours" value={ttl.hours} onChange={handleTtlChange} min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="minutes" className="text-xs font-medium text-gray-600 block mb-1">Minutes</label>
                                    <input id="minutes" type="number" name="minutes" value={ttl.minutes} onChange={handleTtlChange} min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="seconds" className="text-xs font-medium text-gray-600 block mb-1">Seconds</label>
                                    <input id="seconds" type="number" name="seconds" value={ttl.seconds} onChange={handleTtlChange} min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 text-sm" />
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 text-center">Total TTL: {totalTtlMinutes} minutes.</p>
                        </div>

                        {/* Target Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target User ID (Optional)</label>
                                <input 
                                    type="text" 
                                    value={target.userId} 
                                    onChange={(e) => setTarget({...target, userId: e.target.value})} 
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" 
                                    placeholder="User ID (e.g., abc-123)" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Role (Optional)</label>
                                <select 
                                    value={target.role} 
                                    onChange={(e) => setTarget({...target, role: e.target.value})} 
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                                >
                                    <option value="">Select a Role (Broadcast)</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Status/Feedback Message */}
                        {status && (
                            <div className={`text-center py-3 rounded-lg font-medium shadow-sm flex items-center justify-center space-x-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status.type === 'error' && <FaExclamationCircle className="inline" />}
                                <span>{status.message}</span>
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-lg"
                        >
                            {loading ? 'Sending...' : <><FaPaperPlane className="inline mr-2" /> Send Notification</>}
                        </Button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default SendNotification;
