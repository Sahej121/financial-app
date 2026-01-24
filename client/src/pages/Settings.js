import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Divider, Switch, Form, Input, message, Spin } from 'antd';
import { UserOutlined, SafetyOutlined, NotificationOutlined, SettingOutlined, BellOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/userSlice';

const { Title, Text, Paragraph } = Typography;

const SettingsContainer = styled.div`
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

const SettingsCard = styled(Card)`
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  margin-bottom: 24px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .ant-card-head {
    background: transparent;
    border: none;
    padding: 32px 32px 0 32px;

    .ant-card-head-title {
      color: white;
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -0.5px;
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
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 18px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled(Title)`
  margin: 0 0 4px 0 !important;
  font-size: 16px !important;
  color: white !important;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600 !important;
`;

const SettingDescription = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  display: block;
`;

const ActionButton = styled(Button)`
  height: 44px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  background: white;
  border: none;
  color: black;
  transition: all 0.3s ease;
  padding: 0 24px;

  &:hover {
    background: #e6e6e6 !important;
    color: black !important;
    transform: translateY(-2px);
  }
`;

const SwitchStyled = styled(Switch)`
  &.ant-switch-checked {
    background-color: white;
    .ant-switch-handle::before {
        background-color: black;
    }
  }

  &:hover {
    transform: scale(1.05);
  }

  transition: all 0.3s ease;
`;

const FormContainer = styled.div`
  .ant-form-item-label > label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    font-size: 16px;
    height: 52px;
    color: white;
    transition: all 0.3s ease;

    &:focus, &:hover {
      border-color: white;
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const Settings = () => {
  const [form] = Form.useForm();
  const { user, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    darkTheme: false
  });

  useEffect(() => {
    if (user) {
      setSettings({
        twoFactorAuth: user.twoFactorAuth || false,
        emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : true,
        pushNotifications: user.pushNotifications || false,
        marketingEmails: user.marketingEmails || false,
        darkTheme: user.darkTheme || false
      });
      form.setFieldsValue({
        fullName: user.name,
        email: user.email
      });
    }
  }, [user, form]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/update-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Settings saved successfully!');
        // Update user state if necessary or just keep local settings
      } else {
        message.error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      message.error('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const handleSaveProfileChanges = async (values) => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: values.fullName, email: values.email })
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Profile updated successfully!');
        setIsEditingProfile(false);
        dispatch(updateProfile(data.user));
      } else {
        message.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      message.error('An error occurred. Please try again.');
    }
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
          color: 'white',
          fontSize: '32px',
          fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          Settings
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <SettingsCard title="Profile Settings">
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
                Edit Profile
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
                      prefix={<UserOutlined style={{ color: 'white' }} />}
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
                      prefix={<MailOutlined style={{ color: 'white' }} />}
                    />
                  </Form.Item>
                  <Form.Item>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ActionButton
                        htmlType="submit"
                      >
                        Save Changes
                      </ActionButton>
                      <ActionButton
                        onClick={handleCancelEdit}
                        style={{
                          background: 'rgba(255, 77, 79, 0.1)',
                          border: '1px solid rgba(255, 77, 79, 0.2)',
                          color: '#ff4d4f'
                        }}
                      >
                        Cancel
                      </ActionButton>
                    </div>
                  </Form.Item>
                </Form>
              </FormContainer>
            )}
          </SettingsCard>

          <SettingsCard title="Security Settings">
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
                Change Password
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
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Password change functionality coming soon!
                </Text>
                <br />
                <Text style={{ color: '#8c4a00', fontSize: '14px' }}>
                  This feature will allow you to securely change your password.
                </Text>
                <div style={{ marginTop: '12px' }}>
                  <ActionButton
                    onClick={() => setIsChangingPassword(false)}
                    style={{
                      background: 'rgba(255, 77, 79, 0.1)',
                      border: '1px solid rgba(255, 77, 79, 0.2)',
                      color: '#ff4d4f'
                    }}
                  >
                    Close
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

          <SettingsCard title="Notification Settings">
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

          <SettingsCard title="Appearance Settings">
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
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <ActionButton onClick={handleSaveSettings} loading={isSaving} style={{ height: '56px', borderRadius: '16px', padding: '0 48px', fontSize: '16px' }}>
            Save All Settings
          </ActionButton>
        </div>
      </div>
    </SettingsContainer>
  );
};

export default Settings;
