import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Descriptions, Spin, Avatar, Typography, Button, Space, Tag, Modal, Form, Input, message } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, CrownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { updateProfile } from '../redux/slices/userSlice';

const { Title, Text } = Typography;

const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  background: #000;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;

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

const ProfileCard = styled(Card)`
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .ant-card-head {
    background: transparent;
    border: none;
    padding: 40px 40px 0 40px;

    .ant-card-head-title {
      color: white;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
  }

  .ant-card-body {
    padding: 32px 40px 40px 40px;
  }
`;

const UserHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const UserAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  font-size: 32px;
  margin-bottom: 16px;
  box-shadow: 0 8px 25px rgba(24, 144, 255, 0.3);
`;

const RoleTag = styled(Tag)`
  border-radius: 20px;
  padding: 4px 16px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
`;

const StyledDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    font-size: 15px;
    background: transparent !important;
    padding: 16px 0 !important;
    width: 180px;
  }

  .ant-descriptions-item-content {
    font-size: 16px;
    color: white;
    padding: 16px 0 !important;
    background: transparent !important;
    border: none !important;
  }

  .ant-descriptions-row > td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  }

  .ant-descriptions-item {
    padding: 0;
  }
`;

const ActionButtons = styled.div`
  margin-top: 32px;
  text-align: center;
`;

const EditButton = styled(Button)`
  height: 52px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  background: white;
  border: none;
  color: black;
  transition: all 0.3s ease;
  padding: 0 40px;

  &:hover {
    background: #e6e6e6 !important;
    color: black !important;
    transform: translateY(-2px);
  }
`;

const Profile = () => {
  const { user, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </ProfileContainer>
    );
  }

  const getRoleDisplay = (role) => {
    const roleMap = {
      'user': 'Regular User',
      'ca': 'Chartered Accountant',
      'financial_planner': 'Financial Planner',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'user': '#1890ff',
      'ca': '#52c41a',
      'financial_planner': '#722ed1',
      'admin': '#fa8c16'
    };
    return colorMap[role] || '#1890ff';
  };

  return (
    <ProfileContainer>
      <ProfileCard title="Profile Information">
        <UserHeader>
          <UserAvatar icon={<UserOutlined />} />
          <Title level={3} style={{ margin: '0 0 8px 0', color: 'white', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {user.name}
          </Title>
          <RoleTag color={getRoleColor(user.role)}>
            {getRoleDisplay(user.role)}
          </RoleTag>
        </UserHeader>

        <StyledDescriptions bordered column={1}>
          <Descriptions.Item label="Full Name">
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email Address">
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              {user.email}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="User Role">
            <Space>
              <CrownOutlined style={{ color: getRoleColor(user.role) }} />
              {getRoleDisplay(user.role)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Member Since">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
          </Descriptions.Item>        </StyledDescriptions>

        <ActionButtons>
          <EditButton
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({ name: user.name, email: user.email });
              setIsModalVisible(true);
            }}
          >
            Edit Profile
          </EditButton>
        </ActionButtons>
      </ProfileCard>

      <Modal
        title="Edit Profile"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(values)
              });
              const data = await response.json();
              if (response.ok) {
                message.success('Profile updated successfully!');
                setIsModalVisible(false);
                // Update local state via dispatch
                dispatch(updateProfile(data.user));
              } else {
                message.error(data.error || 'Failed to update profile');
              }
            } catch (err) {
              message.error('An error occurred. Please try again.');
            }
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Changes</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ProfileContainer>
  );
};

export default Profile; 