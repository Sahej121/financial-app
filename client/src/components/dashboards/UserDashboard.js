import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Card, Statistic } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import DocumentUploadModal from '../DocumentUploadModal';
import WealthHealthWidget from './widgets/WealthHealthWidget';
import GoalProgressWidget from './widgets/GoalProgressWidget';
import '../../styles/dashboard.css';


const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [data, setData] = useState({
    upcomingMeetings: [],
    recentDocuments: [],
    stats: {
      totalDocuments: 0,
      totalMeetings: 0,
      pendingTasks: 0
    },
    health: { score: 50, metrics: [] },
    goals: [],
    budgetAllocation: [],
    spendingTrends: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data with individual error handling
      const [analyticsRes, meetingsRes, healthRes] = await Promise.allSettled([
        api.get('/analytics/summary?period=month'),
        api.get('/meetings/user?upcoming=true&status=scheduled,confirmed'),
        api.get('/analytics/financial-health')
      ]);

      const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data.summary || {} : {};
      const meetings = meetingsRes.status === 'fulfilled' ? meetingsRes.value.data.meetings || [] : [];
      const recentDocs = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data.recentActivity?.documents || [] : [];
      const healthData = healthRes.status === 'fulfilled' ? healthRes.value.data || {} : {};

      setData({
        upcomingMeetings: meetings,
        recentDocuments: recentDocs,
        stats: {
          totalDocuments: analytics.totalDocuments || 0,
          totalMeetings: analytics.totalMeetings || 0,
          pendingTasks: analytics.pendingTasks || 0
        },
        health: healthData.health || { score: 50, metrics: [] },
        goals: healthData.goals || [],
        budgetAllocation: healthData.budgetAllocation || [],
        spendingTrends: healthData.spendingTrends || []
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Charts Config ---
  const spendingConfig = {
    data: data.spendingTrends || [],
    xField: 'month',
    yField: 'value',
    color: '#3b82f6',
    smooth: true,
    height: 280,
    areaStyle: {
      fill: 'l(270) 0:#3b82f680 1:#3b82f610',
    },
    line: {
      size: 3,
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: '#3b82f6',
        stroke: '#1e293b',
        lineWidth: 2,
      },
    },
    xAxis: {
      grid: null,
      line: { style: { stroke: '#334155' } },
      label: { style: { fill: '#64748b', fontSize: 12 } }
    },
    yAxis: {
      grid: { line: { style: { stroke: '#334155', lineDash: [4, 4] } } },
      label: { style: { fill: '#64748b', fontSize: 12 } }
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return null;
        return `
          <div style="padding: 12px; background: rgba(30, 41, 59, 0.95); border: 1px solid #334155; border-radius: 8px;">
            <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">${title}</div>
            <div style="color: #fff; font-size: 16px; font-weight: 600;">₹${items[0]?.value?.toLocaleString()}</div>
          </div>
        `;
      }
    },
  };

  const categoryConfig = {
    data: data.budgetAllocation || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    statistic: {
      title: {
        style: { color: '#64748b', fontSize: '14px', fontWeight: 500 },
        content: 'Total',
      },
      content: {
        style: { color: '#fff', fontSize: '20px', fontWeight: 700 },
        customHtml: (container, view, datum, data) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          return `₹${(total / 1000).toFixed(0)}K`;
        },
      },
    },
    legend: {
      position: 'bottom',
      itemHeight: 24,
      itemName: {
        style: { fill: '#cbd5e1', fontSize: 13 }
      }
    },
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{percentage}',
      style: {
        fill: '#fff',
        fontSize: 12,
        fontWeight: 600,
      },
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return null;
        return `
          <div style="padding: 12px; background: rgba(30, 41, 59, 0.95); border: 1px solid #334155; border-radius: 8px;">
            <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">${items[0]?.data?.type}</div>
            <div style="color: #fff; font-size: 16px; font-weight: 600;">₹${items[0]?.value?.toLocaleString()}</div>
          </div>
        `;
      }
    },
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
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Financial Overview</h1>
        <Space>
          <Button
            className="dashboard-action-btn"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            Upload Document
          </Button>
          <Button
            className="dashboard-action-btn"
            icon={<ReloadOutlined />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card className="kpi-card blue" bordered={false}>
            <div className="kpi-icon-wrapper blue">
              <FileTextOutlined />
            </div>
            <div className="kpi-label">Total Documents</div>
            <div className="kpi-value">{data.stats.totalDocuments}</div>
            <div className="kpi-subtitle">
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              Safe & Secure
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="kpi-card yellow" bordered={false}>
            <div className="kpi-icon-wrapper yellow">
              <CalendarOutlined />
            </div>
            <div className="kpi-label">Upcoming Meetings</div>
            <div className="kpi-value">{data.stats.totalMeetings}</div>
            <div className="kpi-subtitle">
              <CheckCircleOutlined style={{ color: '#F2C811' }} />
              Scheduled
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="kpi-card green" bordered={false}>
            <div className="kpi-icon-wrapper green">
              <CheckCircleOutlined />
            </div>
            <div className="kpi-label">Pending Tasks</div>
            <div className="kpi-value">{data.stats.pendingTasks}</div>
            <div className="kpi-subtitle">
              {data.stats.pendingTasks > 0 ? (
                <span style={{ color: '#f59e0b' }}>Requires Action</span>
              ) : (
                <span style={{ color: '#10b981' }}>All Clear</span>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Wealth & Goals Widgets */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <WealthHealthWidget score={data.health?.score} metrics={data.health?.metrics} />
        </Col>
        <Col xs={24} lg={12}>
          <GoalProgressWidget goals={data.goals} />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <Card className="widget-card" title="Spending Trends" bordered={false}>
            <Line {...spendingConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="widget-card" title="Budget Allocation" bordered={false}>
            <Pie {...categoryConfig} height={280} />
          </Card>
        </Col>
      </Row>

      {/* Upcoming Meetings Table */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="widget-card" title="Upcoming Meetings" bordered={false}>
            <Table
              dataSource={data.upcomingMeetings}
              columns={meetingColumns}
              pagination={false}
              size="middle"
              rowKey="id"
              locale={{
                emptyText: (
                  <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <div className="empty-state-text">No upcoming meetings scheduled</div>
                  </div>
                )
              }}
            />
          </Card>
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
    </div>
  );
};

export default UserDashboard;