import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import AppleLogin from 'react-apple-login';
import { register, googleLogin, appleLogin } from '../../redux/slices/userSlice';
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

const StyledInputPassword = styled(Input.Password)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
  height: 56px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  input { background: transparent !important; color: white !important; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &:focus-within {
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
`;

const SecondaryButton = styled(Button)`
  height: 48px;
  border-radius: 14px;
  width: 100%;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: #00B0F0 !important;
    color: white !important;
    transform: translateY(-2px);
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
        <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
          <StyledInput
            prefix={<UserOutlined style={{ color: '#00B0F0' }} />}
            placeholder="Full Name"
          />
        </Form.Item>

        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
          <StyledInput
            prefix={<MailOutlined style={{ color: '#00B0F0' }} />}
            placeholder="Email Address"
          />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
          <StyledInputPassword
            prefix={<LockOutlined style={{ color: '#00B0F0' }} />}
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
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject('The two passwords do not match!');
              },
            }),
          ]}
        >
          <StyledInputPassword
            prefix={<SafetyOutlined style={{ color: '#00B0F0' }} />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <StyledButton type="primary" htmlType="submit" loading={loading} block>
            Start Your Journey
          </StyledButton>
        </Form.Item>
      </Form>

      <RegisterOption>
        <p>👨‍💼 Are you a Finance Professional?</p>
        <div className="options-grid">
          <Link to="/ca-register">
            <SecondaryButton>CA Register</SecondaryButton>
          </Link>
          <Link to="/analyst-register">
            <SecondaryButton>Analyst Register</SecondaryButton>
          </Link>
        </div>
      </RegisterOption>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Or sign up with</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <GoogleLogin
            onSuccess={credentialResponse => {
              dispatch(googleLogin({ token: credentialResponse.credential }))
                .unwrap()
                .then(() => navigate('/dashboard'));
            }}
            onError={() => console.log('Login Failed')}
          />

          <AppleLogin
            clientId={process.env.REACT_APP_APPLE_CLIENT_ID || "com.example.apple.login"}
            redirectURI={process.env.REACT_APP_APPLE_REDIRECT_URI || "https://example.com/auth/apple/callback"}
            usePopup={true}
            callback={(response) => {
              if (!response.error) {
                dispatch(appleLogin(response))
                  .unwrap()
                  .then(() => navigate('/dashboard'));
              }
            }}
            render={(props) => (
              <StyledButton
                icon={<AppleOutlined />}
                onClick={props.onClick}
                block
                style={{ background: '#000', color: '#fff', border: 'none' }}
              >
                Continue with Apple
              </StyledButton>
            )}
          />
        </div>

        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Sign in here</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;