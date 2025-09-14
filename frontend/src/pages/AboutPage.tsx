import React from 'react';
import { Users, Award, Globe, Shield, Heart, Target } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Active Students', value: '50,000+', icon: <Users className="w-8 h-8" /> },
    { label: 'Expert Tutors', value: '10,000+', icon: <Award className="w-8 h-8" /> },
    { label: 'Countries', value: '25+', icon: <Globe className="w-8 h-8" /> },
    { label: 'Success Rate', value: '95%', icon: <Target className="w-8 h-8" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-12 h-12 text-red-500" />,
      title: 'Student-Centric',
      description: 'Every decision we make puts students first. We believe education should be accessible, affordable, and tailored to individual needs.'
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-500" />,
      title: 'Trust & Safety',
      description: 'We maintain the highest standards of safety and security, with verified tutors and secure payment processing.'
    },
    {
      icon: <Award className="w-12 h-12 text-green-500" />,
      title: 'Quality Education',
      description: 'We partner only with qualified, experienced tutors who are passionate about helping students succeed.'
    },
    {
      icon: <Globe className="w-12 h-12 text-purple-500" />,
      title: 'Global Community',
      description: 'Our platform connects learners and educators from around the world, creating a diverse learning environment.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former educator with 15+ years in EdTech. Passionate about making quality education accessible to everyone.',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=ffffff&size=200'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'Tech veteran with experience at Google and Microsoft. Believes in the power of technology to transform learning.',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=ffffff&size=200'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Head of Education',
      bio: 'PhD in Educational Psychology. Ensures our platform meets the highest educational standards.',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=dc2626&color=ffffff&size=200'
    },
    {
      name: 'David Kim',
      role: 'Head of Operations',
      bio: 'Operations expert focused on creating seamless experiences for students and tutors alike.',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=7c3aed&color=ffffff&size=200'
    }
  ];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-6">
            About ShikshaGuru
          </h1>
          <p className="text-xl text-theme-muted max-w-3xl mx-auto mb-8">
            We're on a mission to democratize education by connecting students with expert tutors worldwide. 
            Founded in 2020, we've helped thousands of learners achieve their academic goals.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {stats.map((stat, index) => (
              <Card key={index} padding="lg" className="text-center">
                <div className="flex justify-center mb-4 text-theme-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-theme-text mb-2">{stat.value}</div>
                <div className="text-theme-muted">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-theme-text mb-6">Our Mission</h2>
              <div className="space-y-4 text-theme-muted">
                <p>
                  At ShikshaGuru, we believe that everyone deserves access to quality education, 
                  regardless of their location, background, or circumstances. Our platform breaks down 
                  traditional barriers to learning by connecting students with expert tutors from around the world.
                </p>
                <p>
                  We're committed to creating a learning ecosystem that is inclusive, affordable, and effective. 
                  By leveraging technology, we make it possible for students to find the perfect tutor who 
                  understands their unique learning style and needs.
                </p>
                <p>
                  Our goal is simple: to empower every learner to achieve their full potential and 
                  help educators share their knowledge with those who need it most.
                </p>
              </div>
            </div>
            <div className="aspect-square bg-theme-surface border border-theme-border rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">🌍</div>
                <p className="text-theme-muted">Connecting learners worldwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-theme-text mb-4">Our Values</h2>
            <p className="text-lg text-theme-muted max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to students and tutors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} padding="lg" hover>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-theme-text mb-3">{value.title}</h3>
                    <p className="text-theme-muted">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-theme-text mb-4">Meet Our Team</h2>
            <p className="text-lg text-theme-muted max-w-2xl mx-auto">
              The passionate individuals behind ShikshaGuru who are dedicated to transforming education.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} padding="lg" hover className="text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-theme-text mb-1">{member.name}</h3>
                <p className="text-theme-primary text-sm mb-3">{member.role}</p>
                <p className="text-theme-muted text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <Card padding="lg" className="bg-theme-surface">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-theme-text mb-6">Our Story</h2>
              <div className="space-y-6 text-theme-muted">
                <p>
                  ShikshaGuru was born from a simple observation: traditional education systems weren't 
                  meeting the diverse needs of modern learners. Our founders, Sarah and Michael, both 
                  experienced firsthand the challenges of finding quality tutoring and educational support.
                </p>
                <p>
                  In 2020, they decided to create a platform that would solve these problems by leveraging 
                  technology to connect students with expert tutors worldwide. What started as a small 
                  project quickly grew into a global community of learners and educators.
                </p>
                <p>
                  Today, ShikshaGuru serves thousands of students across 25+ countries, offering everything 
                  from academic tutoring to professional skill development. We're proud of how far we've come, 
                  but we're even more excited about where we're going.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <Card padding="lg" className="border-2 border-theme-primary">
            <h2 className="text-3xl font-bold text-theme-text mb-4">
              Want to Learn More?
            </h2>
            <p className="text-lg text-theme-muted mb-8 max-w-2xl mx-auto">
              We're always happy to answer questions about our platform, mission, or how we can help you achieve your learning goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3" onClick={() => window.location.href = 'mailto:info@shikshaguru.com'}>
                Contact Us
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" onClick={() => window.location.href = '/how-it-works'}>
                Learn How It Works
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;