import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #141414;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  background: #1f1f1f;
  border: 1px solid #303030;
  border-radius: 12px;

  .ant-card-head {
    border-bottom: 1px solid #303030;
  }
`;

const SocialButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
  height: 40px;
  
  &.google {
    background-color: #dd4b39;
    border-color: #dd4b39;
    color: white;
    
    &:hover {
      background-color: #c23321;
      border-color: #c23321;
    }
  }
  
  &.facebook {
    background-color: #3b5998;
    border-color: #3b5998;
    color: white;
    
    &:hover {
      background-color: #2d4373;
      border-color: #2d4373;
    }
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
      <LoginCard title="Login">
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <SocialButton
          className="google"
          icon={<GoogleOutlined />}
          onClick={() => handleSocialLogin('google')}
        >
          Continue with Google
        </SocialButton>

        <SocialButton
          className="facebook"
          icon={<FacebookOutlined />}
          onClick={() => handleSocialLogin('facebook')}
        >
          Continue with Facebook
        </SocialButton>

        <Divider>or</Divider>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Log in
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Button 
              type="link" 
              onClick={() => navigate('/register')}
            >
              Register now
            </Button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button
              type="link"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </Button>
          </div>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 