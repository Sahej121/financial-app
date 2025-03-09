import React from 'react';
import { Typography, Layout, Button, Row, Col, Card, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  BankOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const DarkLayout = styled(Layout)`
  background: #ffffff;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  position: relative;
  padding: 120px 24px;
  text-align: center;
  overflow: hidden;
  background: #ffffff;
`;

const MainTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 32px !important;
`;

const SubText = styled(Paragraph)`
  color: rgba(0, 0, 0, 0.85);
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto 48px !important;
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

const FeatureSection = styled.div`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
`;

const IconWrapper = styled.div`
  font-size: 36px;
  margin-bottom: 24px;
  color: #1890ff;
`;

const StyledCard = styled(Card)`
  height: 100%;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
`;

const WhyChooseSection = styled.div`
  padding: 80px 24px;
  background: #f5f5f5;
`;

const Home = () => {
  const features = [
    {
      icon: <BankOutlined />,
      title: 'Expert Financial Advisory',
      description: 'Our team of top-tier Chartered Accountants delivers clear, actionable financial strategies tailored to your unique needs.'
    },
    {
      icon: <LineChartOutlined />,
      title: 'Business Growth & Intelligent Analysis',
      description: 'Our experienced business analysts and advanced planning tools harness market trends and data-driven insights to fuel your business growth.'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Pathway to Financial Freedom',
      description: 'We guide you toward smart debt management and innovative borrowing solutions for complete control of your finances.'
    }
  ];

  const whyChooseUs = [
    {
      icon: <CheckCircleOutlined />,
      title: 'Effortless Finance',
      description: 'Experience a simplified, stress-free approach to financial management backed by expert insights.'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Personalized Solutions',
      description: 'We craft strategies tailored to your individual circumstances and unique financial journey.'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Proven Expertise',
      description: 'Trust in guidance grounded in real-world experience from seasoned Chartered Accountants.'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Transparent & Reliable',
      description: 'We prioritize clarity and honesty in every step of your financial journey.'
    }
  ];

  return (
    <DarkLayout>
      <Content>
        <HeroSection>
          <MainTitle level={1}>
            Welcome to Credit Leliya – Where Finance is Finally Effortless
          </MainTitle>
          <SubText>
            Empowering you to build a prosperous future with expert guidance and intelligent planning.
            Make smarter financial decisions with our top chartered accountants and intelligent planning tools.
          </SubText>
        </HeroSection>

        <FeatureSection>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            What We Offer
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <StyledCard>
                  <IconWrapper>{feature.icon}</IconWrapper>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.description}</Paragraph>
                </StyledCard>
              </Col>
            ))}
          </Row>
        </FeatureSection>

        <WhyChooseSection>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Why Choose Credit Leliya?
          </Title>
          <Row gutter={[24, 24]} style={{ maxWidth: 1200, margin: '0 auto' }}>
            {whyChooseUs.map((item, index) => (
              <Col xs={24} sm={12} key={index}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <IconWrapper style={{ fontSize: '24px', marginBottom: 0 }}>
                    {item.icon}
                  </IconWrapper>
                  <div>
                    <Title level={4} style={{ marginTop: 0 }}>
                      {item.title}
                    </Title>
                    <Paragraph>{item.description}</Paragraph>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </WhyChooseSection>

        <FeatureSection style={{ textAlign: 'center' }}>
          <Title level={2}>Begin Your Journey Today</Title>
          <SubText>
            Unlock the potential of a brighter, more secure financial future. 
            With Credit Leliya by your side, making smarter financial decisions is just the beginning.
          </SubText>
        </FeatureSection>
      </Content>
    </DarkLayout>
  );
};

export default Home; 