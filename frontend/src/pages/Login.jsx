import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import LoginForm from '../components/shared/LoginForm';

const Login = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Correctly redirects authenticated users to their intended page.
        const from = location.state?.from?.pathname || '/';
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-4 min-h-screen ">
            <div className="w-full max-w-md">
                <LoginForm />
                
                {/* ADDED: Forgot Password Link */}
                <div className="mt-4 text-center">
                    <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-pink-600 hover:underline transition-colors duration-200">
                        Forgot Password?
                    </Link>
                </div>
                
                <div className="mt-6 text-center text-gray-600">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="text-pink-500 hover:text-pink-600 hover:underline font-semibold transition-colors duration-200">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
