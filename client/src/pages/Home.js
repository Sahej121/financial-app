import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Carousel, Rate, Tooltip, Layout, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  BankOutlined,
  TeamOutlined,
  CreditCardOutlined,
  RiseOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  UserOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const DarkLayout = styled(Layout)`
  background: #0A0A0A;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  position: relative;
  padding: 120px 24px;
  text-align: center;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
    animation: pulse 8s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.5); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.3; }
  }
`;

const GradientText = styled(Title)`
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 32px !important;
`;

const SubText = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
  display: block;
`;

const ActionButton = styled(Button)`
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  margin: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-2px);
  }

  .anticon {
    margin-left: 8px;
  }
`;

const WatchButton = styled(ActionButton)`
  background: transparent;
  
  .anticon {
    font-size: 20px;
  }
`;

const KeyboardHint = styled.div`
  margin-top: 48px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;

  kbd {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    margin: 0 4px;
  }
`;

const ContentSection = styled.div`
  padding: 64px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const IconWrapper = styled.div`
  font-size: 36px;
  margin-bottom: 24px;
  color: #1890ff;
  transition: all 0.3s ease;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);

    ${IconWrapper} {
      transform: scale(1.1);
      color: #096dd9;
    }
  }
`;

const StatsSection = styled.div`
  background: #f7f9fc;
  padding: 64px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(24, 144, 255, 0.1) 0%, transparent 60%);
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatCard = styled(Card)`
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  height: 100%;
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
  padding: 64px 24px;
  text-align: center;
  color: white;
`;

const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/[^0-9]/g, ''));
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return value.includes('+') ? `${count}+` : count;
};

const TestimonialCard = styled(Card)`
  margin: 20px;
  text-align: left;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Home = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: <BankOutlined />,
      title: 'Financial Planning',
      description: 'Get personalized financial advice for business expansion and loan management with detailed analytics and recommendations.',
      details: 'Our AI-powered tools analyze your financial data to create custom growth strategies and risk assessments.'
    },
    {
      icon: <TeamOutlined />,
      title: 'Expert CA Consultation',
      description: 'Connect with experienced Chartered Accountants for professional guidance on your financial decisions.'
    },
    {
      icon: <CreditCardOutlined />,
      title: 'Credit Card Recommendations',
      description: 'Discover the best credit cards tailored to your spending patterns and lifestyle preferences.'
    },
    {
      icon: <RiseOutlined />,
      title: 'Business Growth',
      description: 'Receive strategic insights and actionable plans to expand your business effectively.'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Loan Protection',
      description: 'Get comprehensive advice on loan management and protection strategies for financial security.'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Smart Decisions',
      description: 'Make informed financial choices with data-driven recommendations and expert guidance.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Happy Clients' },
    { number: '50+', label: 'Expert CAs' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' }
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Business Owner',
      rating: 5,
      text: 'CreditLeliya helped me expand my business with their expert financial planning tools. The CA consultation was invaluable!'
    },
    {
      name: 'Priya Patel',
      role: 'Startup Founder',
      rating: 5,
      text: 'The loan protection advice saved me from making costly mistakes. Highly recommend their services!'
    },
    {
      name: 'Amit Kumar',
      role: 'Entrepreneur',
      rating: 4,
      text: 'The credit card recommendations were spot-on! Saved a lot on business expenses with their suggestions.'
    }
  ];

  return (
    <DarkLayout>
      <Content>
        <HeroSection>
          <GradientText level={1} style={{ fontSize: '64px' }}>
            Finance is finally effortless.
          </GradientText>
          
          <SubText>
            Make smarter financial decisions with expert guidance from top Chartered Accountants
            and our intelligent planning tools.
          </SubText>

          <Space size={24} style={{ marginTop: 48 }}>
            <Link to="/guided-tour">
              <WatchButton icon={<PlayCircleOutlined />}>
                Watch the guided tour
              </WatchButton>
            </Link>
          </Space>

          <KeyboardHint>
            Press <kbd>T</kbd> anytime to start your trial
          </KeyboardHint>
        </HeroSection>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center' 
        }}>
          <GradientText level={2} style={{ fontSize: '36px' }}>
            Your research companion
          </GradientText>
          
          <SubText style={{ marginBottom: '32px' }}>
            To have even faster access to your financial planning and market
            intelligence, we recommend using our desktop app.
          </SubText>

          <ActionButton type="primary" size="large">
            Download now <ArrowRightOutlined />
          </ActionButton>
        </div>
      </Content>
    </DarkLayout>
  );
};

export default Home; 