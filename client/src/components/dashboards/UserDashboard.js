import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Button, 
  Tag, 
  Alert, 
  Spin,
  Progress,
  List,
  Avatar,
  Typography,
  Space,
  Badge,
  message
} from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  LineChartOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Line, Pie, Bar } from '@ant-design/plots';
import styled from 'styled-components';
import moment from 'moment';
import api from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

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

const StatCard = styled(StyledCard)`
  text-align: center;
  
  .ant-statistic-content {
    color: ${props => props.color || '#1890ff'};
  }
`;

const WelcomeCard = styled(StyledCard)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  .ant-card-body {
    color: white;
  }
`;

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [analyticsRes, chartRes, insightsRes, meetingsRes] = await Promise.all([
        api.get('/analytics/summary?period=month'),
        api.get('/analytics/charts?type=activity&period=month'),
        api.get('/analytics/insights'),
        api.get('/meetings/user?upcoming=true&status=scheduled,confirmed')
      ]);
      
      setAnalyticsData(analyticsRes.data.summary);
      setChartData(chartRes.data.chartData);
      setInsights(insightsRes.data);
      setUpcomingMeetings(meetingsRes.data.meetings || []);
      
      if (analyticsRes.data.recentActivity) {
        setRecentDocuments(analyticsRes.data.recentActivity.documents || []);
      }
      
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.zoomJoinUrl) {
      window.open(meeting.zoomJoinUrl, '_blank');
    } else {
      message.warning('Meeting link is not available yet. Please contact your professional.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green', 
      completed: 'gray',
      cancelled: 'red',
      submitted: 'orange',
      approved: 'green',
      rejected: 'red',
      in_review: 'blue'
    };
    return colors[status] || 'default';
  };

  const meetingColumns = [
    {
      title: 'Meeting',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary">{record.planningType?.replace('_', ' ')}</Text>
        </div>
      )
    },
    {
      title: 'Professional',
      dataIndex: 'professional',
      key: 'professional',
      render: (professional) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text>{professional?.name}</Text>
            <br />
            <Tag color="blue">{professional?.role?.toUpperCase()}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Date & Time',
      dataIndex: 'startsAt',
      key: 'startsAt',
      render: (startsAt) => moment(startsAt).format('MMM DD, YYYY @ hh:mm A')
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<VideoCameraOutlined />}
          onClick={() => handleJoinMeeting(record)}
          disabled={!record.zoomJoinUrl || moment(record.startsAt).isBefore(moment())}
          size="small"
        >
          Join
        </Button>
      )
    }
  ];

  // Prepare chart data
  const activityChartData = chartData?.combined?.map(item => ({
    date: moment(item.date).format('MMM DD'),
    documents: item.documents,
    meetings: item.meetings,
    total: item.total
  })) || [];

  const documentStatusData = analyticsData ? Object.entries(analyticsData.documentStats || {}).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count
  })) : [];

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
          Welcome to Your Financial Dashboard
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
          Track your financial planning progress and stay connected with your advisors
        </Paragraph>
      </WelcomeCard>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard color="#52c41a">
            <Statistic
              title="Total Documents"
              value={analyticsData?.totalDocuments || 0}
              prefix={<FileTextOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard color="#1890ff">
            <Statistic
              title="Total Meetings"
              value={analyticsData?.totalMeetings || 0}
              prefix={<CalendarOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard color="#722ed1">
            <Statistic
              title="Completed Sessions"
              value={analyticsData?.completedMeetings || 0}
              prefix={<CheckCircleOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard color="#fa8c16">
            <Statistic
              title="Upcoming Meetings"
              value={analyticsData?.upcomingMeetings || 0}
              prefix={<ClockCircleOutlined />}
            />
          </StatCard>
        </Col>
      </Row>

      {/* Insights and Recommendations */}
      {insights?.insights?.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <StyledCard title="Insights & Recommendations" extra={<LineChartOutlined />}>
              <Row gutter={[16, 16]}>
                {insights.insights.map((insight, index) => (
                  <Col xs={24} lg={12} key={index}>
                    <Alert
                      message={insight.title}
                      description={insight.message}
                      type={insight.type}
                      showIcon
                      style={{ marginBottom: '8px' }}
                    />
                  </Col>
                ))}
              </Row>
              
              {insights.recommendations?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Recommended Actions:</Title>
                  <List
                    size="small"
                    dataSource={insights.recommendations}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Badge status="processing" />}
                          title={item.title}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </StyledCard>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Activity Chart */}
        <Col xs={24} lg={12}>
          <StyledCard title="Recent Activity" extra={<LineChartOutlined />}>
            {activityChartData.length > 0 ? (
              <Line
                data={activityChartData}
                xField="date"
                yField="total"
                seriesField="type"
                height={300}
                smooth
                color={['#1890ff', '#52c41a']}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>No activity data available</div>
              </div>
            )}
          </StyledCard>
        </Col>

        {/* Document Status Distribution */}
        <Col xs={24} lg={12}>
          <StyledCard title="Document Status Overview">
            {documentStatusData.length > 0 ? (
              <Pie
                data={documentStatusData}
                angleField="count"
                colorField="status"
                radius={0.8}
                height={300}
                interactions={[{ type: 'element-active' }]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>No documents uploaded yet</div>
                <Button type="primary" icon={<UploadOutlined />} style={{ marginTop: '8px' }}>
                  Upload Your First Document
                </Button>
              </div>
            )}
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
            {upcomingMeetings.length > 0 ? (
              <Table
                dataSource={upcomingMeetings}
                columns={meetingColumns}
                pagination={false}
                rowKey="id"
                scroll={{ x: 800 }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>No upcoming meetings scheduled</div>
                <Button type="primary" style={{ marginTop: '8px' }}>
                  Schedule a Consultation
                </Button>
              </div>
            )}
          </StyledCard>
        </Col>
      </Row>

      {/* Recent Documents */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <StyledCard title="Recent Documents" extra={<FileTextOutlined />}>
            {recentDocuments.length > 0 ? (
              <List
                dataSource={recentDocuments}
                renderItem={doc => (
                  <List.Item
                    actions={[
                      <Tag color={getStatusColor(doc.status)}>{doc.status.toUpperCase()}</Tag>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={doc.fileName}
                      description={
                        <Space>
                          <Text type="secondary">{doc.category?.replace('_', ' ')}</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">{moment(doc.uploadedAt).fromNow()}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>No documents uploaded yet</div>
              </div>
            )}
          </StyledCard>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default UserDashboard;