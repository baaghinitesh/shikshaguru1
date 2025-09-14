import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, GraduationCap, BookOpen, Calendar, MessageCircle, Settings, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                ShikshaGuru
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.name}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your ShikshaGuru {user.role} dashboard
          </p>
        </div>

        {/* User Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card padding="lg" className="lg:col-span-1">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                {user.role === 'teacher' ? (
                  <GraduationCap className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                ) : (
                  <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {user.email}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="lg">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === 'teacher' ? 'Students Taught' : 'Courses Enrolled'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === 'teacher' ? 'Classes This Week' : 'Sessions This Week'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Messages
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <User className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Profile Completion
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    25%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.role === 'teacher' ? (
              <>
                <Button className="w-full">
                  Create New Class
                </Button>
                <Button variant="outline" className="w-full">
                  View Students
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full">
                  View Earnings
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full">
                  Find a Tutor
                </Button>
                <Button variant="outline" className="w-full">
                  Browse Subjects
                </Button>
                <Button variant="outline" className="w-full">
                  My Bookings
                </Button>
                <Button variant="outline" className="w-full">
                  Study Materials
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding="lg" className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No recent activity yet. Start by completing your profile!
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;