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
  background: linear-gradient(45deg, #1a1f71, #0a4296);
  border-radius: 15px;
  padding: 25px;
  color: white;
  position: relative;
  height: 200px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  backface-visibility: hidden;

  .card-number {
    font-size: 22px;
    letter-spacing: 2px;
    margin: 20px 0;
    font-family: monospace;
  }

  .card-name {
    font-size: 18px;
    text-transform: uppercase;
    position: absolute;
    bottom: 50px;
  }

  .card-expiry {
    position: absolute;
    bottom: 25px;
    right: 25px;
    font-size: 16px;
  }

  .card-chip {
    width: 50px;
    height: 40px;
    background: #ffd700;
    border-radius: 8px;
    margin-bottom: 20px;
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