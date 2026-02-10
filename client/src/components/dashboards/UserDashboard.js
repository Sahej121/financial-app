import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Card, Statistic, Typography } from 'antd';
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

const { Text, Paragraph } = Typography;


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
      line: { style: { stroke: 'var(--border-primary)' } },
      label: { style: { fill: 'var(--text-secondary)', fontSize: 12 } }
    },
    yAxis: {
      grid: { line: { style: { stroke: 'var(--border-primary)', lineDash: [4, 4] } } },
      label: { style: { fill: 'var(--text-secondary)', fontSize: 12 } }
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
        style: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 },
        content: 'Total',
      },
      content: {
        style: { color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 },
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
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)' }} />
          <span style={{ color: 'var(--text-primary)' }}>{prof?.name}</span>
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
          style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
          disabled={!record.zoomJoinUrl}
        >
          Join
        </Button>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Step 1: The Pulse (Now) */}
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 className="dashboard-title" style={{ fontSize: '2.5rem', marginBottom: 8 }}>Your Financial Pulse</h1>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Everything looks <b style={{ color: 'var(--success-color)' }}>Stable</b> today. You have <span style={{ color: 'var(--warning-color)' }}>{data.stats.pendingTasks}</span> items requiring your attention.
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            style={{ height: 50, padding: '0 30px' }}
          >
            Magic Upload
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

      {/* Primary Narrative Metric: The MOAT Score */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card
            className="widget-card"
            bordered={false}
          >
            <Row gutter={48} align="middle">
              <Col xs={24} md={10}>
                <div style={{ height: '100%', paddingRight: 24, borderRight: '1px solid var(--border-secondary)' }}>
                  <WealthHealthWidget score={data.health?.score} metrics={data.health?.metrics} />
                </div>
              </Col>
              <Col xs={24} md={14}>
                <div style={{ padding: '0 20px' }}>
                  <Text strong style={{ color: 'var(--text-primary)', fontSize: '18px', display: 'block', marginBottom: 12 }}>Current Logic Trace</Text>
                  <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8' }}>
                    Your MOAT score is supported by a <b style={{ color: 'var(--success-color)' }}>healthy savings-to-debt ratio</b>.
                    However, the AI detected <b style={{ color: 'var(--warning-color)' }}>3 unlinked bank statements</b> from the last quarter which could provide a higher confidence rating.
                    Scan these to unlock "Platinum Readiness" status.
                  </Paragraph>
                  <Space size="large" style={{ marginTop: 20 }}>
                    <Statistic title={<span style={{ color: 'var(--text-secondary)' }}>Liquidity</span>} value="6.2 Mo" valueStyle={{ color: 'var(--primary-color)' }} />
                    <Statistic title={<span style={{ color: 'var(--text-secondary)' }}>Debt Load</span>} value="12%" valueStyle={{ color: 'var(--success-color)' }} />
                    <Statistic title={<span style={{ color: 'var(--text-secondary)' }}>Tax Efficiency</span>} value="High" valueStyle={{ color: '#3b82f6' }} />
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Step 3: The Horizon (Future) */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <GoalProgressWidget goals={data.goals} />
        </Col>
      </Row>

      {/* Step 2: The Signal (Why) */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <Card
            className="widget-card"
            title={<Space><FileTextOutlined /> <span>Spending Trends (The Signal)</span></Space>}
            bordered={false}
          >
            <Line {...spendingConfig} />
            <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid var(--border-primary)' }}>
              <Text style={{ color: 'var(--primary-color)', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>AI Narrative Translation</Text>
              <Text style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                Your savings rate is currently <b style={{ color: 'var(--success-color)' }}>12% above</b> the historical average for your income bracket.
                This creates a "surplus signal" that can be redirected to your <b style={{ color: 'var(--primary-color)' }}>Dream Home</b> goal to reduce the time-to-arrival by 4 months.
              </Text>
            </div>
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