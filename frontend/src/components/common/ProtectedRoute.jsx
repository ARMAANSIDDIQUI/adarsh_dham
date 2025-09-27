import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuth } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ component: Component, roles = [] }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth(token));
    } else {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  if (loading) {
    return <div className="text-center mt-10 text-xl font-semibold">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => user?.roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Component />;
};

export default ProtectedRoute;