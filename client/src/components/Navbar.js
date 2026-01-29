import React from 'react';
import { Layout, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: transparent;
  position: fixed;
  width: 100%;
  z-index: 100;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(Link)`
  color: white;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &:hover {
    color: white;
    opacity: 0.9;
  }
`;

const NavButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  height: 36px;
  padding: 0 20px;
  border-radius: 18px;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  &.primary {
    background: white;
    color: black;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      color: black;
    }
  }
`;

const Navbar = () => {
  return (
    <StyledHeader>
      <Logo to="/">
        <img src="/logo_refined.svg" alt="Logo" style={{ height: 32, marginRight: 8, objectFit: 'contain' }} />
        CreditLeliya
      </Logo>

      <Space size={16}>
        <Link to="/pricing">
          <NavButton>Pricing</NavButton>
        </Link>
        <Link to="/updates">
          <NavButton>Updates</NavButton>
        </Link>
        <Link to="/download">
          <NavButton>Download</NavButton>
        </Link>
        <Link to="/login">
          <NavButton>Login</NavButton>
        </Link>
        <Link to="/trial">
          <NavButton className="primary">Start your trial</NavButton>
        </Link>
      </Space>
    </StyledHeader>
  );
};

export default Navbar;
