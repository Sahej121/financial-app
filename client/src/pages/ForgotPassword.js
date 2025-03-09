import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { auth } from '../services/api';

const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #141414;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  background: #1f1f1f;
  border: 1px solid #303030;
`;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await auth.forgotPassword(values.email);
      message.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      message.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer>
      <StyledCard title="Reset Password">
        <Form
          name="forgot-password"
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
              prefix={<MailOutlined />}
              placeholder="Email"
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
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword; 