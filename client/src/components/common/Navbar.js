import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd';
import { HomeOutlined, BankOutlined, CreditCardOutlined, TeamOutlined, QuestionCircleOutlined, UserOutlined, LoginOutlined, DashboardOutlined, LogoutOutlined, SettingOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import { useTheme } from '../../contexts/ThemeContext';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.8);

  .ant-menu-item {
    color: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    margin: 0 4px;
    transition: all 0.3s ease;
    
    &:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    &.ant-menu-item-selected {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      font-weight: 600;
    }
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

const NavButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  padding: 4px 16px;
  height: 36px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.4);
    color: #667eea;
    transform: translateY(-1px);
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const { isDarkMode, toggleTheme } = useTheme();
  const [imgError, setImgError] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'ca':
        return '/ca-dashboard';
      case 'financial_planner':
        return '/financial-planner-dashboard';
      default:
        return '/dashboard';
    }
  };

  const getUserMenuItems = () => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate(getDashboardPath())
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

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
        {token && user ? (
          <Space>
            <Button 
              type="primary" 
              icon={<DashboardOutlined />}
              onClick={() => navigate(getDashboardPath())}
            >
              Dashboard
            </Button>
            <Button 
              type="text" 
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ 
                color: isDarkMode ? '#ffd700' : '#667eea',
                border: `1px solid ${isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`,
                borderRadius: '20px'
              }}
            />
            <Dropdown
              menu={{ items: getUserMenuItems() }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                style={{ 
                  color: '#667eea', 
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  background: 'rgba(102, 126, 234, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
              >
                <Space>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />}
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  />
                  <span style={{ fontWeight: '500' }}>{user.name}</span>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        ) : (
          <Space>
            <Button 
              type="text" 
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ 
                color: isDarkMode ? '#ffd700' : '#667eea',
                border: `1px solid ${isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`,
                borderRadius: '20px'
              }}
            />
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
          </Space>
        )}
      </AuthContainer>
    </StyledHeader>
  );
};

export default Navbar; 