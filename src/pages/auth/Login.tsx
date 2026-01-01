import React, {useEffect} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {LoginForm} from '@/components/auth/LoginForm';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {useAuth} from '@/context/AuthContext';
import {AuthResponse} from '@/api/auth';

const Login: React.FC = () => {
  const { loginSuccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSuccess = (response: AuthResponse) => {
    loginSuccess(response);
    // Navigation happens in useEffect when isAuthenticated becomes true
    // or we can force it here
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your account"
    >
      <LoginForm onSuccess={handleSuccess} />
      <div className="mt-4 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
