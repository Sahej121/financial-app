import React, { useState } from 'react';
import { Card, Typography, Space, Button, Divider, Switch, Form, Input } from 'antd';
import { UserOutlined, SafetyOutlined, NotificationOutlined, SettingOutlined, BellOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const SettingsContainer = styled.div`
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

const SettingsCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 24px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .ant-card-head {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    border-radius: 24px 24px 0 0;
    padding: 24px 32px;

    .ant-card-head-title {
      color: white;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .ant-card-body {
    padding: 32px;
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(24, 144, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
    transform: translateX(5px);
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled(Title)`
  margin: 0 0 8px 0 !important;
  font-size: 16px !important;
  color: #333 !important;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingDescription = styled(Text)`
  color: #666;
  font-size: 14px;
  display: block;
  margin-top: 4px;
`;

const ActionButton = styled(Button)`
  height: 40px;
  border-radius: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
  padding: 0 24px;

  &:hover {
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(82, 196, 26, 0.4);
  }
`;

const SwitchStyled = styled(Switch)`
  &.ant-switch-checked {
    background-color: #52c41a;
  }

  &:hover {
    transform: scale(1.05);
  }

  transition: all 0.3s ease;
`;

const FormContainer = styled.div`
  .ant-form-item-label > label {
    font-weight: 600;
    color: #333;
    font-size: 16px;
  }

  .ant-input {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;

    &:focus, &:hover {
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
    }
  }
`;

const Settings = () => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    darkTheme: false
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // You can add API call here to save settings to backend
    console.log(`Setting ${key} changed to:`, value);
  };

  const handleSaveSettings = () => {
    // Save all settings to backend
    console.log('Saving settings:', settings);
    // Add API call here
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    setIsEditingProfile(true);
    // You can add modal opening logic here
    // or navigate to a dedicated profile edit page
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
    setIsChangingPassword(true);
    // You can add modal opening logic here
    // or navigate to a password change page
  };

  const handleSaveProfileChanges = (values) => {
    console.log('Save profile changes clicked:', values);
    setIsEditingProfile(false);
    // Add API call to save profile changes
    // You can add success/error messages here
    alert('Profile changes saved successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    form.resetFields();
  };

  return (
    <SettingsContainer>
      <div style={{ padding: '40px 0' }}>
        <Title level={2} style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #1890ff, #096dd9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          ⚙️ Settings
        </Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <SettingsCard title="👤 Profile Settings">
            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <UserOutlined /> Personal Information
                </SettingTitle>
                <SettingDescription>
                  Update your name, email, and other personal details
                </SettingDescription>
              </SettingInfo>
              <ActionButton onClick={handleEditProfile}>
                ✏️ Edit Profile
              </ActionButton>
            </SettingItem>

            {isEditingProfile && (
              <FormContainer>
                <Form 
                  form={form} 
                  layout="vertical"
                  onFinish={handleSaveProfileChanges}
                >
                  <Form.Item 
                    label="Full Name" 
                    name="fullName"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input 
                      placeholder="Enter your full name" 
                      prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Form.Item>
                  <Form.Item 
                    label="Email Address" 
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      placeholder="Enter your email" 
                      prefix={<MailOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Form.Item>
                  <Form.Item>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ActionButton 
                        htmlType="submit"
                      >
                        💾 Save Changes
                      </ActionButton>
                      <ActionButton 
                        onClick={handleCancelEdit}
                        style={{ 
                          background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                          border: 'none'
                        }}
                      >
                        ❌ Cancel
                      </ActionButton>
                    </div>
                  </Form.Item>
                </Form>
              </FormContainer>
            )}
          </SettingsCard>

          <SettingsCard title="🔒 Security Settings">
            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <LockOutlined /> Password & Security
                </SettingTitle>
                <SettingDescription>
                  Change your password and manage security preferences
                </SettingDescription>
              </SettingInfo>
              <ActionButton onClick={handleChangePassword}>
                🔑 Change Password
              </ActionButton>
            </SettingItem>

            {isChangingPassword && (
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #fff2e8 0%, #ffe7ba 100%)',
                borderRadius: '12px',
                border: '1px solid #ffd591',
                marginTop: '16px'
              }}>
                <Text style={{ color: '#d46b08', fontWeight: '600' }}>
                  🔒 Password change functionality coming soon!
                </Text>
                <br />
                <Text style={{ color: '#8c4a00', fontSize: '14px' }}>
                  This feature will allow you to securely change your password.
                </Text>
                <div style={{ marginTop: '12px' }}>
                  <ActionButton 
                    onClick={() => setIsChangingPassword(false)}
                    style={{ 
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                      border: 'none'
                    }}
                  >
                    ❌ Close
                  </ActionButton>
                </div>
              </div>
            )}

            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <SafetyOutlined /> Two-Factor Authentication
                </SettingTitle>
                <SettingDescription>
                  Add an extra layer of security to your account
                </SettingDescription>
              </SettingInfo>
              <SwitchStyled 
                checked={settings.twoFactorAuth}
                onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </SettingItem>
          </SettingsCard>

          <SettingsCard title="🔔 Notification Settings">
            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <BellOutlined /> Email Notifications
                </SettingTitle>
                <SettingDescription>
                  Receive updates about meetings and important events
                </SettingDescription>
              </SettingInfo>
              <SwitchStyled 
                checked={settings.emailNotifications}
                onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <NotificationOutlined /> Push Notifications
                </SettingTitle>
                <SettingDescription>
                  Get instant notifications on your device
                </SettingDescription>
              </SettingInfo>
              <SwitchStyled 
                checked={settings.pushNotifications}
                onChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <MailOutlined /> Marketing Emails
                </SettingTitle>
                <SettingDescription>
                  Receive promotional content and updates
                </SettingDescription>
              </SettingInfo>
              <SwitchStyled 
                checked={settings.marketingEmails}
                onChange={(checked) => handleSettingChange('marketingEmails', checked)}
              />
            </SettingItem>
          </SettingsCard>

          <SettingsCard title="🎨 Appearance Settings">
            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  <SettingOutlined /> Theme Preference
                </SettingTitle>
                <SettingDescription>
                  Choose between light and dark mode
                </SettingDescription>
              </SettingInfo>
              <SwitchStyled 
                checked={settings.darkTheme}
                onChange={(checked) => handleSettingChange('darkTheme', checked)}
              />
            </SettingItem>
          </SettingsCard>
          </Space>

        {/* Save Settings Button */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          padding: '24px',
          background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(82, 196, 26, 0.1)'
        }}>
          <ActionButton onClick={handleSaveSettings}>
            💾 Save All Settings
          </ActionButton>
        </div>
      </div>
    </SettingsContainer>
  );
};

export default Settings;
