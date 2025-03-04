import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Descriptions, Spin } from 'antd';

const Profile = () => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <Card title="Profile Information">
        <Descriptions bordered>
          <Descriptions.Item label="Name" span={3}>
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={3}>
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="Role" span={3}>
            {user.role}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile; 