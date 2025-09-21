import React from 'react';
import { Card, Typography, Space, Button, Divider } from 'antd';
import { UserOutlined, SafetyOutlined, NotificationOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const SettingsContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Settings = () => {
  return (
    <SettingsContainer>
      <Title level={2}>Settings</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>
              <UserOutlined /> Profile Settings
            </Title>
            <Text>Manage your personal information and preferences</Text>
            <Button type="primary">Edit Profile</Button>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>
              <SafetyOutlined /> Security Settings
            </Title>
            <Text>Update your password and security preferences</Text>
            <Button type="primary">Change Password</Button>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>
              <NotificationOutlined /> Notification Settings
            </Title>
            <Text>Configure how you receive notifications about meetings and documents</Text>
            <Button type="primary">Manage Notifications</Button>
          </Space>
        </Card>
      </Space>
    </SettingsContainer>
  );
};

export default Settings;
