import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Dropdown } from 'antd';
import { HomeOutlined, BankOutlined, CreditCardOutlined, TeamOutlined, UserOutlined, DashboardOutlined, LogoutOutlined, SettingOutlined, RocketOutlined, FileTextOutlined, AuditOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  height: 72px;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  margin-right: 48px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-decoration: none;
  
  span {
    background: linear-gradient(90deg, #fff, #aaa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const StyledMenu = styled(Menu)`
  background: transparent !important;
  border: none;
  flex: 1;
  display: flex;
  justify-content: center;

  .ant-menu-item {
    color: rgba(255, 255, 255, 0.7) !important;
    font-weight: 500;
    margin: 0 12px !important;
    padding: 0 12px !important;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: white !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }

    &::after {
      display: none !important;
    }
    
    &.ant-menu-item-selected {
      color: #fff !important;
      background: rgba(255, 255, 255, 0.15) !important;
      font-weight: 600;
    }
  }
`;

const SidebarButton = styled(Button)`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-radius: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: white !important;
    color: white !important;
  }
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    window.location.reload();
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ca': return '/ca-dashboard';
      case 'financial_planner': return '/financial-planner-dashboard';
      case 'admin':
      case 'user':
      default: return '/dashboard';
    }
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined style={{ color: '#00B0F0' }} />, label: 'Home' },
    ...(token && user ? [
      { key: getDashboardPath(), icon: <DashboardOutlined style={{ color: '#00B0F0' }} />, label: 'Dashboard' },
      { key: '/documents', icon: <FileTextOutlined style={{ color: '#00B0F0' }} />, label: 'Docs AI' },
      { key: '/wealth-monitor', icon: <RocketOutlined style={{ color: '#00B0F0' }} />, label: 'Wealth Monitor' },
      { key: '/gst', icon: <AuditOutlined style={{ color: '#00B0F0' }} />, label: 'GST Filing' }
    ] : []),
    { key: '/planning', icon: <BankOutlined style={{ color: '#00B0F0' }} />, label: 'Planning' },
    { key: '/ca-selection', icon: <TeamOutlined style={{ color: '#00B0F0' }} />, label: 'Expert CA' },
    { key: '/credit-card', icon: <CreditCardOutlined style={{ color: '#00B0F0' }} />, label: 'Cards' },
  ];

  const userMenu = (
    <Menu style={{ background: '#1c1c1c', border: '1px solid #333' }}>
      <Menu.Item key="dashboard" icon={<DashboardOutlined style={{ color: '#00B0F0' }} />} onClick={() => navigate(getDashboardPath())}>
        <span style={{ color: '#fff' }}>Dashboard</span>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined style={{ color: '#00B0F0' }} />} onClick={() => navigate('/settings')}>
        <span style={{ color: '#fff' }}>Settings</span>
      </Menu.Item>
      <Menu.Divider style={{ borderTop: '1px solid #333' }} />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#ff4d4f' }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <StyledHeader>
      <LogoContainer to="/">
        <img src="/logo_refined.svg" alt="Logo" style={{ height: 48, marginRight: 12, objectFit: 'contain' }} />
        <span style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '1px' }}>CreditLeliya</span>
      </LogoContainer>

      <StyledMenu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems
          .filter(item => {
            // Hide specific links for Analysts and CAs
            if (user?.role === 'ca' || user?.role === 'financial_planner') {
              if (['/planning', '/ca-selection'].includes(item.key)) {
                return false;
              }
            }
            return true;
          })
          .map(item => ({
            ...item,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
      />

      <Space>
        {token && user ? (
          <Dropdown overlay={userMenu} placement="bottomRight" arrow>
            <SidebarButton icon={<UserOutlined />}>
              {user.name.split(' ')[0]}
            </SidebarButton>
          </Dropdown>
        ) : (
          <>
            <Link to="/login">
              <Button type="text" style={{ color: 'rgba(255,255,255,0.8)' }}>Log In</Button>
            </Link>
            <Link to="/register">
              <Button type="primary" shape="round" style={{ background: 'white', color: 'black', border: 'none', fontWeight: 600 }}>
                Get Started
              </Button>
            </Link>
          </>
        )}
      </Space>
    </StyledHeader>
  );
};

export default Navbar; 