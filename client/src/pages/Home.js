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
  CheckCircleOutlined,
  MessageOutlined,
  StarFilled
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
    radial-gradient(circle at 15% 50%, rgba(0, 176, 240, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(242, 200, 17, 0.1) 0%, transparent 50%),
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

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 24px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .quote-icon {
    font-size: 32px;
    color: rgba(0, 176, 240, 0.2);
    margin-bottom: 16px;
  }

  .stars {
    color: #F2C811;
    margin-bottom: 16px;
    font-size: 14px;
  }
  
  .author {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #333, #111);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
  }
`;

const ContactBanner = styled.div`
  background: radial-gradient(circle at 50% 100%, rgba(20, 20, 20, 1) 0%, #000 100%);
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 100px 24px 120px;
  text-align: center;
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
                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
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

        {/* Testimonials Section */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Badge style={{ margin: '0 auto 16px' }}>
              <span /> Trusted by Professionals
            </Badge>
            <Title level={2} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>
              Success Stories from <span className="highlight">India's Elite</span>
            </Title>
            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
              From Chartered Accountants to High-Net-Worth Individuals, see how CreditLeliya is transforming wealth management.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Reveal>
                <TestimonialCard>
                  <div className="quote-icon">❝</div>
                  <div className="stars">
                    <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                  </div>
                  <Paragraph style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 0 }}>
                    "The AI portfolio rebalancing saved me hours of manual work. It's like having a dedicated analyst 24/7."
                  </Paragraph>
                  <div className="author">
                    <div className="avatar">R</div>
                    <div>
                      <Text strong style={{ display: 'block' }}>Rajesh Kumar</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Chartered Accountant</Text>
                    </div>
                  </div>
                </TestimonialCard>
              </Reveal>
            </Col>
            <Col xs={24} md={8}>
              <Reveal delay={100}>
                <TestimonialCard>
                  <div className="quote-icon">❝</div>
                  <div className="stars">
                    <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                  </div>
                  <Paragraph style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 0 }}>
                    "Finally, a platform that truly understands the nuances of Indian tax laws while optimizing global exposure."
                  </Paragraph>
                  <div className="author">
                    <div className="avatar">P</div>
                    <div>
                      <Text strong style={{ display: 'block' }}>Priya Sharma</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Angel Investor</Text>
                    </div>
                  </div>
                </TestimonialCard>
              </Reveal>
            </Col>
            <Col xs={24} md={8}>
              <Reveal delay={200}>
                <TestimonialCard>
                  <div className="quote-icon">❝</div>
                  <div className="stars">
                    <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                  </div>
                  <Paragraph style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 0 }}>
                    "The most intuitive dashboard I've used. I can track my entire family office's performance in one glance."
                  </Paragraph>
                  <div className="author">
                    <div className="avatar">A</div>
                    <div>
                      <Text strong style={{ display: 'block' }}>Amit Verma</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Wealth Manager</Text>
                    </div>
                  </div>
                </TestimonialCard>
              </Reveal>
            </Col>
          </Row>
        </div>

        {/* Big CTA */}
        <div style={{
          padding: '160px 24px',
          background: 'linear-gradient(180deg, #000 0%, #050505 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Title level={2} style={{ color: 'white', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 32, letterSpacing: '-1px' }}>
              Ready to Upgrade Your Life?
            </Title>
            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 48px' }}>
              Join thousands of professionals mastering their wealth with AI-driven insights.
            </Paragraph>
            <Link to="/register">
              <CTAButton style={{ height: 72, fontSize: '1.25rem', padding: '0 56px', boxShadow: '0 0 40px rgba(0, 176, 240, 0.2)' }}>
                Create Free Account
              </CTAButton>
            </Link>
          </div>

          {/* Background Glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px', height: '800px',
            background: 'radial-gradient(circle, rgba(0,176,240,0.08) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Contact Banner */}
        <ContactBanner>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              Still have questions?
            </Title>
            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 32 }}>
              Our expert team is here to help you navigate your financial journey. Whether you need enterprise solutions or personal advice, we're just a message away.
            </Paragraph>
            <Link to="/contact">
              <OutlineButton>
                Contact Support <MessageOutlined style={{ marginLeft: 8 }} />
              </OutlineButton>
            </Link>
          </div>
        </ContactBanner>

      </Content>
    </PageLayout>
  );
};

export default Home;