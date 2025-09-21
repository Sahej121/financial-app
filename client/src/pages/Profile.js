import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Descriptions, Spin, Avatar, Typography, Button, Space, Tag } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, CrownOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .ant-card-head {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
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
    padding: 40px;
  }
`;

const UserHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(24, 144, 255, 0.1);
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
    font-weight: 600;
    color: #333;
    font-size: 16px;
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
    border-radius: 8px;
    padding: 12px 16px;
    margin-right: 16px;
    width: 200px;
  }

  .ant-descriptions-item-content {
    font-size: 16px;
    color: #666;
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e8f2ff;
  }

  .ant-descriptions-item {
    padding: 8px 0;
  }
`;

const ActionButtons = styled.div`
  margin-top: 32px;
  text-align: center;
`;

const EditButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
  padding: 0 32px;

  &:hover {
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(82, 196, 26, 0.4);
  }
`;

const Profile = () => {
  const { user, loading } = useSelector((state) => state.user);

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
      'user': '👤 Regular User',
      'ca': '👨‍💼 Chartered Accountant',
      'financial_planner': '📊 Financial Planner',
      'admin': '👑 Administrator'
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
      <ProfileCard title="👤 Profile Information">
        <UserHeader>
          <UserAvatar icon={<UserOutlined />} />
          <Title level={3} style={{ margin: '0 0 8px 0', color: '#333' }}>
            {user.name}
          </Title>
          <RoleTag color={getRoleColor(user.role)}>
            {getRoleDisplay(user.role)}
          </RoleTag>
        </UserHeader>

        <StyledDescriptions bordered column={1}>
          <Descriptions.Item label="👤 Full Name">
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label="📧 Email Address">
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              {user.email}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="🎭 User Role">
            <Space>
              <CrownOutlined style={{ color: getRoleColor(user.role) }} />
              {getRoleDisplay(user.role)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="📅 Member Since">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
          </Descriptions.Item>        </StyledDescriptions>

        <ActionButtons>
          <EditButton icon={<EditOutlined />}>
            ✏️ Edit Profile
          </EditButton>
        </ActionButtons>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile; 