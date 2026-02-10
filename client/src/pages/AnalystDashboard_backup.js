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
  message,
  Modal,
  Space,
  Descriptions,
  Popover
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import ActivityFeed from '../components/ActivityFeed';
import ClientSubmissionDetail from '../components/analyst/ClientSubmissionDetail';
import '../styles/dashboard.css';

const { Content } = Layout;

const AnalystDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.user);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  // Modal state
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/meetings/professional', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConsultations(data.meetings.map(m => ({
          id: m.id,
          clientName: m.client?.name || 'Unknown Client',
          scheduledTime: m.startsAt,
          consultationType: m.planningType,
          status: m.status,
          submission: m.submission // Store the submission data
        })));
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      message.error('Failed to load dashboard data. Please check your connection.');
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

  const handleViewProfile = (record) => {
    if (record.submission) {
      setSelectedSubmission(record.submission);
      setProfileModalVisible(true);
    } else {
      message.info('No detailed profile available for this consultation');
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => handleViewProfile(record)}>
          <Avatar icon={<UserOutlined />} />
          <span style={{ textDecoration: 'underline', color: '#1890ff' }}>{text}</span>
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
      title: 'Profile',
      key: 'profile',
      render: (_, record) => (
        <Button
          size="small"
          type="default"
          ghost={true}
          style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
          onClick={() => handleViewProfile(record)}
        >
          View Insight
        </Button>
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analyst Dashboard</h1>
      </div>

      <Row gutter={[24, 24]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card blue" bordered={false}>
            <div className="kpi-icon-wrapper blue">
              <ClockCircleOutlined />
            </div>
            <div className="kpi-label">Today's Consultations</div>
            <div className="kpi-value">
              {consultations.filter(c => moment(c.scheduledTime).isSame(moment(), 'day')).length}
            </div>
            <div className="kpi-subtitle">
              Scheduled for today
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card yellow" bordered={false}>
            <div className="kpi-icon-wrapper yellow">
              <UserOutlined />
            </div>
            <div className="kpi-label">Total Consultations</div>
            <div className="kpi-value">{consultations.length}</div>
            <div className="kpi-subtitle">
              All time record
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card green" bordered={false}>
            <div className="kpi-icon-wrapper green">
              <CheckCircleOutlined />
            </div>
            <div className="kpi-label">Completed</div>
            <div className="kpi-value">
              {consultations.filter(c => c.status === 'completed').length}
            </div>
            <div className="kpi-subtitle">
              Successfully finished
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card blue" bordered={false}>
            <div className="kpi-icon-wrapper blue">
              <DollarCircleOutlined />
            </div>
            <div className="kpi-label">Revenue</div>
            <div className="kpi-value">
              ₹{(consultations.filter(c => c.status === 'completed').length * 499).toLocaleString()}
            </div>
            <div className="kpi-subtitle">
              Total earnings
            </div>
          </Card>
        </Col>

        {/* Calendar and Upcoming Consultations */}
        <Col xs={24} lg={16}>
          <Card className="widget-card" title="Consultation Calendar" bordered={false}>
            <div className="calendar-card-wrapper">
              <Calendar
                dateCellRender={dateCellRender}
                value={selectedDate}
                onChange={setSelectedDate}
                fullscreen={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="widget-card" title="Today's Schedule" bordered={false}>
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
                    <Button size="small" type="link" onClick={() => handleViewProfile(consultation)}>View Details</Button>
                  </Timeline.Item>
                ))}
            </Timeline>
            {consultations.filter(c => moment(c.scheduledTime).isSame(moment(), 'day')).length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
                No consultations scheduled for today
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="widget-card" title="Recent Activities" bordered={false}>
            {currentUser && (
              <ActivityFeed
                userId={currentUser.id}
                userType="Analyst"
              />
            )}
          </Card>
        </Col>

        {/* Consultation Table */}
        <Col span={24}>
          <Card className="widget-card" title="Upcoming Consultations" bordered={false}>
            <Table
              columns={columns}
              dataSource={upcomingConsultations}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ background: 'transparent' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Client Profile Modal */}
      <Modal
        visible={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0, background: '#141414' }}
        closeIcon={<span style={{ color: 'white' }}>x</span>}
      >
        <ClientSubmissionDetail submission={selectedSubmission} />
      </Modal>

      <style jsx>{`
        .calendar-card-wrapper .ant-picker-calendar {
            background: transparent !important;
        }
        .calendar-card-wrapper .ant-picker-calendar-header {
            padding: 12px 0;
        }
        .calendar-card-wrapper .ant-picker-calendar-mode-switch {
            display: none;
        }
        .calendar-card-wrapper .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
            background: #00B0F0 !important;
        }
        .calendar-card-wrapper .ant-picker-content th {
            color: rgba(255,255,255,0.45);
        }
        .calendar-card-wrapper .ant-picker-cell {
            color: white;
        }
        .calendar-card-wrapper .ant-picker-cell-inner:hover {
            background: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default AnalystDashboard;