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
  Avatar 
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  VideoCameraOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import ActivityFeed from '../components/ActivityFeed';

const { Content } = Layout;

const DashboardContainer = styled(Content)`
  padding: 24px;
  min-height: 100vh;
  background: #141414;
`;

const StyledCard = styled(Card)`
  background: #1f1f1f;
  border: 1px solid #303030;
  border-radius: 12px;
  
  .ant-card-head {
    border-bottom: 1px solid #303030;
  }
`;

const CalendarCard = styled(StyledCard)`
  .ant-picker-calendar {
    background: transparent;
  }
  
  .ant-picker-cell-selected .ant-picker-calendar-date {
    background: #1890ff;
  }
`;

const StatCard = styled(StyledCard)`
  text-align: center;
  
  .ant-statistic-title {
    color: #8c8c8c;
  }
  
  .ant-statistic-content {
    color: #fff;
  }
`;

const AnalystDashboard = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      // Replace with your API call
      const response = await fetch('/api/analyst/consultations');
      const data = await response.json();
      setConsultations(data.consultations);
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
      'in-progress': 'gold'
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
      render: (text, record) => (
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
                    <p>{moment(consultation.scheduledTime).format('hh:mm A')}</p>
                    <p><strong>{consultation.clientName}</strong></p>
                    <p>{consultation.consultationType}</p>
                  </Timeline.Item>
                ))}
            </Timeline>
          </StyledCard>
        </Col>

        <Col xs={24} lg={8}>
          <StyledCard title="Recent Activities">
            <ActivityFeed 
              userId={currentUser.id} 
              userType="Analyst"
            />
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
            />
          </StyledCard>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default AnalystDashboard; 