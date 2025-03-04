import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../redux/slices/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      // Navigate to the protected page they tried to visit or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by Redux
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
      </Card>
    </div>
  );
};

export default Login; 