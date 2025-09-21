import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { register } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const { Paragraph } = Typography;

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;

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

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 500px;
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
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
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
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
    }
  }
`;

const RegisterButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
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
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(82, 196, 26, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const RegisterOptions = styled.div`
  text-align: center;
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(82, 196, 26, 0.1);

  p {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
`;

const CALinkButton = styled(Button)`
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 16px;

  a {
    font-weight: 600;
    color: #1890ff;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #096dd9;
      text-decoration: underline;
    }
  }
`;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      // Remove confirmPassword from the data sent to server
      const { confirmPassword, ...userData } = values;
      const result = await dispatch(register(userData)).unwrap();
      // Navigate to user dashboard after registration
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by Redux
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard title="✨ Create Your Account">
        {error && (
          <Alert 
            message="❌ Registration Error" 
            description={error} 
            type="error" 
            style={{ 
              marginBottom: 24,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #fff2f0 0%, #ffe7e6 100%)'
            }} 
          />
        )}
        
        <FormContainer>
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="👤 Full Name"
              rules={[
                { required: true, message: 'Please input your name!' },
                { min: 2, message: 'Name must be at least 2 characters!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#52c41a' }} />} 
                placeholder="Enter your full name" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="📧 Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#52c41a' }} />} 
                placeholder="Enter your email address" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="🔒 Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#52c41a' }} />}
                placeholder="Create a strong password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="🔐 Confirm Password"
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
                prefix={<LockOutlined style={{ color: '#52c41a' }} />}
                placeholder="Confirm your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <RegisterButton 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
              </RegisterButton>
            </Form.Item>
          </Form>
        </FormContainer>

        <RegisterOptions>
          <p>👨‍💼 Are you a Chartered Accountant?</p>
          <Link to="/ca-register">
            <CALinkButton>Register as CA</CALinkButton>
          </Link>
        </RegisterOptions>

        <LoginLink>
          <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </Paragraph>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register; 