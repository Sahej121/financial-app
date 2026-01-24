import React from 'react';
import { Typography, Layout, Button, Row, Col, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  RocketOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  TeamOutlined,
  GlobalOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import useScrollReveal from '../hooks/useScrollReveal';

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

// --- Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const PageLayout = styled(Layout)`
  background: #000000;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const HeroSection = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 24px;
  overflow: hidden;
  
  /* Mesh Gradient Background */
  background: 
    radial-gradient(circle at 15% 50%, rgba(0, 176, 240, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(242, 200, 17, 0.05) 0%, transparent 50%),
    linear-gradient(0deg, #050505 0%, #000000 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1000px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: rgba(0, 176, 240, 0.1);
  border: 1px solid rgba(0, 176, 240, 0.2);
  border-radius: 30px;
  color: #00B0F0;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.8s ease-out;
  backdrop-filter: blur(10px);

  span {
    width: 6px;
    height: 6px;
    background: #00B0F0;
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 0 10px #00B0F0;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.8s ease-out 0.1s backwards;
  
  background: linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 50%, #A0A0A0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  span.highlight {
    background: linear-gradient(90deg, #00B0F0, #0077F0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled(Paragraph)`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: var(--text-secondary) !important;
  max-width: 680px;
  margin: 0 auto 48px !important;
  line-height: 1.6;
  animation: ${fadeInUp} 0.8s ease-out 0.2s backwards;
`;

const CTAButton = styled(Button)`
  height: 64px;
  padding: 0 48px;
  border-radius: 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  background: white;
  color: black;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out 0.3s backwards;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.3);
    background: white;
    color: black;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  &:hover svg {
    transform: translateX(4px);
  }
`;

const OutlineButton = styled(Button)`
  height: 64px;
  padding: 0 48px;
  border-radius: 32px;
  font-size: 1.1rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.8s ease-out 0.4s backwards;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
    color: white;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  padding: 16px 24px;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05) translateY(-20px);
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const StatSection = styled.div`
  background: #050505;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 100px 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 24px;
`;

const FeatureCard = styled.div`
  background: linear-gradient(145deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 48px;
  border-radius: 32px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  
  ${props => props.isVisible && css`
    opacity: 1;
    transform: translateY(0);
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.03), transparent 40%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    
    &::before {
      opacity: 1;
    }
  }

  h3 {
    margin: 24px 0 16px;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.7;
    margin: 0;
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  &:hover .icon-wrapper {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
`;

const Reveal = ({ children, width = '100%', delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} style={{ width, transitionDelay: `${delay}ms` }} className={isVisible ? 'visible' : ''}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { isVisible })
      )}
    </div>
  );
};

const Home = () => {
  return (
    <PageLayout>
      <Content>
        {/* Hero Section */}
        <HeroSection>
          {/* Decorative Floaters */}
          <FloatingElement style={{ top: '25%', left: '8%' }} delay="0s">
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #00B0F0, #0077F0)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChartOutlined style={{ color: 'white', fontSize: 24 }} />
            </div>
            <div>
              <Text strong style={{ color: 'white', display: 'block', fontSize: 16 }}>Portfolio Yield</Text>
              <Text style={{ color: '#00B0F0', fontSize: 14 }}>+24.5% APY</Text>
            </div>
          </FloatingElement>

          <FloatingElement style={{ bottom: '25%', right: '8%' }} delay="2s">
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #52c41a, #389e0d)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: 24 }} />
            </div>
            <div>
              <Text strong style={{ color: 'white', display: 'block', fontSize: 16 }}>Goal Met</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Retirement Fund</Text>
            </div>
          </FloatingElement>

          <HeroContent>
            <Badge>
              <span /> Series A Funding Secured
            </Badge>
            <HeroTitle>
              Wealth Management <br />
              <span className="highlight">Reimagined</span>
            </HeroTitle>
            <HeroSubtitle>
              The first AI-native financial platform that combines institutional-grade analytics with human expertise. Your future, engineered for growth.
            </HeroSubtitle>
            <Space size="middle" wrap style={{ justifyContent: 'center' }}>
              <Link to="/register">
                <CTAButton>
                  Start Investing <ArrowRightOutlined />
                </CTAButton>
              </Link>
              <Link to="/planning">
                <OutlineButton>
                  Book Consultation
                </OutlineButton>
              </Link>
            </Space>
          </HeroContent>
        </HeroSection>

        {/* Stats Section */}
        <StatSection>
          <Row justify="center" gutter={[48, 48]} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            {[
              { value: '₹50Cr+', label: 'Assets Managed' },
              { value: '2k+', label: 'Active Investors' },
              { value: '98%', label: 'Client Retention' }
            ].map((stat, i) => (
              <Col key={i} xs={24} md={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 12, letterSpacing: '-2px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>
                  {stat.label}
                </div>
              </Col>
            ))}
          </Row>
        </StatSection>

        {/* Features Grid */}
        <FeatureGrid>
          <Reveal>
            <FeatureCard>
              <div className="icon-wrapper">
                <RocketOutlined style={{ color: '#00B0F0' }} />
              </div>
              <h3>AI-Driven Strategy</h3>
              <p>Our autonomous algorithms analyze millions of data points to construct a portfolio that evolves with the market.</p>
            </FeatureCard>
          </Reveal>

          <Reveal delay={100}>
            <FeatureCard>
              <div className="icon-wrapper">
                <TeamOutlined style={{ color: '#F2C811' }} />
              </div>
              <h3>Expert Access</h3>
              <p>Direct line to India's top Chartered Accountants and Financial Analysts for complex tax and estate planning.</p>
            </FeatureCard>
          </Reveal>

          <Reveal delay={200}>
            <FeatureCard>
              <div className="icon-wrapper">
                <SafetyOutlined style={{ color: '#52c41a' }} />
              </div>
              <h3>Bank-Grade Security</h3>
              <p>Your assets are protected by military-grade encryption and insured custodial partners.</p>
            </FeatureCard>
          </Reveal>

          <Reveal delay={300}>
            <FeatureCard>
              <div className="icon-wrapper">
                <GlobalOutlined style={{ color: '#ff4d4f' }} />
              </div>
              <h3>Global Access</h3>
              <p>Diversify beyond borders. Frictionless investing in US stocks, ETFs, and international bonds.</p>
            </FeatureCard>
          </Reveal>

          <Reveal delay={400}>
            <FeatureCard>
              <div className="icon-wrapper">
                <LineChartOutlined style={{ color: '#fff' }} />
              </div>
              <h3>Real-Time Analytics</h3>
              <p>Visualize your wealth with our proprietary dashboard engine. Track net worth, XIRR, and projections instantly.</p>
            </FeatureCard>
          </Reveal>

          <Reveal delay={500}>
            <FeatureCard>
              <div className="icon-wrapper">
                <TrophyOutlined style={{ color: '#722ed1' }} />
              </div>
              <h3>Goal Tracking</h3>
              <p>Turn dreams into deadlines. Our goal engine reverse-engineers your required savings rate to hit life's milestones.</p>
            </FeatureCard>
          </Reveal>
        </FeatureGrid>

        {/* Big CTA */}
        <div style={{
          padding: '160px 24px',
          background: 'linear-gradient(180deg, #000 0%, #111 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Title level={2} style={{ color: 'white', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 32, letterSpacing: '-1px' }}>
              Ready to Upgrade Your Life?
            </Title>
            <Link to="/register">
              <CTAButton style={{ height: 80, fontSize: '1.4rem', padding: '0 64px' }}>
                Create Free Account
              </CTAButton>
            </Link>
          </div>

          {/* Background Glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(0,176,240,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </div>

      </Content>
    </PageLayout>
  );
};

export default Home;