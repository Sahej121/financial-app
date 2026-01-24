import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { register } from '../../redux/slices/userSlice';
import AuthLayout from './AuthLayout';
import styled from 'styled-components';

const RegisterOption = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  margin-top: 32px;
  text-align: center;

  p {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const SecondaryButton = styled(Button)`
  height: 40px;
  border-radius: 12px;
  width: 100%;
  font-weight: 600;
  
  &:hover {
    border-color: var(--primary-color) !important;
    color: var(--primary-color) !important;
  }
`;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...userData } = values;
      await dispatch(register(userData)).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Redux handles errors
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the elite financial community"
    >
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />}

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Please input your name!' },
            { min: 2, message: 'Name must be at least 2 characters!' }
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
            placeholder="Full Name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
            placeholder="Email Address"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
            placeholder="Create Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('The two passwords do not match!');
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<SafetyOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            loading={loading}
            block
            type="primary"
            size="large"
          >
            Start Your Journey
          </Button>
        </Form.Item>
      </Form>

      <RegisterOption>
        <p>👨‍💼 Are you a Finance Professional?</p>
        <div className="options-grid">
          <Link to="/ca-register">
            <SecondaryButton ghost>CA Register</SecondaryButton>
          </Link>
          <Link to="/analyst-register">
            <SecondaryButton ghost>Analyst Register</SecondaryButton>
          </Link>
        </div>
      </RegisterOption>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Sign in here</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;