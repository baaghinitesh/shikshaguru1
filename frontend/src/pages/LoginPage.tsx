import React from 'react';
import { BookOpen } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';


const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">
              ShikshaGuru
            </span>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;