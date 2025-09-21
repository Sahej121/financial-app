import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Divider, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import styled from 'styled-components';

const { Paragraph } = Typography;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  }

  .ant-card-head {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    border-radius: 24px 24px 0 0;
    padding: 32px 32px 24px 32px;

    .ant-card-head-title {
      color: white;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
    }
  }

  .ant-card-body {
    padding: 40px 32px 32px 32px;
  }
`;

const SocialButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
  
  &.google {
    background: linear-gradient(135deg, #dd4b39 0%, #c23321 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(221, 75, 57, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #c23321 0%, #dd4b39 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(221, 75, 57, 0.4);
    }
  }
  
  &.facebook {
    background: linear-gradient(135deg, #3b5998 0%, #2d4373 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(59, 89, 152, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #2d4373 0%, #3b5998 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 89, 152, 0.4);
    }
  }
`;

const FormContainer = styled.div`
  .ant-form-item-label > label {
    font-weight: 600;
    color: #333;
    font-size: 16px;
  }

  .ant-input {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .ant-input-password {
    .ant-input {
      border: none;
      box-shadow: none;
    }
  }

  .ant-input-affix-wrapper {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(24, 144, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const DividerStyled = styled(Divider)`
  .ant-divider-inner-text {
    background: white;
    padding: 0 16px;
    font-weight: 600;
    color: #666;
  }
`;

const SignUpSection = styled.div`
  text-align: center;
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f9ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(24, 144, 255, 0.1);
`;

const SignUpButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(82, 196, 26, 0.4);
  }
`;

const CAButton = styled(Button)`
  width: 100%;
  height: 40px;
  border-radius: 12px;
  font-weight: 600;
  background: transparent;
  border: 2px solid #1890ff;
  color: #1890ff;
  transition: all 0.3s ease;

  &:hover {
    background: #1890ff;
    color: white;
    transform: translateY(-1px);
  }
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setError(null);
    setLoading(true);
    try {
      console.log('Submitting login form with values:', values);
      const response = await auth.login(values);
      console.log('Login successful:', response);
      
      message.success('Login successful!');
      
      // Redirect based on user role
      switch (response.user.role) {
        case 'ca':
          navigate('/ca-dashboard');
          break;
        case 'financial_planner':
          navigate('/financial-planner-dashboard');
          break;
        case 'admin':
          navigate('/dashboard'); // Admins use user dashboard for now
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <LoginContainer>
      <LoginCard title="🔐 Welcome Back">
        {error && (
          <Alert
            message="❌ Error"
            description={error}
            type="error"
            showIcon
            style={{ 
              marginBottom: 24,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #fff2f0 0%, #ffe7e6 100%)'
            }}
          />
        )}
        
        <SocialButton
          className="google"
          icon={<GoogleOutlined />}
          onClick={() => handleSocialLogin('google')}
        >
          🚀 Continue with Google
        </SocialButton>

        <SocialButton
          className="facebook"
          icon={<FacebookOutlined />}
          onClick={() => handleSocialLogin('facebook')}
        >
          📘 Continue with Facebook
        </SocialButton>

        <DividerStyled>or</DividerStyled>

        <FormContainer>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="📧 Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                placeholder="Enter your email address" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="🔒 Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <LoginButton 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </LoginButton>
            </Form.Item>
          </Form>
        </FormContainer>

        <SignUpSection>
          <Paragraph style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
            🆕 New to our platform?
          </Paragraph>
          <SignUpButton 
            onClick={() => navigate('/register')}
            size="large"
          >
            ✨ Create New Account
          </SignUpButton>
          <CAButton 
            onClick={() => navigate('/ca-register')}
          >
            👨‍💼 Register as CA
          </CAButton>
        </SignUpSection>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button
            type="link"
            onClick={() => navigate('/forgot-password')}
            style={{ 
              fontSize: '14px',
              fontWeight: '600',
              color: '#1890ff'
            }}
          >
            🔑 Forgot Password?
          </Button>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 