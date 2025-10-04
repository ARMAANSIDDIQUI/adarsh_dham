import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import RegisterForm from '../components/shared/RegisterForm';

const Register = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect to home if already authenticated
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-4 min-h-screen bg-neutral font-body">
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>
        </motion.div>
    );
};

export default Register;