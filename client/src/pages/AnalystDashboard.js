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
  Popover,
  Form
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  // Modal state
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Outcome Logging State
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Report Writing State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    fetchConsultations();
    fetchStats();
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
          client: m.client,
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/financial-planners/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogOutcome = (record) => {
    setSelectedConsultation(record);
    setOutcomeModalVisible(true);
  };

  // This would be connected to a form submit handler in the modal
  const submitOutcome = async (values) => {
    try {
      const response = await fetch('/api/financial-planners/outcomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          clientId: selectedConsultation.client?.id,
          meetingId: selectedConsultation.id,
          adviceType: selectedConsultation.consultationType,
          ...values
        })
      });

      if (response.ok) {
        message.success('Outcome logged successfully! Trust Score updating...');
        setOutcomeModalVisible(false);
        fetchStats(); // Refresh scores
      } else {
        message.error('Failed to log outcome');
      }
    } catch (error) {
      message.error('Error submitting outcome');
    }
  };

  const handleWriteReport = (record) => {
    setSelectedConsultation(record);
    setReportContent(record.reportContent || '');
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    try {
      const response = await fetch(`/api/meetings/${selectedConsultation.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: selectedConsultation.status, // Keep existing status
          reportContent: reportContent
        })
      });

      if (response.ok) {
        message.success('Report saved successfully!');
        setReportModalVisible(false);
        fetchConsultations(); // Refresh to show updated data if needed
      } else {
        message.error('Failed to save report');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      message.error('Error saving report');
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
              text={<span style={{ color: 'var(--text-secondary)' }}>{consultation.clientName}</span>}
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
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ textDecoration: 'underline', color: 'var(--primary-color)' }}>{text}</span>
        </div>
      )
    },
    {
      title: 'Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: time => <span style={{ color: 'var(--text-primary)' }}>{moment(time).format('DD MMM YYYY, hh:mm A')}</span>
    },
    {
      title: 'Type',
      dataIndex: 'consultationType',
      key: 'consultationType',
      render: type => <span style={{ color: 'var(--text-secondary)' }}>{type}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getStatusColor(status)}>
          {status ? status.toUpperCase() : 'UNKNOWN'}
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
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
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
        <Space>
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            disabled={!moment(record.scheduledTime).isSame(moment(), 'day')}
            onClick={() => window.location.href = `/consultation/${record.id}`}
          >
            Join
          </Button>
          {record.status === 'completed' && (
            <>
              <Button
                size="small"
                style={{ borderColor: 'var(--success-color)', color: 'var(--success-color)', background: 'transparent' }}
                onClick={() => handleLogOutcome(record)}
              >
                Log Outcome
              </Button>
              <Button
                size="small"
                style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }}
                onClick={() => handleWriteReport(record)}
              >
                {record.reportContent ? 'Edit Report' : 'Write Report'}
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analyst Dashboard</h1>
        {stats?.reputation && (
          <Tag color="gold" style={{ fontSize: '14px', padding: '5px 10px', marginLeft: 15 }}>
            <SafetyCertificateOutlined /> Trust Score: {stats.reputation.trustScore}
          </Tag>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* NEW: Reputation & Trust Score Card */}
        <Col span={24}>
          <Card className="widget-card" title="Reputation & Impact" bordered={false}>
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Trust Score"
                  value={stats?.reputation?.trustScore || 50}
                  precision={1}
                  valueStyle={{ color: 'var(--warning-color)' }}
                  prefix={<SafetyCertificateOutlined />}
                  suffix="/ 100"
                />
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: 5 }}>
                  Based on competence, outcomes & speed
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Competence"
                  value={stats?.reputation?.competenceScore || 0}
                  precision={0}
                  suffix="%"
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Client Outcomes"
                  value={stats?.reputation?.outcomeScore || 0}
                  precision={0}
                  valueStyle={{ color: 'var(--success-color)' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Completed Cases"
                  value={stats?.reputation?.totalCompletedCases || 0}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

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
                    <p style={{ color: 'var(--text-primary)' }}>{moment(consultation.scheduledTime).format('hh:mm A')}</p>
                    <p style={{ color: 'var(--text-primary)' }}><strong>{consultation.clientName}</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>{consultation.consultationType}</p>
                    <Button size="small" type="link" onClick={() => handleViewProfile(consultation)} style={{ paddingLeft: 0 }}>View Details</Button>
                  </Timeline.Item>
                ))}
            </Timeline>
            {consultations.filter(c => moment(c.scheduledTime).isSame(moment(), 'day')).length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
        bodyStyle={{ padding: 0, background: 'var(--bg-card)' }}
        closeIcon={<span style={{ color: 'var(--text-primary)' }}>x</span>}
      >
        <ClientSubmissionDetail submission={selectedSubmission} />
      </Modal>

      {/* Outcome Logging Modal (Simple Implementation) */}
      <Modal
        title="Log Outcome & Impact"
        visible={outcomeModalVisible}
        onCancel={() => setOutcomeModalVisible(false)}
        onOk={() => document.getElementById('outcomeForm').requestSubmit()}
        okText="Submit & Close Loop"
      >
        <form id="outcomeForm" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          submitOutcome({
            outcomeScore: formData.get('outcomeScore'),
            financialImpact: formData.get('financialImpact'),
            adviceSummary: formData.get('adviceSummary')
          });
        }}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, color: 'var(--text-primary)' }}>Outcome Score (1-10)</label>
            <input name="outcomeScore" type="number" min="1" max="10" defaultValue="8" style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} required />
            <small style={{ color: 'var(--text-secondary)' }}>How effective was your advice?</small>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, color: 'var(--text-primary)' }}>Financial Impact (₹)</label>
            <input name="financialImpact" type="number" step="0.01" placeholder="e.g. 50000" style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
            <small style={{ color: 'var(--text-secondary)' }}>Estimated savings or value generated</small>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, color: 'var(--text-primary)' }}>Advice Summary</label>
            <textarea name="adviceSummary" rows="3" style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} required placeholder="Briefly describe the key recommendation..."></textarea>
          </div>
        </form>
      </Modal>

      {/* Report Writing Modal */}
      <Modal
        title="Analyst Report"
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onOk={submitReport}
        okText="Save Report"
        width={800}
        bodyStyle={{ background: 'var(--bg-card)' }}
      >
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, color: 'var(--text-primary)' }}>Executive Summary & Key Recommendations</label>
          <textarea
            rows="10"
            style={{
              width: '100%',
              padding: 12,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--card-radius)',
              resize: 'vertical'
            }}
            placeholder="Enter detailed report content here..."
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
          ></textarea>
          <small style={{ color: 'var(--text-secondary)' }}>This report will be visible to the client.</small>
        </div>
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
            background: var(--primary-color) !important;
        }
        .calendar-card-wrapper .ant-picker-content th {
            color: var(--text-secondary);
        }
        .calendar-card-wrapper .ant-picker-cell {
            color: var(--text-primary);
        }
        .calendar-card-wrapper .ant-picker-cell-inner:hover {
            background: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default AnalystDashboard;