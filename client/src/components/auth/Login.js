import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import AppleLogin from 'react-apple-login';
import { login, googleLogin, appleLogin } from '../../redux/slices/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      // Navigate to appropriate dashboard based on user role
      const dashboardPath = getDashboardPath(result.user.role);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ca':
        return '/ca-dashboard';
      case 'financial_planner':
        return '/financial-planner-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
      <Card title="Login" bordered={false}>
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}

        <Form
          form={form}
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
        </Form>

        <div style={{ margin: '24px 0', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 24 }}>
          <p style={{ color: '#888', marginBottom: 16 }}>Or login with</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <GoogleLogin
              onSuccess={credentialResponse => {
                dispatch(googleLogin({ token: credentialResponse.credential }))
                  .unwrap()
                  .then(result => navigate(getDashboardPath(result.user.role)));
              }}
              onError={() => console.log('Login Failed')}
              useOneTap
            />

            <AppleLogin
              clientId={process.env.REACT_APP_APPLE_CLIENT_ID || "com.example.apple.login"}
              redirectURI={process.env.REACT_APP_APPLE_REDIRECT_URI || "https://example.com/auth/apple/callback"}
              usePopup={true}
              callback={(response) => {
                if (!response.error) {
                  dispatch(appleLogin(response))
                    .unwrap()
                    .then(result => navigate(getDashboardPath(result.user.role)));
                }
              }}
              render={(props) => (
                <Button
                  icon={<AppleOutlined />}
                  onClick={props.onClick}
                  block
                  style={{ height: 40, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Continue with Apple
                </Button>
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login; 