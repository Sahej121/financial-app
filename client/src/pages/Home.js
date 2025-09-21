import React, { useState, useEffect } from 'react';
import { Typography, Layout, Button, Row, Col, Card, Space, Statistic, Progress, Badge } from 'antd';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  BankOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ModernLayout = styled(Layout)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

const HeroSection = styled.div`
  position: relative;
  padding: 120px 24px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const FloatingIcon = styled.div`
  position: absolute;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.1);
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  left: ${props => props.left || '10%'};
  top: ${props => props.top || '20%'};
`;

const MainTitle = styled(Title)`
  color: white !important;
  margin-bottom: 32px !important;
  font-size: 3.5rem !important;
  font-weight: 700 !important;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 1s ease-out;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem !important;
  }
`;

const SubText = styled(Paragraph)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  max-width: 800px;
  margin: 0 auto 48px !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: ${fadeInUp} 1s ease-out 0.2s both;
  position: relative;
  z-index: 2;
`;

const ModernButton = styled(Button)`
  height: 56px;
  padding: 0 40px;
  border-radius: 28px;
  font-size: 18px;
  font-weight: 600;
  margin: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  animation: ${fadeInUp} 1s ease-out 0.4s both;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  &.primary {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #ff5252, #ffb74d);
      transform: translateY(-3px) scale(1.02);
    }
  }

  .anticon {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  &:hover .anticon {
    transform: translateX(4px);
  }
`;

const FeatureSection = styled.div`
  padding: 100px 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  position: relative;
`;

const SectionTitle = styled(Title)`
  text-align: center;
  margin-bottom: 60px !important;
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ModernCard = styled(Card)`
  height: 100%;
  background: white;
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  font-size: 48px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const StatsSection = styled.div`
  padding: 80px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const WhyChooseSection = styled.div`
  padding: 100px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
`;

const TestimonialSection = styled.div`
  padding: 100px 24px;
  background: white;
  text-align: center;
`;

const TestimonialCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  margin: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 120px;
    color: rgba(255, 255, 255, 0.1);
    font-family: serif;
  }
`;

const Home = () => {
  const [stats, setStats] = useState({
    clients: 0,
    savings: 0,
    satisfaction: 0
  });

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      setStats({
        clients: 1000,
        savings: 50000000,
        satisfaction: 98
      });
    };
    
    setTimeout(animateStats, 1000);
  }, []);

  const features = [
    {
      icon: <RocketOutlined />,
      title: 'AI-Powered Financial Planning',
      description: 'Leverage cutting-edge artificial intelligence to create personalized financial strategies that adapt to your goals and market conditions.',
      color: '#ff6b6b'
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Real-Time Market Analysis',
      description: 'Get instant insights with our advanced analytics platform that monitors market trends and provides actionable recommendations.',
      color: '#4ecdc4'
    },
    {
      icon: <GlobalOutlined />,
      title: 'Global Investment Opportunities',
      description: 'Access international markets and diversify your portfolio with our comprehensive global investment platform.',
      color: '#45b7d1'
    },
    {
      icon: <TeamOutlined />,
      title: 'Expert CA Network',
      description: 'Connect with certified Chartered Accountants who provide personalized guidance and strategic financial advice.',
      color: '#96ceb4'
    },
    {
      icon: <HeartOutlined />,
      title: 'Sustainable Investing',
      description: 'Build wealth while making a positive impact with our ESG-focused investment strategies and sustainable finance options.',
      color: '#feca57'
    },
    {
      icon: <TrophyOutlined />,
      title: 'Achievement Tracking',
      description: 'Monitor your financial progress with gamified milestones and celebrate your wealth-building achievements.',
      color: '#ff9ff3'
    }
  ];

  const whyChooseUs = [
    {
      icon: <StarOutlined />,
      title: 'Innovation First',
      description: 'We use the latest technology and financial tools to give you a competitive edge in wealth building.'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade encryption and security protocols.'
    },
    {
      icon: <LineChartOutlined />,
      title: 'Data-Driven Decisions',
      description: 'Make informed choices with comprehensive analytics and predictive financial modeling.'
    },
    {
      icon: <BankOutlined />,
      title: 'Regulatory Compliance',
      description: 'Stay compliant with all financial regulations through our automated compliance monitoring.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      content: 'Credit Leliya transformed my financial planning. The AI insights helped me increase my savings by 40% in just 6 months!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Tech Professional',
      content: 'The real-time market analysis is incredible. I can make informed investment decisions with confidence.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      content: 'The CA network connected me with the perfect advisor. My business financials have never been more organized.',
      rating: 5
    }
  ];

  return (
    <ModernLayout>
      <Content>
        <HeroSection>
          <FloatingElements>
            <FloatingIcon delay="0s" left="10%" top="20%">
              <BankOutlined />
            </FloatingIcon>
            <FloatingIcon delay="2s" left="80%" top="30%">
              <LineChartOutlined />
            </FloatingIcon>
            <FloatingIcon delay="4s" left="20%" top="70%">
              <RocketOutlined />
            </FloatingIcon>
            <FloatingIcon delay="1s" left="70%" top="60%">
              <TrophyOutlined />
            </FloatingIcon>
            <FloatingIcon delay="3s" left="50%" top="10%">
              <StarOutlined />
            </FloatingIcon>
          </FloatingElements>
          
          <MainTitle level={1}>
            Welcome to the Future of Finance
          </MainTitle>
          <SubText>
            Experience next-generation financial planning powered by AI, real-time analytics, and expert guidance. 
            Transform your wealth-building journey with cutting-edge technology and personalized strategies.
          </SubText>
          <Space size="large">
            <Link to="/register">
              <ModernButton type="primary" className="primary" size="large">
                Start Your Journey
                <ArrowRightOutlined />
              </ModernButton>
            </Link>
            <Link to="/planning">
              <ModernButton size="large">
                Explore Features
                <LineChartOutlined />
              </ModernButton>
            </Link>
          </Space>
        </HeroSection>

        <StatsSection>
          <Title level={2} style={{ color: 'white', marginBottom: '60px' }}>
            Trusted by Thousands
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Active Clients"
                  value={stats.clients}
                  suffix="+"
                  valueStyle={{ color: 'white', fontSize: '2.5rem' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Total Savings Generated"
                  value={stats.savings}
                  prefix="₹"
                  valueStyle={{ color: 'white', fontSize: '2.5rem' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Client Satisfaction"
                  value={stats.satisfaction}
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: '2.5rem' }}
                />
              </StatCard>
            </Col>
          </Row>
        </StatsSection>

        <FeatureSection>
          <SectionTitle level={2}>
            Revolutionary Features
          </SectionTitle>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <ModernCard>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IconWrapper style={{ color: feature.color }}>
                      {feature.icon}
                    </IconWrapper>
                    <Title level={3} style={{ marginBottom: '16px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                </ModernCard>
              </Col>
            ))}
          </Row>
        </FeatureSection>

        <WhyChooseSection>
          <SectionTitle level={2}>
            Why Choose Credit Leliya?
          </SectionTitle>
          <Row gutter={[32, 32]} style={{ maxWidth: 1200, margin: '0 auto' }}>
            {whyChooseUs.map((item, index) => (
              <Col xs={24} sm={12} key={index}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '20px',
                  padding: '24px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    fontSize: '32px', 
                    color: '#667eea',
                    marginTop: '8px'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <Title level={4} style={{ marginTop: 0, marginBottom: '12px' }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                      {item.description}
                    </Paragraph>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </WhyChooseSection>

        <TestimonialSection>
          <SectionTitle level={2}>
            What Our Clients Say
          </SectionTitle>
          <Row gutter={[24, 24]} style={{ maxWidth: 1200, margin: '0 auto' }}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <TestimonialCard>
                  <div style={{ padding: '32px', position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '20px' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarOutlined key={i} style={{ color: '#ffd700', marginRight: '4px' }} />
                      ))}
                    </div>
                    <Paragraph style={{ 
                      color: 'white', 
                      fontSize: '18px', 
                      fontStyle: 'italic',
                      marginBottom: '20px'
                    }}>
                      "{testimonial.content}"
                    </Paragraph>
                    <div>
                      <Title level={5} style={{ color: 'white', margin: 0 }}>
                        {testimonial.name}
                      </Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                        {testimonial.role}
                      </Paragraph>
                    </div>
                  </div>
                </TestimonialCard>
              </Col>
            ))}
          </Row>
        </TestimonialSection>

        <FeatureSection style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '32px' }}>
            Ready to Transform Your Financial Future?
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '20px', 
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Join thousands of satisfied clients who have already started their journey to financial freedom. 
            Your future self will thank you.
          </Paragraph>
          <Space size="large">
            <Link to="/register">
              <ModernButton type="primary" className="primary" size="large">
                Get Started Now
                <RocketOutlined />
              </ModernButton>
            </Link>
            <Link to="/ca-selection">
              <ModernButton size="large" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}>
                Find Your CA
                <TeamOutlined />
              </ModernButton>
            </Link>
          </Space>
        </FeatureSection>
      </Content>
    </ModernLayout>
  );
};

export default Home; 