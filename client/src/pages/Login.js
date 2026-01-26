import React from 'react';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/userSlice';
import AuthLayout from '../components/auth/AuthLayout';
import styled from 'styled-components';

// --- Styled Components for Form Elements ---
const SOCIAL_BUTTON_STYLE = {
  height: 50,
  borderRadius: 12,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'white',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  width: '100%',
  transition: 'all 0.3s ease'
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { loading, error } = useSelector((state) => state.user);

  const onFinish = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result && result.user && result.user.role) {
        switch (result.user.role) {
          case 'ca': navigate('/ca-dashboard', { replace: true }); break;
          case 'financial_planner': navigate('/financial-planner-dashboard', { replace: true }); break;
          default: navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Redux handles error
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
    >
      {error && <Alert message={typeof error === 'string' ? error : 'Login failed'} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />}

      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
          <Input
            prefix={<UserOutlined style={{ color: 'rgba(255,255,255,1)' }} />}
            placeholder="Email Address"
          />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password
            prefix={<LockOutlined style={{ color: 'rgba(255,255,255,1)' }} />}
            placeholder="Password"
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>
            Forgot Password?
          </Link>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,1)', fontSize: '0.9rem' }}>OR</Divider>

      <Button style={SOCIAL_BUTTON_STYLE} onClick={() => window.location.href = '/api/auth/google'}>
        <GoogleOutlined style={{ color: '#EA4335', fontSize: 18 }} />
        Continue with Google
      </Button>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <span style={{ color: 'var(--text-secondary)' }}>New to CreditLeliya? </span>
        <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Create Account</Link>

        <div style={{ marginTop: 12 }}>
          <Link to="/ca-register" style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Are you a Professional?</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login; 