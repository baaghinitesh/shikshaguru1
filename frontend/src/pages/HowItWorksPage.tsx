import React from 'react';
import { Search, UserPlus, MessageCircle, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: <Search className="w-12 h-12 text-theme-primary" />,
      title: 'Search for Tutors',
      description: 'Browse our extensive database of qualified tutors across various subjects and skill levels.',
      details: [
        'Filter by subject, location, and price range',
        'View detailed tutor profiles and reviews',
        'Compare tutors to find the perfect match'
      ]
    },
    {
      icon: <UserPlus className="w-12 h-12 text-theme-primary" />,
      title: 'Connect & Schedule',
      description: 'Contact your chosen tutor and schedule your first learning session.',
      details: [
        'Send direct messages to tutors',
        'Schedule sessions that fit your calendar',
        'Choose between online or in-person learning'
      ]
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-theme-primary" />,
      title: 'Learn & Grow',
      description: 'Engage in personalized learning sessions tailored to your needs.',
      details: [
        'One-on-one or group learning sessions',
        'Interactive whiteboards and screen sharing',
        'Progress tracking and homework assignments'
      ]
    },
    {
      icon: <Star className="w-12 h-12 text-theme-primary" />,
      title: 'Review & Improve',
      description: 'Rate your experience and continue your learning journey.',
      details: [
        'Leave reviews to help other students',
        'Track your learning progress over time',
        'Book additional sessions as needed'
      ]
    }
  ];

  const forStudents = [
    'Access to qualified tutors across all subjects',
    'Flexible scheduling that fits your lifestyle',
    'Affordable pricing with transparent rates',
    'Safe and secure payment processing',
    'Progress tracking and learning analytics',
    'Money-back guarantee for unsatisfactory sessions'
  ];

  const forTutors = [
    'Create a professional tutor profile',
    'Set your own rates and availability',
    'Connect with motivated students',
    'Secure payment processing',
    'Built-in video chat and whiteboard tools',
    'Growing student base across multiple subjects'
  ];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-6">
            How ShikshaGuru Works
          </h1>
          <p className="text-xl text-theme-muted max-w-3xl mx-auto">
            Connecting students with expert tutors has never been easier. 
            Follow these simple steps to start your learning journey today.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-theme-text text-center mb-12">
            Getting Started is Easy
          </h2>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <Card padding="lg" className="h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-theme-primary">Step {index + 1}</span>
                        <h3 className="text-2xl font-bold text-theme-text">{step.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-theme-muted mb-6 text-lg">{step.description}</p>
                    
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-theme-text">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="aspect-video bg-theme-surface border border-theme-border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-50">
                        {index === 0 && '🔍'}
                        {index === 1 && '📅'}
                        {index === 2 && '📚'}
                        {index === 3 && '⭐'}
                      </div>
                      <p className="text-theme-muted">Visual representation</p>
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:mt-8 hidden lg:block">
                    <ArrowRight className="w-8 h-8 text-theme-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* For Students */}
          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-theme-text mb-4">For Students</h3>
              <p className="text-theme-muted">
                Everything you need to succeed in your learning journey
              </p>
            </div>
            
            <ul className="space-y-4">
              {forStudents.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <Button className="w-full" size="lg" onClick={() => window.location.href = '/tutors'}>
                Find a Tutor
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>

          {/* For Tutors */}
          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-theme-text mb-4">For Tutors</h3>
              <p className="text-theme-muted">
                Share your knowledge and earn income on your schedule
              </p>
            </div>
            
            <ul className="space-y-4">
              {forTutors.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <Button variant="outline" className="w-full" size="lg" onClick={() => window.location.href = '/register'}>
                Become a Tutor
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card padding="lg" className="bg-theme-surface border-2 border-theme-primary">
            <h2 className="text-3xl font-bold text-theme-text mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-theme-muted mb-8 max-w-2xl mx-auto">
              Join thousands of students and tutors who have already transformed their learning experience with ShikshaGuru.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" onClick={() => window.location.href = '/register'}>
                Sign Up Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" onClick={() => window.location.href = '/tutors'}>
                Browse Tutors
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;