import React from 'react';
import { Card } from 'antd';
import styled from 'styled-components';

const CardContainer = styled.div`
  perspective: 1000px;
  width: 350px;
  position: sticky;
  top: 20px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  
  &:hover {
    transform: rotateY(45deg);
  }
`;

const CreditCard = styled(Card)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  color: white;
  position: relative;
  height: 220px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  backface-visibility: hidden;
  font-family: 'Inter', sans-serif;

  .card-number {
    font-size: 20px;
    letter-spacing: 3px;
    margin: 32px 0;
    font-weight: 500;
  }

  .card-name {
    font-size: 14px;
    text-transform: uppercase;
    position: absolute;
    bottom: 32px;
    left: 32px;
    font-weight: 700;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .card-expiry {
    position: absolute;
    bottom: 32px;
    right: 32px;
    font-size: 14px;
    font-weight: 700;
    opacity: 0.8;
  }

  .card-chip {
    width: 44px;
    height: 32px;
    background: linear-gradient(135deg, #e6e6e6, #999);
    border-radius: 6px;
    margin-bottom: 0;
  }
`;

const InteractiveCard = ({ formData }) => {
  const { name = 'YOUR NAME', expiryDate = 'MM/YY' } = formData;

  return (
    <CardContainer>
      <CreditCard bordered={false}>
        <div className="card-chip" />
        <div className="card-number">**** **** **** 1234</div>
        <div className="card-name">{name || 'YOUR NAME'}</div>
        <div className="card-expiry">{expiryDate}</div>
      </CreditCard>
    </CardContainer>
  );
};

export default InteractiveCard; 