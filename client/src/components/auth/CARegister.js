import React from 'react';
import { Form, Input, Button, Card, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 0 16px;
`;

const CARegister = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const onFinish = async (values) => {
    try {
      // Remove confirmPassword from the data sent to server
      const { confirmPassword, ...userData } = values;
      // Add role as 'ca' for CA registration
      const result = await dispatch(register({ ...userData, role: 'ca' })).unwrap();
      // Navigate to CA dashboard after registration
      navigate('/ca-dashboard', { replace: true });
    } catch (error) {
      // Error is handled by Redux
    }
  };

  return (
    <RegisterContainer>
      <Card title="CA Registration">
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="caNumber"
            label="CA Registration Number"
            rules={[
              { required: true, message: 'Please enter your CA registration number' },
              { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit CA number' }
            ]}
          >
            <Input placeholder="Enter your 6-digit CA registration number" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input addonBefore="+91" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Register as CA
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </RegisterContainer>
  );
};

export default CARegister; 