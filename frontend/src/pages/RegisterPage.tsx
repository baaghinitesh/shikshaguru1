import React from 'react';
import { BookOpen, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <Header />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Sign Up', current: true }
        ]} />
      </div>
      
      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back Navigation */}
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            <Link 
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Home className="w-5 h-5 mr-1" />
              <span className="text-sm">Home</span>
            </Link>
          </div>

          {/* Logo and Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-6 hover:opacity-80 transition-opacity">
              <BookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">
                ShikshaGuru
              </span>
            </Link>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Join ShikshaGuru
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account and start your learning journey
              </p>
            </div>
          </div>

          {/* Register Form */}
          <RegisterForm />
          
          {/* Navigation Links */}
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Sign in here
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Browse Tutors
              </Link>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                About Us
              </Link>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;