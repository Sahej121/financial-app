import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Calendar,
  Badge,
  Statistic,
  Table,
  Tag,
  Button,
  Timeline,
  Avatar,
  message
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import ActivityFeed from '../components/ActivityFeed';

const { Content } = Layout;

const DashboardContainer = styled(Content)`
  padding: 40px;
  min-height: 100vh;
  background: #000;
  font-family: 'Inter', sans-serif;
`;

const StyledCard = styled(Card)`
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  
  .ant-card-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 24px 24px 0 24px;
    
    .ant-card-head-title {
        color: white;
        font-weight: 800;
        font-size: 18px;
        letter-spacing: -0.5px;
    }
  }

  .ant-card-body {
      padding: 24px;
  }
`;

const CalendarCard = styled(StyledCard)`
  .ant-picker-calendar {
    background: transparent;
  }
  
  .ant-picker-cell-selected .ant-picker-calendar-date {
    background: white;
    color: black;
  }
  
  .ant-picker-calendar-date-value {
      color: rgba(255, 255, 255, 0.8);
  }
`;

const StatCard = styled(StyledCard)`
  text-align: center;
  
  .ant-statistic-title {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .ant-statistic-content {
    color: #fff;
    font-weight: 800;
    font-size: 32px;
    letter-spacing: -1px;
  }
`;

const AnalystDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.user);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/analyst/consultations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConsultations(data.meetings.map(m => ({
          id: m.id,
          clientName: m.client.name,
          scheduledTime: m.startsAt,
          consultationType: m.planningType,
          status: m.status
        })));
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'red',
      'in_progress': 'gold',
      'confirmed': 'cyan'
    };
    return colors[status] || 'default';
  };

  const upcomingConsultations = consultations.filter(
    c => moment(c.scheduledTime).isAfter(moment())
  );

  const dateCellRender = (value) => {
    const dateConsultations = consultations.filter(
      c => moment(c.scheduledTime).isSame(value, 'day')
    );

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dateConsultations.map(consultation => (
          <li key={consultation.id}>
            <Badge
              status={consultation.status === 'completed' ? 'success' : 'processing'}
              text={consultation.clientName}
            />
          </li>
        ))}
      </ul>
    );
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar icon={<UserOutlined />} />
          {text}
        </div>
      )
    },
    {
      title: 'Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: time => moment(time).format('DD MMM YYYY, hh:mm A')
    },
    {
      title: 'Type',
      dataIndex: 'consultationType',
      key: 'consultationType'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<VideoCameraOutlined />}
          disabled={!moment(record.scheduledTime).isSame(moment(), 'day')}
          onClick={() => window.location.href = `/consultation/${record.id}`}
        >
          Join
        </Button>
      )
    }
  ];

  return (
    <DashboardContainer>
      <Row gutter={[24, 24]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard>
            <Statistic
              title="Today's Consultations"
              value={consultations.filter(c =>
                moment(c.scheduledTime).isSame(moment(), 'day')
              ).length}
              prefix={<ClockCircleOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard>
            <Statistic
              title="Total Consultations"
              value={consultations.length}
              prefix={<UserOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard>
            <Statistic
              title="Completed"
              value={consultations.filter(c => c.status === 'completed').length}
              prefix={<CheckCircleOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard>
            <Statistic
              title="Revenue"
              value={consultations.filter(c => c.status === 'completed').length * 499}
              prefix={<DollarCircleOutlined />}
              suffix="INR"
            />
          </StatCard>
        </Col>

        {/* Calendar and Upcoming Consultations */}
        <Col xs={24} lg={16}>
          <CalendarCard title="Consultation Calendar">
            <Calendar
              dateCellRender={dateCellRender}
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </CalendarCard>
        </Col>

        <Col xs={24} lg={8}>
          <StyledCard title="Today's Schedule">
            <Timeline>
              {consultations
                .filter(c => moment(c.scheduledTime).isSame(moment(), 'day'))
                .sort((a, b) => moment(a.scheduledTime).diff(moment(b.scheduledTime)))
                .map(consultation => (
                  <Timeline.Item
                    key={consultation.id}
                    color={getStatusColor(consultation.status)}
                  >
                    <p style={{ color: '#fff' }}>{moment(consultation.scheduledTime).format('hh:mm A')}</p>
                    <p style={{ color: '#fff' }}><strong>{consultation.clientName}</strong></p>
                    <p style={{ color: '#8c8c8c' }}>{consultation.consultationType}</p>
                  </Timeline.Item>
                ))}
            </Timeline>
          </StyledCard>
        </Col>

        <Col xs={24} lg={8}>
          <StyledCard title="Recent Activities">
            {currentUser && (
              <ActivityFeed
                userId={currentUser.id}
                userType="Analyst"
              />
            )}
          </StyledCard>
        </Col>

        {/* Consultation Table */}
        <Col span={24}>
          <StyledCard title="Upcoming Consultations">
            <Table
              columns={columns}
              dataSource={upcomingConsultations}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ background: 'transparent' }}
            />
          </StyledCard>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default AnalystDashboard;