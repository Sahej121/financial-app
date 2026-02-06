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
  const { loading, error, user, isVerified } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  // Helper to determine dashboard path based on role
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


  // Redirect if already logged in
  React.useEffect(() => {
    console.log('Login useEffect:', { user, isVerified, location: location.pathname });
    if (user && isVerified) {
      if (location.state?.from) {
        console.log('Redirecting to location.state.from:', location.state.from);
        navigate(location.state.from, { replace: true });
      } else {
        const path = getDashboardPath(user.role);
        console.log('Redirecting to dashboard:', path);
        navigate(path, { replace: true });
      }
    }
  }, [user, isVerified, navigate, location]);

  const onFinish = async (values) => {
    try {
      console.log('onFinish called');
      const result = await dispatch(login(values)).unwrap();
      console.log('Login API response received');

      // Get the target path immediately
      const role = result.user?.role || 'user';
      const targetPath = location.state?.from || getDashboardPath(role);
      console.log('About to redirect to:', targetPath);

      // Use direct assignment - this is the most reliable method
      window.location.href = targetPath;

    } catch (err) {
      console.error('Login error caught:', err);
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
                  .then(result => {
                    const role = result.user?.role || 'user';
                    if (location.state?.from) {
                      window.location.href = location.state.from;
                    } else {
                      window.location.href = getDashboardPath(role);
                    }
                  });
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
                    .then(result => {
                      const role = result.user?.role || 'user';
                      if (location.state?.from) {
                        window.location.href = location.state.from;
                      } else {
                        window.location.href = getDashboardPath(role);
                      }
                    });
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