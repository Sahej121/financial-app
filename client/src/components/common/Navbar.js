import React, { useState } from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { HomeOutlined, BankOutlined, CreditCardOutlined, TeamOutlined, QuestionCircleOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: fixed;
  width: 100%;
  z-index: 1000;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  margin-right: 48px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImage = styled.img`
  height: 40px;
  margin-right: 8px;
  object-fit: contain;
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-bottom: none;
  
  .ant-menu-item {
    padding: 0 20px;
    margin: 0 4px;
  }
`;

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 24px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Navbar = () => {
  const location = useLocation();
  const [imgError, setImgError] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/planning',
      icon: <BankOutlined />,
      label: 'Financial Planning',
    },
    {
      key: '/ca-selection',
      icon: <TeamOutlined />,
      label: 'CA Selection',
    },
    {
      key: '/credit-card',
      icon: <CreditCardOutlined />,
      label: 'Credit Cards',
    },
    {
      key: '/faq',
      icon: <QuestionCircleOutlined />,
      label: 'FAQs',
    },
  ];

  return (
    <StyledHeader>
      <LogoContainer to="/">
        <LogoImage 
          src="/images/logo.svg"
          alt="CreditLeliya Logo" 
        />
      </LogoContainer>
      
      <StyledMenu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems.map(item => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>
        }))}
      />

      <AuthContainer>
        <StyledLink to="/login">
          <Button type="text" icon={<LoginOutlined />}>
            Login
          </Button>
        </StyledLink>
        <StyledLink to="/register">
          <Button type="primary" icon={<UserOutlined />}>
            Register
          </Button>
        </StyledLink>
      </AuthContainer>
    </StyledHeader>
  );
};

export default Navbar; 