import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

type ProtectedRouteProps = {
  requireAdmin?: boolean;
  redirectTo?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
  redirectTo = '/login',
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If admin is required but user is not admin, redirect
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated (and admin if required), render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
