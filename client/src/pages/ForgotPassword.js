import React, { useState } from 'react';
import { Form, Input, Button, message, Alert, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/auth/AuthLayout';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
            <Button type="default" size="large" ghost style={{ borderRadius: '12px', height: '48px', width: '100%', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />}

          <Form onFinish={onFinish} layout="vertical" size="large">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input
                prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                placeholder="Email Address"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send Reset Link
              </Button>
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