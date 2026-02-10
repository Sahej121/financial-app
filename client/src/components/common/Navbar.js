import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Dropdown, Drawer, Grid } from 'antd';
import { HomeOutlined, BankOutlined, CreditCardOutlined, TeamOutlined, UserOutlined, DashboardOutlined, LogoutOutlined, SettingOutlined, RocketOutlined, FileTextOutlined, AuditOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const StyledHeader = styled(Header)`
  background: var(--bg-glass-heavy);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
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
    background: linear-gradient(90deg, #fff, var(--text-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const DesktopMenu = styled(Menu)`
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
      color: var(--text-primary) !important;
      background: var(--bg-surface-hover) !important;
    }

    &::after {
      display: none !important;
    }
    
    &.ant-menu-item-selected {
      color: #fff !important;
      background: var(--primary-color-alpha) !important;
      font-weight: 600;
    }
  }
`;

const MobileMenuButton = styled(Button)`
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover, &:focus {
    color: var(--primary-color);
    background: transparent;
  }
`;

const SidebarButton = styled(Button)`
  border: 1px solid var(--border-primary);
  background: var(--bg-surface);
  color: white;
  border-radius: 20px;
  
  &:hover {
    background: var(--bg-surface-hover) !important;
    border-color: white !important;
    color: white !important;
  }
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const screens = useBreakpoint();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Consider mobile if screen width is less than lg (992px)
  const isMobile = !screens.lg;

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
    { key: '/', icon: <HomeOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Home' },
    ...(token && user ? [
      { key: getDashboardPath(), icon: <DashboardOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Dashboard' },
      { key: '/wealth-monitor', icon: <RocketOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Wealth Monitor' },
      { key: '/gst', icon: <AuditOutlined style={{ color: 'var(--primary-color)' }} />, label: 'GST Filing' }
    ] : []),
    { key: '/planning', icon: <BankOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Planning' },
    { key: '/ca-selection', icon: <TeamOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Expert CA' },
    { key: '/credit-card', icon: <CreditCardOutlined style={{ color: 'var(--primary-color)' }} />, label: 'Cards' },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.key === '/gst' && user?.role !== 'ca') return false;
    if ((user?.role === 'ca' || user?.role === 'financial_planner') && ['/planning', '/ca-selection'].includes(item.key)) return false;
    return true;
  });

  const processedMenuItems = filteredMenuItems.map(item => ({
    ...item,
    label: <Link to={item.key} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
  }));

  const userMenu = (
    <Menu theme="dark" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <Menu.Item key="dashboard" icon={<DashboardOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => navigate(getDashboardPath())}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => navigate('/settings')}>
        Settings
      </Menu.Item>
      <Menu.Divider style={{ borderColor: 'var(--border-secondary)' }} />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: 'var(--error-color)' }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <StyledHeader>
        <LogoContainer to="/">
          <img src="/logo_refined.svg" alt="Logo" style={{ height: 48, marginRight: 12, objectFit: 'contain' }} />
          {!isMobile && <span style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '1px' }}>CreditLeliya</span>}
        </LogoContainer>

        {!isMobile ? (
          <>
            <DesktopMenu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={processedMenuItems}
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
                    <Button type="text" shape="round" style={{ color: 'rgba(255,255,255,0.8)' }}>Log In</Button>
                  </Link>
                  <Link to="/register">
                    <Button type="primary" shape="round" style={{ background: 'white', color: 'black', border: 'none', fontWeight: 600 }}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </Space>
          </>
        ) : (
          <Space>
            {token && user && (
              <Dropdown overlay={userMenu} placement="bottomRight" arrow toggleVisible={true}>
                <Button type="text" icon={<UserOutlined style={{ color: 'white', fontSize: '20px' }} />} />
              </Dropdown>
            )}
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <MenuOutlined />
            </MobileMenuButton>
          </Space>
        )}
      </StyledHeader>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <LogoContainer to="/" onClick={() => setMobileMenuOpen(false)} style={{ margin: 0 }}>
            <img src="/logo_refined.svg" alt="Logo" style={{ height: 32, marginRight: 10 }} />
            <span style={{ fontSize: '20px' }}>CreditLeliya</span>
          </LogoContainer>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        visible={mobileMenuOpen}
        bodyStyle={{ padding: 0, background: 'var(--bg-base)' }}
        headerStyle={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-primary)' }}
        width={280}
      >
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={processedMenuItems}
          style={{ background: 'transparent', border: 'none', marginTop: '10px' }}
        />

        {!token && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-primary)', marginTop: '10px' }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button block type="default" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)', background: 'transparent' }}>Log In</Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button block type="primary" style={{ background: 'white', color: 'black', border: 'none' }}>Get Started</Button>
            </Link>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default Navbar;