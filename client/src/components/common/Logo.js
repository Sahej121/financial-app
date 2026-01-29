import React from 'react';
import styled from 'styled-components';

const LogoImage = styled.img`
  height: 60px;
  margin-bottom: 20px;
  object-fit: contain;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = () => {
  return (
    <LogoWrapper>
      <LogoImage
        src="/logo_refined.svg"
        alt="CreditLeliya Logo"
      />
    </LogoWrapper>
  );
};

export default Logo; 