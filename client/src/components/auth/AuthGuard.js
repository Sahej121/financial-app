import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Space } from 'antd';
import { UserOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton } from '../../styles/FormStyles';

const { Title, Paragraph } = Typography;

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
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

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;

  .ant-card-body {
    padding: 40px;
  }
`;

const IconWrapper = styled.div`
  font-size: 64px;
  color: #1890ff;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
  border-radius: 50%;
  margin: 0 auto 24px auto;
  box-shadow: 0 8px 25px rgba(24, 144, 255, 0.2);
`;

const AuthGuard = ({ children, redirectTo = '/login' }) => {
  const { user, token } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !token) {
    return (
      <AuthContainer>
        <AuthCard>
          <IconWrapper>
            <UserOutlined />
          </IconWrapper>
          <Title level={3} style={{ 
            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            🔒 Authentication Required
          </Title>
          <Paragraph style={{ 
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            You need to be logged in to access this feature. Please log in to continue.
          </Paragraph>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <PrimaryButton
              onClick={() => navigate(redirectTo, { state: { from: location }, replace: true })}
              style={{ width: '100%' }}
            >
              <LoginOutlined style={{ marginRight: '8px' }} />
              Login to Continue
            </PrimaryButton>
            <SecondaryButton
              onClick={() => navigate('/register', { state: { from: location }, replace: true })}
              style={{ width: '100%' }}
            >
              <UserAddOutlined style={{ marginRight: '8px' }} />
              New User? Sign Up Here
            </SecondaryButton>
          </Space>
        </AuthCard>
      </AuthContainer>
    );
  }
  return children;
};

export default AuthGuard;
