import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import LoginForm from '../components/shared/LoginForm';

// A serene background for brand consistency
const pageBackgroundUrl = 'https://images.unsplash.com/photo-1544465544-d499e3907c08?q=80&w=2574&auto=format&fit=crop';

const Login = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If the user is already authenticated, redirect them
        const from = location.state?.from?.pathname || '/';
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    return (
        <div 
          className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
          style={{ backgroundImage: `url(${pageBackgroundUrl})` }}
        >
          {/* This motion.div provides the entry animation for the form */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* The LoginForm component is now self-contained with all its links */}
            <LoginForm />
            
            {/* ✨ FIX: The redundant "Forgot Password?" and "Register here" links have been removed from this page. */}
            
          </motion.div>
        </div>
    );
};

export default Login;