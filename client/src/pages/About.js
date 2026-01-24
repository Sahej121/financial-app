import React from 'react';
import { Typography, Layout, Row, Col, Card } from 'antd';
import styled, { keyframes } from 'styled-components';
import { TeamOutlined, GlobalOutlined, SafetyCertificateOutlined, RocketOutlined } from '@ant-design/icons';
import useScrollReveal from '../hooks/useScrollReveal';

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

// --- Styled Components ---
const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #000;
  padding-bottom: 80px;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 120px 24px;
  background: radial-gradient(circle at 50% 0%, rgba(0, 176, 240, 0.15) 0%, transparent 60%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const HeroTitle = styled.h1`
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 800;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #FFF 0%, #AAA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
`;

const HeroSubtitle = styled(Paragraph)`
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
`;

const ValueCard = styled.div`
  background: #0A0A0A;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-10px);
    border-color: var(--primary-color);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .icon {
    font-size: 40px;
    color: var(--primary-color);
    margin-bottom: 24px;
    background: rgba(0, 176, 240, 0.1);
    width: 80px;
    height: 80px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
  }

  h3 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  
  .avatar {
    width: 200px;
    height: 200px;
    background: #1a1a1a;
    border-radius: 50%;
    margin: 0 auto 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.05), transparent);
    }
  }

  h4 {
    color: white;
    font-size: 1.25rem;
    margin-bottom: 8px;
  }

  span {
    color: var(--primary-color);
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }
`;

const Reveal = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
      {children}
    </div>
  );
};

const About = () => {
  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>Pioneering the Future of Wealth</HeroTitle>
        <HeroSubtitle>
          We are dismantling the barriers to institutional-grade financial intelligence.
          By combining AI precision with human expertise, we empower you to build a legacy.
        </HeroSubtitle>
      </HeroSection>

      <Section>
        <Title level={2} style={{ color: 'white', textAlign: 'center', marginBottom: 64 }}>Our Core Values</Title>
        <Row gutter={[32, 32]}>
          {[
            { title: 'Transparency', icon: <GlobalOutlined />, desc: 'No hidden fees. No fine print. Just clear, honest financial guidance.' },
            { title: 'Expertise', icon: <TeamOutlined />, desc: 'Access to the top 1% of financial minds in the industry.' },
            { title: 'Security', icon: <SafetyCertificateOutlined />, desc: 'Bank-grade encryption protecting your most valuable assets.' },
            { title: 'Innovation', icon: <RocketOutlined />, desc: 'Constantly evolving algorithms to keep you ahead of the market.' }
          ].map((item, index) => (
            <Col xs={24} md={6} key={index}>
              <Reveal delay={index * 100}>
                <ValueCard>
                  <div className="icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </ValueCard>
              </Reveal>
            </Col>
          ))}
        </Row>
      </Section>

      <div style={{ background: '#0A0A0A', padding: '100px 0' }}>
        <Section>
          <Row align="middle" gutter={[64, 40]}>
            <Col xs={24} md={12}>
              <Reveal>
                <Title level={2} style={{ color: 'white', fontSize: '2.5rem', marginBottom: 24 }}>The Mission</Title>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  Our mission is simple: to democratize access to sophisticated wealth management.
                  For too long, the best tools and advice have been reserved for the ultra-wealthy.
                </Paragraph>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  We are changing that. Whether you are just starting your journey or managing a multi-crore portfolio,
                  CreditLeliya provides the infrastructure you need to succeed.
                </Paragraph>
              </Reveal>
            </Col>
            <Col xs={24} md={12}>
              <Reveal delay={200}>
                <div style={{
                  height: 400,
                  background: 'linear-gradient(135deg, #111 0%, #222 100%)',
                  borderRadius: 32,
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Abstract Graphic */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 200, height: 200, background: 'var(--primary-color)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3 }} />
                </div>
              </Reveal>
            </Col>
          </Row>
        </Section>
      </div>
    </PageContainer>
  );
};

export default About; 