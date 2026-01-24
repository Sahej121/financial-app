import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import DocumentUploadModal from '../DocumentUploadModal';
import {
  DashboardContainer,
  GridContainer,
  KPICard,
  ChartContainer,
  TableContainer,
  Header,
  ActionButton
} from './PowerBIComponents';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [data, setData] = useState({
    upcomingMeetings: [],
    recentDocuments: [],
    stats: {
      totalDocuments: 0,
      totalMeetings: 0,
      spending: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, meetingsRes] = await Promise.all([
        api.get('/analytics/summary?period=month'),
        api.get('/meetings/user?upcoming=true&status=scheduled,confirmed')
      ]);

      const analytics = analyticsRes.data.summary || {};
      const meetings = meetingsRes.data.meetings || [];
      const recentDocs = analyticsRes.data.recentActivity?.documents || [];

      setData({
        upcomingMeetings: meetings,
        recentDocuments: recentDocs,
        stats: {
          totalDocuments: analytics.totalDocuments || 0,
          totalMeetings: analytics.totalMeetings || 0,
          pendingTasks: analytics.pendingTasks || 2 // Mock if missing
        }
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Charts Config ---
  const spendingConfig = {
    data: [
      { month: 'Jan', value: 4500 },
      { month: 'Feb', value: 5200 },
      { month: 'Mar', value: 4800 },
      { month: 'Apr', value: 6100 },
      { month: 'May', value: 5500 },
    ],
    xField: 'month',
    yField: 'value',
    color: '#00B0F0',
    smooth: true,
    height: 250,
    xAxis: { grid: null, line: null },
    yAxis: { grid: { line: { style: { stroke: '#333' } } } },
  };

  const categoryConfig = {
    data: [
      { type: 'Investment', value: 40 },
      { type: 'Needs', value: 30 },
      { type: 'Wants', value: 20 },
      { type: 'Savings', value: 10 },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    color: ['#107C10', '#00B0F0', '#F2C811', '#D13438'],
    legend: { position: 'bottom', itemHeight: 20 }
  };

  const meetingColumns = [
    {
      title: 'Meeting',
      dataIndex: 'title',
      render: (title) => <span style={{ fontWeight: 600 }}>{title}</span>
    },
    {
      title: 'Professional',
      dataIndex: 'professional',
      render: (prof) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00B0F0' }} />
          <span>{prof?.name}</span>
        </Space>
      )
    },
    {
      title: 'Time',
      dataIndex: 'startsAt',
      render: (time) => moment(time).format('MMM DD, HH:mm')
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<VideoCameraOutlined />}
          onClick={() => window.open(record.zoomJoinUrl || '#', '_blank')}
          style={{ background: '#00B0F0' }}
          disabled={!record.zoomJoinUrl}
        >
          Join
        </Button>
      )
    }
  ];

  return (
    <DashboardContainer>
      <Header>
        <h1>My Financial Overview</h1>
        <div className="actions">
          <ActionButton onClick={() => setUploadModalVisible(true)}>
            <UploadOutlined /> Upload Document
          </ActionButton>
          <ActionButton onClick={loadDashboardData}><ReloadOutlined /> Refresh</ActionButton>
        </div>
      </Header>

      <GridContainer>
        <Col span={8}>
          <KPICard title="Total Documents" trend={1} color="#00B0F0">
            <div className="kpi-value">{data.stats.totalDocuments}</div>
            <div className="kpi-trend">Safe & Secure</div>
          </KPICard>
        </Col>
        <Col span={8}>
          <KPICard title="Upcoming Meetings" trend={0} color="#F2C811">
            <div className="kpi-value">{data.stats.totalMeetings}</div>
            <div className="kpi-trend">Scheduled</div>
          </KPICard>
        </Col>
        <Col span={8}>
          <KPICard title="Pending Tasks" trend={-1} color="#D13438">
            <div className="kpi-value">{data.stats.pendingTasks}</div>
            <div className="kpi-trend">Requires Action</div>
          </KPICard>
        </Col>
      </GridContainer>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <ChartContainer title="Spending Trends">
            <Line {...spendingConfig} />
          </ChartContainer>
        </Col>
        <Col span={8}>
          <ChartContainer title="Budget Allocation">
            <Pie {...categoryConfig} height={250} />
          </ChartContainer>
        </Col>

        <Col span={24}>
          <TableContainer title="Upcoming Meetings">
            <Table
              dataSource={data.upcomingMeetings}
              columns={meetingColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </TableContainer>
        </Col>
      </Row>

      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={() => {
          loadDashboardData();
          message.success('Document uploaded successfully');
        }}
      />
    </DashboardContainer>
  );
};

export default UserDashboard;