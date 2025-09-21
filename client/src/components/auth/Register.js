import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { register } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 0 16px;
`;

const RegisterOptions = styled.div`
  text-align: center;
  margin-top: 16px;
  p {
    margin-bottom: 8px;
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
      <Card title="User Registration">
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Full Name" 
              size="large"
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
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
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
              Register as User
            </Button>
          </Form.Item>
        </Form>
        <RegisterOptions>
          <p>Are you a Chartered Accountant?</p>
          <Link to="/ca-register">
            <Button type="link">Register as CA</Button>
          </Link>
        </RegisterOptions>
      </Card>
    </RegisterContainer>
  );
};

export default Register; 