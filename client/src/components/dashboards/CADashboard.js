import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Badge,
  Spin,
  List,
  Avatar,
  Typography,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Statistic,
  Alert,
  Calendar,
  TimePicker,
  Switch
} from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import api from '../../utils/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DashboardContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const WelcomeCard = styled(StyledCard)`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  
  .ant-card-body {
    color: white;
  }
`;

const CADashboard = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();
  const [statistics, setStatistics] = useState({});
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [scheduleForm] = Form.useForm();
  const [availabilityForm] = Form.useForm();
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [meetingsRes, documentsRes, availabilityRes] = await Promise.all([
        api.get('/meetings/professional?role=ca&upcoming=true'),
        api.get('/documents/pending?role=ca'),
        api.get('/cas/availability').catch(() => ({ data: {} })) // Fallback if not implemented
      ]);
      
      setUpcomingMeetings(meetingsRes.data.meetings || []);
      setPendingDocuments(documentsRes.data.documents || []);
      setAvailability(availabilityRes.data || {});
      
      // Calculate statistics
      const stats = {
        totalMeetings: meetingsRes.data.meetings?.length || 0,
        totalDocuments: documentsRes.data.documents?.length || 0,
        urgentDocuments: documentsRes.data.documents?.filter(doc => doc.priority === 'urgent').length || 0,
        todayMeetings: meetingsRes.data.meetings?.filter(meeting => 
          moment(meeting.startsAt).isSame(moment(), 'day')
        ).length || 0
      };
      setStatistics(stats);
      
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = (meeting) => {
    if (meeting.zoomStartUrl) {
      window.open(meeting.zoomStartUrl, '_blank');
    } else {
      message.warning('Please generate the meeting link first');
    }
  };

  const handleGenerateLink = async (meetingId) => {
    try {
      const response = await api.post(`/meetings/${meetingId}/zoom-link`);
      message.success('Meeting link generated successfully');
      loadDashboardData(); // Refresh data
    } catch (error) {
      message.error('Failed to generate meeting link');
    }
  };

  const handleReviewDocument = (document) => {
    setSelectedDocument(document);
    setReviewModalVisible(true);
    reviewForm.setFieldsValue({
      status: document.status,
      reviewNotes: document.reviewNotes
    });
  };

  const handleAssignDocument = async (documentId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.patch(`/documents/${documentId}/assign`, {
        professionalId: user.id,
        professionalRole: 'ca'
      });
      message.success('Document assigned successfully');
      loadDashboardData();
    } catch (error) {
      message.error('Failed to assign document');
    }
  };

  const handleSubmitReview = async (values) => {
    try {
      await api.patch(`/documents/${selectedDocument.id}/review`, values);
      message.success('Document review updated successfully');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedDocument(null);
      loadDashboardData();
    } catch (error) {
      message.error('Failed to update document review');
    }
  };

  const handleScheduleMeeting = async (values) => {
    try {
      const meetingData = {
        ...values,
        professionalId: JSON.parse(localStorage.getItem('user') || '{}').id,
        professionalRole: 'ca',
        status: 'scheduled'
      };
      
      await api.post('/meetings', meetingData);
      message.success('Meeting scheduled successfully');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
      loadDashboardData();
    } catch (error) {
      message.error('Failed to schedule meeting');
    }
  };

  const handleUpdateAvailability = async (values) => {
    try {
      await api.patch('/cas/availability', values);
      message.success('Availability updated successfully');
      setAvailabilityModalVisible(false);
      availabilityForm.resetFields();
      loadDashboardData();
    } catch (error) {
      message.error('Failed to update availability');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green', 
      completed: 'gray',
      cancelled: 'red',
      submitted: 'orange',
      assigned: 'blue',
      in_review: 'purple',
      approved: 'green',
      rejected: 'red',
      requires_changes: 'volcano'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green'
    };
    return colors[priority] || 'default';
  };

  const meetingColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (client) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{client?.name}</Text>
            <br />
            <Text type="secondary">{client?.email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Meeting Details',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary">{record.planningType?.replace('_', ' ')}</Text>
          <br />
          <Text type="secondary">{moment(record.startsAt).format('MMM DD, YYYY @ hh:mm A')}</Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Documents',
      dataIndex: 'documents',
      key: 'documents',
      render: (documents) => (
        <Badge count={documents?.length || 0} color="#1890ff">
          <FileTextOutlined style={{ fontSize: '16px' }} />
        </Badge>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.zoomStartUrl ? (
            <Button 
              type="primary" 
              icon={<VideoCameraOutlined />}
              onClick={() => handleStartMeeting(record)}
              size="small"
            >
              Start
            </Button>
          ) : (
            <Button 
              type="primary" 
              ghost
              icon={<VideoCameraOutlined />}
              onClick={() => handleGenerateLink(record.id)}
              size="small"
            >
              Generate Link
            </Button>
          )}
        </Space>
      )
    }
  ];

  const documentColumns = [
    {
      title: 'Document',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName, record) => (
        <div>
          <Text strong>{fileName}</Text>
          <br />
          <Space>
            <Tag color="blue">{record.category?.replace('_', ' ')}</Tag>
            <Tag color={getPriorityColor(record.priority)}>{record.priority?.toUpperCase()}</Tag>
          </Space>
        </div>
      )
    },
    {
      title: 'Client',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text>{owner?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{owner?.email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (uploadedAt) => moment(uploadedAt).fromNow()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => window.open(`/api/documents/${record.id}/download`, '_blank')}
            size="small"
          >
            View
          </Button>
          {record.assignedToId ? (
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleReviewDocument(record)}
              size="small"
            >
              Review
            </Button>
          ) : (
            <Button 
              type="primary"
              ghost
              onClick={() => handleAssignDocument(record.id)}
              size="small"
            >
              Assign to Me
            </Button>
          )}
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Welcome Section */}
      <WelcomeCard>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          CA Professional Dashboard
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
          Manage your client consultations and document reviews
        </Paragraph>
      </WelcomeCard>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Today's Meetings"
              value={statistics.todayMeetings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Upcoming Meetings"
              value={statistics.totalMeetings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Pending Documents"
              value={statistics.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Urgent Reviews"
              value={statistics.urgentDocuments}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Urgent Documents Alert */}
      {statistics.urgentDocuments > 0 && (
        <Alert
          message="Urgent Documents Require Attention"
          description={`You have ${statistics.urgentDocuments} document(s) marked as urgent priority requiring immediate review.`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <StyledCard title="Quick Actions">
            <Space size="middle">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setScheduleModalVisible(true)}
                size="large"
              >
                Schedule New Meeting
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setAvailabilityModalVisible(true)}
                size="large"
              >
                Update Availability
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => message.info('Calendar view coming soon!')}
                size="large"
              >
                Calendar View
              </Button>
            </Space>
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Upcoming Meetings */}
        <Col span={24}>
          <StyledCard 
            title={`Upcoming Meetings (${upcomingMeetings.length})`}
            extra={<CalendarOutlined />}
          >
            <Table
              dataSource={upcomingMeetings}
              columns={meetingColumns}
              pagination={{ pageSize: 10 }}
              rowKey="id"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No upcoming meetings scheduled' }}
            />
          </StyledCard>
        </Col>

        {/* Pending Documents */}
        <Col span={24}>
          <StyledCard 
            title={`Pending Document Reviews (${pendingDocuments.length})`}
            extra={<FileTextOutlined />}
          >
            <Table
              dataSource={pendingDocuments}
              columns={documentColumns}
              pagination={{ pageSize: 10 }}
              rowKey="id"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No pending documents for review' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Document Review Modal */}
      <Modal
        title="Review Document"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        {selectedDocument && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Document: </Text>
              <Text>{selectedDocument.fileName}</Text>
              <br />
              <Text strong>Client: </Text>
              <Text>{selectedDocument.owner?.name}</Text>
              <br />
              <Text strong>Category: </Text>
              <Tag color="blue">{selectedDocument.category?.replace('_', ' ')}</Tag>
              <br />
              <Text strong>Priority: </Text>
              <Tag color={getPriorityColor(selectedDocument.priority)}>
                {selectedDocument.priority?.toUpperCase()}
              </Tag>
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleSubmitReview}
            >
              <Form.Item
                name="status"
                label="Review Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Option value="in_review">In Review</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="requires_changes">Requires Changes</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reviewNotes"
                label="Review Notes"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Add your review notes here..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Review
                  </Button>
                  <Button onClick={() => setReviewModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        title="Schedule New Meeting"
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={handleScheduleMeeting}
        >
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: 'Please select a client' }]}
          >
            <Select placeholder="Select client">
              <Option value="1">John Doe</Option>
              <Option value="2">Jane Smith</Option>
              {/* These would be populated from API */}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Meeting Title"
            rules={[{ required: true, message: 'Please enter meeting title' }]}
          >
            <Input placeholder="e.g., Tax Planning Consultation" />
          </Form.Item>

          <Form.Item
            name="planningType"
            label="Consultation Type"
            rules={[{ required: true, message: 'Please select consultation type' }]}
          >
            <Select placeholder="Select consultation type">
              <Option value="business">Business Expansion</Option>
              <Option value="loan">Loan Protection</Option>
              <Option value="investment">Investment Planning</Option>
              <Option value="tax">Tax Planning</Option>
              <Option value="audit">Audit Services</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startsAt"
                label="Start Date & Time"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker.RangePicker 
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <Select placeholder="Select duration">
                  <Option value={30}>30 minutes</Option>
                  <Option value={60}>1 hour</Option>
                  <Option value={90}>1.5 hours</Option>
                  <Option value={120}>2 hours</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Meeting Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Add any additional notes about the meeting..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Schedule Meeting
              </Button>
              <Button onClick={() => setScheduleModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Availability Settings Modal */}
      <Modal
        title="Update Availability Settings"
        open={availabilityModalVisible}
        onCancel={() => setAvailabilityModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={availabilityForm}
          layout="vertical"
          onFinish={handleUpdateAvailability}
          initialValues={availability}
        >
          <Form.Item
            name="status"
            label="Current Status"
            rules={[{ required: true, message: 'Please select your availability status' }]}
          >
            <Select placeholder="Select availability status">
              <Option value="Available Now">Available Now</Option>
              <Option value="Available in 30 mins">Available in 30 mins</Option>
              <Option value="Available in 1 hour">Available in 1 hour</Option>
              <Option value="Available in 2 hours">Available in 2 hours</Option>
              <Option value="Available tomorrow">Available tomorrow</Option>
              <Option value="Busy">Currently Busy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="acceptingNewClients"
            label="Accepting New Clients"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="workingHours"
            label="Working Hours"
          >
            <TimePicker.RangePicker 
              format="HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Availability Notes"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Add any notes about your current availability..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Availability
              </Button>
              <Button onClick={() => setAvailabilityModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardContainer>
  );
};

export default CADashboard;