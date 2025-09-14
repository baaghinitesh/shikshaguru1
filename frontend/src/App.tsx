import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ThemeSelector from '@/components/ui/ThemeSelector';
import { BookOpen, Users, Zap, Shield, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Temporary HomePage component to demonstrate the theme system
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Find Expert Tutors',
      description: 'Connect with qualified tutors across all subjects and skill levels.',
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: 'Real-time Learning',
      description: 'Interactive sessions with chat, video calls, and file sharing.',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure & Trusted',
      description: 'Verified tutors, secure payments, and guaranteed satisfaction.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'ShikshaGuru helped me find the perfect math tutor. My grades improved dramatically!',
      rating: 5,
    },
    {
      name: 'Prof. Michael Chen',
      role: 'Tutor',
      content: 'Great platform to connect with motivated students. The interface is intuitive and professional.',
      rating: 5,
    },
    {
      name: 'Emma Wilson',
      role: 'Parent',
      content: "Finally found a reliable platform for my daughter's science tutoring needs.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Learn from the{' '}
            <span className="text-gradient">Best Tutors</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            ShikshaGuru connects students with expert tutors for personalized learning experiences. 
            Find your perfect tutor today and unlock your potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" className="px-8 py-3" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-8 py-3" onClick={() => window.location.href = '/register'}>
                  Find a Tutor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" onClick={() => window.location.href = '/register'}>
                  Become a Tutor
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose ShikshaGuru?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide a comprehensive platform that makes learning accessible, 
              effective, and enjoyable for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <Card.Title className="mb-3">
                  {feature.title}
                </Card.Title>
                <Card.Content>
                  {feature.description}
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hear from students, tutors, and parents who love ShikshaGuru
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} padding="lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Card.Content className="mb-4">
                  "{testimonial.content}"
                </Card.Content>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600 dark:bg-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of students and tutors who are already part of the ShikshaGuru community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button variant="secondary" size="lg" className="px-8 py-3 bg-white text-primary-600 hover:bg-gray-100" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="lg" className="px-8 py-3 bg-white text-primary-600 hover:bg-gray-100" onClick={() => window.location.href = '/register'}>
                  Get Started Today
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600" onClick={() => window.location.href = '/login'}>
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Theme Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Personalize Your Experience
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Choose from 20+ themes or create your own custom color scheme. 
            ShikshaGuru adapts to your style preferences.
          </p>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="w-8 h-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">ShikshaGuru</span>
            </div>
            <div className="text-gray-400">
              © 2024 ShikshaGuru. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <ProtectedRoute requireAuth={false}>
                  <div>
                    <Header />
                    <main>
                      <HomePage />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Authentication Routes */}
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } />
              
              <Route path="/register" element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAuth={true}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={
                <ProtectedRoute requireAuth={false}>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">The page you're looking for doesn't exist.</p>
                      <Button onClick={() => window.location.href = '/'}>Go Home</Button>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;