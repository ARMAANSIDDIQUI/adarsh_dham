import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-4 min-h-screen ">
      <div className="w-full max-w-md">
        <RegisterForm />
        {/* <div className="mt-6 text-center text-gray-600">
          <p>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-pink-500 hover:text-pink-600 hover:underline font-semibold transition-colors duration-200"
            >
              Login here
            </Link>
          </p>
        </div> */}
      </div>
    </motion.div>
  );
};

export default Register;
