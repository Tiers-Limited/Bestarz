import React from "react";
import { Button, Row, Col, Typography, Card, Space, Avatar, Rate } from "antd";
import {
  Star,
  Calendar,
  CreditCard,
  Users,
  Zap,
  Shield,
  Play,
  CheckCircle,
  Award,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import ScreenshotGallery from "../components/ScreenShotGallery";
import Testimonials from "../components/Testimonials";

const { Title, Paragraph } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="text-blue-400" size={32} />,
      title: "Smart Scheduling",
      description:
        "Seamless Google Calendar integration for automated booking management",
      stat: "99.9% uptime",
    },
    {
      icon: <CreditCard className="text-green-400" size={32} />,
      title: "Secure Payments",
      description: "Stripe-powered payment processing with instant payouts",
      stat: "$2M+ processed",
    },
    {
      icon: <Users className="text-purple-400" size={32} />,
      title: "Client Management",
      description: "Comprehensive CRM with review and communication tools",
      stat: "10k+ bookings",
    },
    {
      icon: <Zap className="text-yellow-400" size={32} />,
      title: "AI Matching",
      description:
        "Smart matching system connects clients with perfect providers instantly",
      stat: "95% match rate",
    },
    {
      icon: <Shield className="text-cyan-400" size={32} />,
      title: "Verified Platform",
      description:
        "Enterprise-grade security with background-checked providers",
      stat: "100% verified",
    },
    {
      icon: <TrendingUp className="text-orange-400" size={32} />,
      title: "Business Growth",
      description: "Analytics and tools to scale your service business",
      stat: "300% avg growth",
    },
  ];



  const stats = [
    { number: "5000+", label: "Active Providers" },
    { number: "50k+", label: "Happy Clients" },
    { number: "$10M+", label: "Payments Processed" },
    { number: "99.9%", label: "Platform Uptime" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo">
              Best<span className="text-green-400">★</span>rz
            </div>
            <Space>
              <Button
                type="text"
                onClick={() => navigate("/signin")}
                className="text-white hover:text-blue-400"
              >
                Sign In
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/signup")}
                className="glow-button"
              >
                Get Started Free
              </Button>
            </Space>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="text-left">
                <div className="trust-badge flex w-fit items-center mb-6 gap-2">
                  <CheckCircle size={16} />
                  <span>Trusted by 5000+ Service Providers</span>
                </div>

                <Title
                  className="gradient-text mb-6"
                  style={{ fontSize: "3.5rem", lineHeight: 1.1 }}
                >
                  Your business.
                  <br />
                  Your bookings.
                  <br />
                  <span className="text-green-400">Be the star.</span>
                </Title>
                <Paragraph className="text-xl text-gray-300 mb-8 max-w-lg">
                  The #1 platform for service providers to get discovered,
                  manage bookings, and grow their business with AI-powered
                  matching and seamless payments.
                </Paragraph>
                <Space size="large" className="mb-12">
                  <Button
                    type="primary"
                    size="large"
                    className="glow-button px-8 py-6 text-lg h-auto"
                    onClick={() => navigate("/signup")}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    size="large"
                    className="px-12 py-6 glow-button-green text-lg h-auto border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                    onClick={() => navigate("/client/booking")}
                  >
                    Browse Services
                  </Button>
                </Space>

                {/* Stats */}
                <Row gutter={[24, 16]}>
                  {stats.map((stat, index) => (
                    <Col xs={12} sm={6} key={index}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {stat.number}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {stat.label}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="relative">
                {/* Provider Preview Card */}
                <Card className="glass-card p-8">
                  <div className="text-center mb-6">
                    <Avatar
                      src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=200"
                      size={80}
                      className="mb-4"
                    />
                    <Title level={4} className="text-white mb-2">
                      DJ Master
                    </Title>
                    <div className="rating-glow mb-4">
                      <Rate disabled defaultValue={5} className="text-sm" />
                      <span className="text-gray-400 ml-2">(127 reviews)</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      $750/event
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="glow-button"
                    >
                      Book Now - Instant Confirmation
                    </Button>
                  </div>
                </Card>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 trust-badge flex items-center gap-1">
                  <Award size={16} />
                  <span>Verified Pro</span>
                </div>
                <div className="absolute -bottom-4 -left-4 trust-badge flex items-center gap-1">
                  <Shield size={16} />
                  <span>Background Checked</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Title level={2} className="text-white mb-4">
              Everything you need to succeed
            </Title>
            <Paragraph className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built by service providers, for service providers. Every feature
              is designed to help you book more, earn more, and stress less.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card className="feature-card h-full text-center p-6">
                  <div className="mb-6">{feature.icon}</div>
                  <Title level={4} className="text-white mb-3">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-400 mb-4">
                    {feature.description}
                  </Paragraph>
                  <div className="trust-badge inline-block">{feature.stat}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Video Preview */}

      <section>
        <VideoPlayer />
      </section>



      <section>
        <Testimonials/>
      </section>

 




      {/* Gallery */}

      <ScreenshotGallery />


      

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="vibrant-card p-12">
            <Title level={2} className="text-white mb-4">
              Ready to become the star of your industry?
            </Title>
            <Paragraph className="text-xl text-gray-300 mb-8">
              Join thousands of service providers who have transformed their
              business with Bestarz. Start your free trial today - no credit
              card required.
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                className="glow-button px-12 py-6 text-lg h-auto"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
              <Button
                size="large"
                className="px-12 py-6 text-lg h-auto glow-button-green border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                onClick={() => navigate("/client/booking")}
              >
                Browse Services
              </Button>
            </Space>

            <div className="mt-8 pt-8 border-t border-gray-600">
              <Space size="large">
                <div className="trust-badge flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Free 30-day trial</span>
                </div>
                <div className="trust-badge flex items-center gap-2">
                  <Shield size={16} />
                  <span>No setup fees</span>
                </div>
                <div className="trust-badge flex items-center gap-2">
                  <Award size={16} />
                  <span>Cancel anytime</span>
                </div>
              </Space>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="bestarz-logo mb-4">
                Best<span className="text-green-400">★</span>rz
              </div>
              <Paragraph className="text-gray-400 mb-6">
                The platform that connects amazing service providers with
                clients who need them most.
              </Paragraph>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={[32, 16]}>
                <Col xs={12} sm={6}>
                  <Title level={5} className="text-white mb-4">
                    Platform
                  </Title>
                  <Space direction="vertical" size="small">
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Features
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Pricing
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Help Center
                    </Button>
                  </Space>
                </Col>
                <Col xs={12} sm={6}>
                  <Title level={5} className="text-white mb-4">
                    Providers
                  </Title>
                  <Space direction="vertical" size="small">
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Sign Up
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Success Stories
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Resources
                    </Button>
                  </Space>
                </Col>
                <Col xs={12} sm={6}>
                  <Title level={5} className="text-white mb-4">
                    Clients
                  </Title>
                  <Space direction="vertical" size="small">
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Find Services
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      How It Works
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Reviews
                    </Button>
                  </Space>
                </Col>
                <Col xs={12} sm={6}>
                  <Title level={5} className="text-white mb-4">
                    Company
                  </Title>
                  <Space direction="vertical" size="small">
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      About
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Contact
                    </Button>
                    <Button
                      type="link"
                      className="text-gray-400 hover:text-white p-0"
                    >
                      Privacy
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
