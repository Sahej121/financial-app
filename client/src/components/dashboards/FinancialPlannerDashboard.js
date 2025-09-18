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
  Alert
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
  LineChartOutlined
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  
  .ant-card-body {
    color: white;
  }
`;

const FinancialPlannerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [meetingsRes, documentsRes] = await Promise.all([
        api.get('/meetings/professional?role=financial_planner&upcoming=true'),
        api.get('/documents/pending?role=financial_planner')
      ]);
      
      setUpcomingMeetings(meetingsRes.data.meetings || []);
      setPendingDocuments(documentsRes.data.documents || []);
      
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
        professionalRole: 'financial_planner'
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
      title: 'Planning Details',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Tag color="green">{record.planningType?.replace('_', ' ')}</Tag>
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
        <Badge count={documents?.length || 0} color="#52c41a">
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
            <Tag color="green">{record.category?.replace('_', ' ')}</Tag>
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
          Financial Planner Dashboard
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
          Guide clients through their financial planning journey
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
              valueStyle={{ color: '#10b981' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Upcoming Meetings"
              value={statistics.totalMeetings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Pending Documents"
              value={statistics.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={6}>
          <StyledCard>
            <Statistic
              title="Urgent Reviews"
              value={statistics.urgentDocuments}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Urgent Documents Alert */}
      {statistics.urgentDocuments > 0 && (
        <Alert
          message="Urgent Financial Documents Require Review"
          description={`You have ${statistics.urgentDocuments} urgent financial document(s) that need immediate attention for client planning sessions.`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Upcoming Meetings */}
        <Col span={24}>
          <StyledCard 
            title={`Upcoming Financial Planning Sessions (${upcomingMeetings.length})`}
            extra={<LineChartOutlined />}
          >
            <Table
              dataSource={upcomingMeetings}
              columns={meetingColumns}
              pagination={{ pageSize: 10 }}
              rowKey="id"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No upcoming planning sessions scheduled' }}
            />
          </StyledCard>
        </Col>

        {/* Pending Documents */}
        <Col span={24}>
          <StyledCard 
            title={`Financial Document Reviews (${pendingDocuments.length})`}
            extra={<FileTextOutlined />}
          >
            <Table
              dataSource={pendingDocuments}
              columns={documentColumns}
              pagination={{ pageSize: 10 }}
              rowKey="id"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No pending documents for financial review' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Document Review Modal */}
      <Modal
        title="Review Financial Document"
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
              <Tag color="green">{selectedDocument.category?.replace('_', ' ')}</Tag>
              <br />
              <Text strong>Priority: </Text>
              <Tag color={getPriorityColor(selectedDocument.priority)}>
                {selectedDocument.priority?.toUpperCase()}
              </Tag>
              <br />
              {selectedDocument.clientNotes && (
                <>
                  <Text strong>Client Notes: </Text>
                  <Paragraph style={{ marginTop: '4px' }}>{selectedDocument.clientNotes}</Paragraph>
                </>
              )}
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleSubmitReview}
            >
              <Form.Item
                name="status"
                label="Financial Review Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Option value="in_review">In Review</Option>
                  <Option value="approved">Approved for Planning</Option>
                  <Option value="rejected">Insufficient Information</Option>
                  <Option value="requires_changes">Additional Documents Needed</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reviewNotes"
                label="Financial Planning Notes"
                help="Include insights about the client's financial position and recommendations"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Add your financial analysis and recommendations..."
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
    </DashboardContainer>
  );
};

export default FinancialPlannerDashboard;