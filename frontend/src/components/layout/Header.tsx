import React, { useState } from 'react';
import { Menu, X, Search, Bell, User, BookOpen } from 'lucide-react';
import { cn } from '@/utils';
import { useBreakpoint } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import ThemeSelector from '@/components/ui/ThemeSelector';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  const navigation = [
    { name: 'Find Tutors', href: '/tutors' },
    { name: 'Find Jobs', href: '/jobs' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className={cn('bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                ShikshaGuru
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tutors, subjects, or locations..."
                  className="input pl-10 w-full"
                />
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <User className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && (
          <div className="pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="input pl-10 w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div
          className={cn(
            'md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  ShikshaGuru
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Sign In
                </Button>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;