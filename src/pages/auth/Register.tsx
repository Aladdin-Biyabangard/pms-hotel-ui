import React, {useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {RegisterForm} from '@/components/auth/RegisterForm';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {useAuth} from '@/context/AuthContext';
import {AuthResponse} from '@/api/auth';

const Register: React.FC = () => {
  const { loginSuccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = (response: AuthResponse) => {
    loginSuccess(response);
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your information to get started"
    >
      <RegisterForm onSuccess={handleSuccess} />
      <div className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
