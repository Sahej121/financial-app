import React from 'react';
import { Typography } from 'antd';
import CreditCardForm from '../components/credit-card/CreditCardForm';

const { Title, Paragraph } = Typography;

const CreditCard = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f0f2f5' }}>
        <Title level={2}>Find Your Ideal Credit Card</Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: 800, margin: '0 auto' }}>
          Answer a few questions about your preferences and financial profile, 
          and we'll help you find the perfect credit card that matches your needs.
        </Paragraph>
      </div>
      <CreditCardForm />
    </div>
  );
};

export default CreditCard; 