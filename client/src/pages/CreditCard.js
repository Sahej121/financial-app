import React from 'react';
import { Typography } from 'antd';
import CreditCardForm from '../components/credit-card/CreditCardForm';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
`;

const HeroTitle = styled(Title)`
  color: white !important;
  font-size: 36px !important;
  font-weight: 700 !important;
  margin-bottom: 20px !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeroDescription = styled(Paragraph)`
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 18px !important;
  max-width: 800px !important;
  margin: 0 auto !important;
  line-height: 1.6 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CreditCard = () => {
  return (
    <div>
      <HeroSection>
        <HeroTitle>💳 Find Your Ideal Credit Card</HeroTitle>
        <HeroDescription>
          Answer a few questions about your preferences and financial profile, 
          and we'll help you find the perfect credit card that matches your needs.
        </HeroDescription>
      </HeroSection>
      <CreditCardForm />
    </div>
  );
};

export default CreditCard; 