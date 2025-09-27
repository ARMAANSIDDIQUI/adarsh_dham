import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { FaUserShield, FaLock } from 'react-icons/fa'; // Added icons

const LoginForm = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Phone and password are required.');
      return;
    }

    try {
      await dispatch(login({ phone, password })).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="p-6 md:p-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800 flex items-center justify-center space-x-2">
            <FaUserShield className="text-pink-500" />
            <span>Member Login</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative mt-1">
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-400 focus:border-pink-400 placeholder-gray-400 transition-colors"
                placeholder="e.g., 9876543210"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-400 focus:border-pink-400 transition-colors"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
          <Button type="submit" className="w-full text-lg py-2.5">
            <FaLock className="inline mr-2" /> Login
          </Button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Don't have an account? <a href="/register" className="text-pink-500 hover:text-pink-700 font-medium">Register here</a></p>
      </div>
    </motion.div>
    </div>
  );
};

export default LoginForm;
