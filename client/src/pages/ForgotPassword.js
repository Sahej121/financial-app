import React, { useState } from 'react';
import { Form, Input, Button, message, Alert, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/auth/AuthLayout';

import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledInput = styled(Input)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  height: 56px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder { color: rgba(255, 255, 255, 0.3); }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: #00B0F0 !important;
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2) !important;
  }
`;

const StyledButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;

  &.ant-btn-primary {
    background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
    border: none;
    box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
    }
  }

  &.ant-btn-default {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setError(null);
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: values.email });
      setEmailSent(true);
      message.success('Reset link sent!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={emailSent ? "Check Your Email" : "Forgot Password?"}
      subtitle={emailSent ? "" : "Enter your email to receive a reset link"}
    >
      {emailSent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 24px', width: 64, height: 64, background: 'rgba(52, 199, 89, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailOutlined style={{ fontSize: 32, color: '#34c759' }} />
          </div>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 32, fontSize: '1rem' }}>
            We've sent a password reset link to your email address. Please check your inbox.
          </Text>
          <Link to="/login">
            <StyledButton block style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              Back to Login
            </StyledButton>
          </Link>
        </div>
      ) : (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />}

          <Form onFinish={onFinish} layout="vertical" size="large">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <StyledInput
                prefix={<MailOutlined style={{ color: '#00B0F0' }} />}
                placeholder="Email Address"
              />
            </Form.Item>

            <Form.Item>
              <StyledButton type="primary" htmlType="submit" loading={loading} block>
                Send Reset Link
              </StyledButton>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.3s' }}>
                <ArrowLeftOutlined /> Back to Login
              </Link>
            </div>
          </Form>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;