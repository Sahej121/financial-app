import React, { useState, useEffect } from 'react';
import { List, Tag, Typography, Spin } from 'antd';
import { 
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  DollarOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import { useSocket } from '../contexts/SocketContext';

const { Text } = Typography;

const ActivityContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: #1f1f1f;
  border-radius: 8px;
`;

const ActivityItem = styled(List.Item)`
  padding: 12px !important;
  border-bottom: 1px solid #303030 !important;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const getActivityIcon = (type) => {
  const icons = {
    CONSULTATION_SCHEDULED: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    CONSULTATION_COMPLETED: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    DOCUMENT_UPLOADED: <FileOutlined style={{ color: '#faad14' }} />,
    PAYMENT_RECEIVED: <DollarOutlined style={{ color: '#52c41a' }} />,
    CLIENT_ADDED: <UserAddOutlined style={{ color: '#1890ff' }} />
  };
  return icons[type] || <ClockCircleOutlined />;
};

const getActivityColor = (type) => {
  const colors = {
    CONSULTATION_SCHEDULED: 'blue',
    CONSULTATION_COMPLETED: 'green',
    DOCUMENT_UPLOADED: 'gold',
    PAYMENT_RECEIVED: 'green',
    CLIENT_ADDED: 'blue'
  };
  return colors[type] || 'default';
};

const ActivityFeed = ({ userId, userType }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchActivities();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('activity_update');
      }
    };
  }, [socket]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activities?userId=${userId}&userType=${userType}`);
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('activity_update', (newActivity) => {
        setActivities(prev => [newActivity, ...prev]);
      });
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <ActivityContainer>
      <List
        dataSource={activities}
        renderItem={(activity) => (
          <ActivityItem>
            <List.Item.Meta
              avatar={getActivityIcon(activity.type)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#fff' }}>{activity.description}</Text>
                  <Tag color={getActivityColor(activity.type)}>
                    {activity.type.replace(/_/g, ' ')}
                  </Tag>
                </div>
              }
              description={
                <Text type="secondary">
                  {moment(activity.createdAt).fromNow()}
                </Text>
              }
            />
          </ActivityItem>
        )}
      />
    </ActivityContainer>
  );
};

export default ActivityFeed; 