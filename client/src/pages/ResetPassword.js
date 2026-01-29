import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/auth/AuthLayout';

import styled from 'styled-components';

const { Text } = Typography;

const StyledInputPassword = styled(Input.Password)`
background: rgba(255, 255, 255, 0.03)!important;
border: 1px solid rgba(255, 255, 255, 0.1)!important;
border - radius: 16px;
height: 56px;
transition: all 0.4s cubic - bezier(0.4, 0, 0.2, 1);

  input { background: transparent!important; color: white!important; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05)!important;
    border - color: rgba(255, 255, 255, 0.2)!important;
}
  
  &: focus - within {
    background: rgba(255, 255, 255, 0.05)!important;
    border - color: #00B0F0!important;
    box - shadow: 0 0 20px rgba(0, 176, 240, 0.2)!important;
}
`;

const StyledButton = styled(Button)`
height: 56px;
border - radius: 16px;
font - weight: 700;
font - size: 16px;
transition: all 0.3s ease;

  &.ant - btn - primary {
    background: linear - gradient(135deg, #00B0F0 0 %, #0070C0 100 %);
    border: none;
    box - shadow: 0 10px 20px rgba(0, 176, 240, 0.2);

    &:hover {
        transform: translateY(-2px);
        box - shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
    }
}
`;

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { resetToken } = useParams();

    const onFinish = async (values) => {
        setError(null);
        setLoading(true);
        try {
            await axios.put(`/ api / auth / reset - password / ${resetToken} `, { password: values.password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={success ? "Password Reset!" : "Reset Password"}
            subtitle={success ? "" : "Create a new strong password"}
        >
            {success ? (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ margin: '0 auto 24px', width: 64, height: 64, background: 'rgba(52, 199, 89, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: 32, color: '#34c759' }} />
                    </div>
                    <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 32, fontSize: '1rem' }}>
                        Your password has been successfully updated. Redirecting to login...
                    </Text>
                </div>
            ) : (
                <>
                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />}

                    <Form onFinish={onFinish} layout="vertical" size="large">
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your new password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' }
                            ]}
                        >
                            <StyledInputPassword
                                prefix={<LockOutlined style={{ color: '#00B0F0' }} />}
                                placeholder="New Password"
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
                                        return Promise.reject('Passwords do not match!');
                                    },
                                }),
                            ]}
                        >
                            <StyledInputPassword
                                prefix={<LockOutlined style={{ color: '#00B0F0' }} />}
                                placeholder="Confirm New Password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <StyledButton type="primary" htmlType="submit" loading={loading} block>
                                Reset Password
                            </StyledButton>
                        </Form.Item>
                    </Form>
                </>
            )}
        </AuthLayout>
    );
};

export default ResetPassword;
