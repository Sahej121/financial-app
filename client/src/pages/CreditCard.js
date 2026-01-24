import React from 'react';
import { Typography } from 'antd';
import CreditCardForm from '../components/credit-card/CreditCardForm';
import styled, { keyframes } from 'styled-components';

const { Title, Paragraph } = Typography;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 80px;

  /* Mesh Background */
  background: 
    radial-gradient(circle at 15% 50%, rgba(0, 176, 240, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(242, 200, 17, 0.05) 0%, transparent 40%);
    
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
    pointer-events: none;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 100px 20px 40px;
  position: relative;
  z-index: 1;
  animation: ${slideUp} 0.8s ease-out;
`;

const HeroTitle = styled(Title)`
  color: white !important;
  font-size: clamp(2.5rem, 5vw, 4rem) !important;
  font-weight: 800 !important;
  margin-bottom: 24px !important;
  background: linear-gradient(135deg, #FFFFFF 0%, #A0A0A0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
`;

const HeroDescription = styled(Paragraph)`
  color: var(--text-secondary) !important;
  font-size: 1.25rem !important;
  max-width: 800px;
  margin: 0 auto !important;
  line-height: 1.6 !important;
`;

const CreditCard = () => {
  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>Find Your Ideal Credit Card</HeroTitle>
        <HeroDescription>
          Answer a few questions about your preferences and spending habits,
          and we'll match you with the perfect card.
        </HeroDescription>
      </HeroSection>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <CreditCardForm />
      </div>
    </PageContainer>
  );
};

export default CreditCard; 