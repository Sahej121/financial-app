import React from 'react';
import { Typography, Row, Col, Button, Layout } from 'antd';
import styled from 'styled-components';
import { BankOutlined, TeamOutlined, CreditCardOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';

const { Content } = Layout;

const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #000;
  padding-bottom: 80px;
`;

const HeaderSection = styled.div`
  padding: 100px 24px 60px;
  text-align: center;
  background: linear-gradient(180deg, rgba(0, 176, 240, 0.05) 0%, transparent 100%);
`;

const MainTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const ServiceCardCSS = styled.div`
  background: #0A0A0A;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48px 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);

    &::before {
      opacity: 1;
    }
  }

  .icon {
    font-size: 48px;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 50%;
    color: var(--primary-color);
    transition: transform 0.3s ease;
  }

  &:hover .icon {
    transform: scale(1.1) rotate(5deg);
    background: rgba(255, 255, 255, 0.08);
  }

  h2 {
    color: white;
    font-size: 2rem;
    margin-bottom: 16px;
    font-weight: 700;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 32px;
    flex-grow: 1;
  }
`;

const ActionButton = styled(Button)`
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  font-weight: 600;
  background: white;
  border: none;
  color: black;
  
  &:hover {
    transform: scale(1.05);
    background: #e6e6e6;
    color: black;
  }
`;

const Reveal = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease-out' }}>
      {children}
    </div>
  );
};

const Services = () => {
  const services = [
    {
      title: 'Expert CA Consultation',
      icon: <TeamOutlined />,
      description: 'Connect instantly with certified Chartered Accountants for tax filing, audits, and compliance. Get expert advice tailored to your business structure.',
      link: '/ca-selection',
      cta: 'Find a CA'
    },
    {
      title: 'Smart Credit',
      icon: <CreditCardOutlined />,
      description: 'AI-powered recommendations for credit cards that maximize your rewards based on your spending habits. Stop leaving money on the table.',
      link: '/credit-card',
      cta: 'Compare Cards'
    },
    {
      title: 'Strategic Planning',
      icon: <BankOutlined />,
      description: 'Comprehensive financial roadmap designed to achieve your life goals. From retirement planning to child education funds, we map it all.',
      link: '/planning',
      cta: 'Start Planning'
    }
  ];

  return (
    <PageContainer>
      <HeaderSection>
        <MainTitle>Our Expertise</MainTitle>
        <Subtitle>
          A suite of premium financial tools and services designed to accelerate your wealth creation journey.
        </Subtitle>
      </HeaderSection>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 48]}>
          {services.map((service, index) => (
            <Col xs={24} lg={8} key={index}>
              <Reveal delay={index * 150}>
                <ServiceCardCSS>
                  <div className="icon">{service.icon}</div>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <Link to={service.link}>
                    <ActionButton>
                      {service.cta} <ArrowRightOutlined />
                    </ActionButton>
                  </Link>
                </ServiceCardCSS>
              </Reveal>
            </Col>
          ))}
        </Row>
      </div>
    </PageContainer>
  );
};

export default Services; 