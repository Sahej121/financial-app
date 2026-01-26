import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Pie, Area, Column } from '@ant-design/plots';
import moment from 'moment';
import api from '../../utils/api';
import ClientSnapshot from '../analyst/ClientSnapshot';
import DocumentInsightsPanel from '../analyst/DocumentInsightsPanel';
import { RobotOutlined } from '@ant-design/icons';
import {
  DashboardContainer,
  GridContainer,
  KPICard,
  ChartContainer,
  TableContainer,
  Header,
  ActionButton
} from './PowerBIComponents';

const { Option } = Select;
const { TextArea } = Input;

const FinancialPlannerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    meetings: [],
    documents: [],
    stats: {
      aum: 12500000,
      activeClients: 0,
      meetingsToday: 0,
      satisfaction: 4.9
    },
    aiInsights: []
  });

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedMeetingInsights, setSelectedMeetingInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, documentsRes, statsRes] = await Promise.all([
        api.get('/meetings/professional?role=financial_planner&upcoming=true'),
        api.get('/documents/pending?role=financial_planner'),
        api.get('/financial-planners/stats').catch(() => ({ data: {} })) // Fallback if endpoint not ready
      ]);

      setData({
        meetings: meetingsRes.data.meetings || [],
        documents: documentsRes.data.documents || [],
        stats: {
          ...statsRes.data,
          meetingsToday: meetingsRes.data.meetings?.filter(m => moment(m.startsAt).isSame(moment(), 'day')).length || 0,
          activeClients: new Set(meetingsRes.data.meetings?.map(m => m.client?.id)).size || 0
        }
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async (meeting) => {
    try {
      setAiLoading(true);
      setAiModalVisible(true);
      const res = await api.get(`/documents/submission/${meeting.submissionId}/snapshot`);
      setSelectedMeetingInsights(res.data.insights || []);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      message.error('Failed to load AI intelligence for this client');
    } finally {
      setAiLoading(false);
    }
  };

  // --- Charts Config ---
  const aumConfig = {
    data: data.stats.aumHistory || [],
    xField: 'month',
    yField: 'value',
    smooth: true,
    areaStyle: { fill: 'l(270) 0:#1F1F1F 0.5:#00B0F0 1:#00B0F0' },
    color: '#00B0F0',
    xAxis: { grid: null, line: null },
    yAxis: { grid: { line: { style: { stroke: '#333' } } } },
  };

  const portfolioConfig = {
    data: data.stats.portfolioAllocation || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: { type: 'outer', content: '{name} {percentage}' },
    interactions: [{ type: 'element-active' }],
    color: ['#00B0F0', '#F2C811', '#107C10', '#D13438'],
    legend: { position: 'bottom', itemHeight: 20 } // simplified legend config
  };

  const acquisitionConfig = {
    data: data.stats.clientAcquisition || [],
    xField: 'month',
    yField: 'new',
    columnWidthRatio: 0.6,
    color: '#F2C811',
    xAxis: { grid: null },
    yAxis: { grid: { line: { style: { stroke: '#333' } } } }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download document');
    }
  };

  // --- Table Columns ---
  const meetingColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
      render: (client) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00B0F0' }} />
          <span style={{ fontWeight: 600 }}>{client?.name}</span>
        </Space>
      )
    },
    {
      title: 'Goal',
      dataIndex: 'engagementPurpose',
      render: (purpose) => {
        const labels = {
          tax_filing: 'Tax Filing',
          loan_expansion: 'Loan/Expansion',
          compliance_cleanup: 'Compliance',
          advisory: 'Advisory'
        };
        return <Tag color="gold">{labels[purpose] || 'Review'}</Tag>;
      }
    },
    {
      title: 'Urgency',
      dataIndex: 'timeSensitivity',
      render: (urgency) => (
        <Tag color={urgency === 'deadline_driven' ? 'red' : 'green'}>
          {urgency === 'deadline_driven' ? 'URGENT' : 'STANDARD'}
        </Tag>
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
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<VideoCameraOutlined />}
            onClick={() => window.open(record.zoomStartUrl || '#', '_blank')}
            style={{ background: '#00B0F0' }}
          >
            Join
          </Button>
          <Button
            size="small"
            icon={<RobotOutlined />}
            onClick={() => loadAIInsights(record)}
            style={{ background: '#52c41a', color: 'white', border: 'none' }}
          >
            AI Prep
          </Button>
        </Space>
      )
    }
  ];

  const documentColumns = [
    {
      title: 'Document',
      dataIndex: 'fileName',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
    },
    {
      title: 'Client',
      dataIndex: 'owner',
      render: (owner) => owner?.name
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleDownload(record.id, record.fileName)}
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setSelectedDocument(record); setReviewModalVisible(true); }}
          />
        </Space>
      )
    }
  ];

  return (
    <DashboardContainer>
      <Header>
        <h1>Analyst Overview</h1>
        <div className="actions">
          <ActionButton onClick={loadDashboardData}><ReloadOutlined /> Refresh Data</ActionButton>
          <ActionButton onClick={() => message.info('Exporting report...')}>Export Report</ActionButton>
        </div>
      </Header>

      <GridContainer>
        {/* KPIs */}
        <Col span={6}>
          <KPICard title="Assets Under Management (Est.)" trend={1} color="#00B0F0">
            <div className="kpi-value">₹{(data.stats.aum / 10000000).toFixed(2)} Cr</div>
            <div className="kpi-trend">▲ 12.5% vs last month</div>
          </KPICard>
        </Col>
        <Col span={6}>
          <KPICard title="Active Clients" trend={1} color="#F2C811">
            <div className="kpi-value">{data.stats.activeClients}</div>
            <div className="kpi-trend">▲ 4 new this month</div>
          </KPICard>
        </Col>
        <Col span={6}>
          <KPICard title="Meetings Today" trend={0} color="#107C10">
            <div className="kpi-value">{data.stats.meetingsToday}</div>
            <div className="kpi-trend">8 scheduled for week</div>
          </KPICard>
        </Col>
        <Col span={6}>
          <KPICard title="Client Satisfaction" trend={1} color="#D13438">
            <div className="kpi-value">{data.stats.satisfaction}/5.0</div>
            <div className="kpi-trend">Based on 24 reviews</div>
          </KPICard>
        </Col>
      </GridContainer>

      <Row gutter={[16, 16]}>
        {/* Charts Row */}
        <Col span={16}>
          <ChartContainer title="Portfolio Growth (AUM)">
            <Area {...aumConfig} height={300} />
          </ChartContainer>
        </Col>
        <Col span={8}>
          <ChartContainer title="Asset Allocation">
            <Pie {...portfolioConfig} height={300} />
          </ChartContainer>
        </Col>

        {/* Second Row */}
        <Col span={8}>
          <ChartContainer title="New Client Acquisition">
            <Column {...acquisitionConfig} height={300} />
          </ChartContainer>
        </Col>
        <Col span={8}>
          <TableContainer title="Upcoming Meetings">
            <Table
              dataSource={data.meetings.slice(0, 5)}
              columns={meetingColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </TableContainer>
        </Col>
        <Col span={8}>
          <TableContainer title="Pending Document Reviews">
            <Table
              dataSource={data.documents.slice(0, 5)}
              columns={documentColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </TableContainer>
        </Col>
      </Row>

      <Modal
        title="Review Document"
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await api.patch(`/documents/${selectedDocument.id}/review`, values);
              message.success('Review submitted');
              setReviewModalVisible(false);
              loadDashboardData();
            } catch (e) { message.error('Failed to submit review'); }
          }}
        >
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="approved">Approve</Option>
              <Option value="rejected">Reject</Option>
              <Option value="requires_changes">Request Changes</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reviewNotes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Submit Review</Button>
        </Form>
      </Modal>

      <Modal
        title="AI Financial Intelligence - Call Prep"
        visible={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={null}
        width={1000}
        bodyStyle={{ background: '#000', padding: '24px' }}
      >
        <ClientSnapshot insights={selectedMeetingInsights} loading={aiLoading} />
        <div style={{ marginTop: '24px' }}>
          <DocumentInsightsPanel
            documents={selectedMeetingInsights?.map(i => i.document) || []}
            insights={selectedMeetingInsights || []}
          />
        </div>
      </Modal>

    </DashboardContainer>
  );
};

export default FinancialPlannerDashboard;