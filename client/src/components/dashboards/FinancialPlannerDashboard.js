import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input, Tabs } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined, RobotOutlined, FileTextOutlined } from '@ant-design/icons';
import { Pie, Area, Column } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import ClientSnapshot from '../analyst/ClientSnapshot';
import DocumentInsightsPanel from '../analyst/DocumentInsightsPanel';
import BriefingPanel from '../analyst/BriefingPanel';
import ClientSubmissionReport from '../analyst/ClientSubmissionReport';
import DocumentPreviewModal from '../analyst/DocumentPreviewModal';
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
const { TabPane } = Tabs;

// Helper to download CSV
const downloadCSV = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const FinancialPlannerDashboard = () => {
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

  // Document Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [reviewForm] = Form.useForm();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      if (isRefresh) setRefreshing(true);

      const [meetingsRes, documentsRes, statsRes] = await Promise.all([
        api.get('/meetings/professional?role=financial_planner&upcoming=true'),
        api.get('/documents/pending?role=financial_planner'),
        api.get('/financial-planners/stats').catch(() => ({ data: {} }))
      ]);

      setData({
        meetings: meetingsRes.data.meetings || [],
        documents: documentsRes.data.documents || [],
        stats: {
          ...statsRes.data,
          meetingsToday: meetingsRes.data.meetings?.filter(m => moment(m.startsAt).isSame(moment(), 'day')).length || 0,
          activeClients: new Set(meetingsRes.data.meetings?.map(m => m.client?.id)).size || 0,
          aum: statsRes.data?.aum || 12500000 // Ensure fallback
        }
      });
      if (isRefresh) message.success('Dashboard data synchronized');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      message.loading({ content: 'Generating report...', key: 'export' });

      let csv = 'ANALYST DASHBOARD REPORT\n';
      csv += `Generated: ${moment().format('MMMM Do YYYY, h:mm:ss a')}\n\n`;

      csv += '--- PRIMARY KPIs ---\n';
      csv += `AUM (Estimated),${(data.stats.aum / 10000000).toFixed(2)} Cr\n`;
      csv += `Active Clients,${data.stats.activeClients}\n`;
      csv += `Meetings Today,${data.stats.meetingsToday}\n`;
      csv += `Client Satisfaction,${data.stats.satisfaction}/5.0\n\n`;

      csv += '--- UPCOMING MEETINGS ---\n';
      csv += 'Client,Goal,Urgency,Starts At\n';
      data.meetings.forEach(m => {
        csv += `${m.client?.name || 'N/A'},${m.engagementPurpose},${m.timeSensitivity},${moment(m.startsAt).format('YYYY-MM-DD HH:mm')}\n`;
      });
      csv += '\n';

      csv += '--- PENDING DOCUMENTS ---\n';
      csv += 'File Name,Client,Status\n';
      data.documents.forEach(d => {
        csv += `${d.fileName},${d.owner?.name || 'N/A'},${d.status}\n`;
      });

      downloadCSV(csv, `Analyst_Report_${moment().format('YYYYMMDD')}.csv`);
      message.success({ content: 'Report exported successfully', key: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      message.error({ content: 'Failed to export report', key: 'export' });
    }
  };

  const loadAIInsights = async (meeting) => {
    try {
      setAiLoading(true);
      setAiModalVisible(true);
      console.log('Selected Meeting Submission:', meeting.submission);
      setSelectedSubmission(meeting.submission);
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

  const handlePreview = (record) => {
    setPreviewDoc(record);
    setPreviewVisible(true);
  };

  // --- Table Columns ---
  const meetingColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
      width: 150,
      render: (client) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00B0F0' }} size="small" />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{client?.name}</span>
        </Space>
      )
    },
    {
      title: 'Goal',
      dataIndex: 'engagementPurpose',
      width: 100,
      render: (purpose) => {
        const labels = {
          tax_filing: 'Tax Filing',
          loan_expansion: 'Loan/Expansion',
          compliance_cleanup: 'Compliance',
          advisory: 'Advisory'
        };
        return <Tag color="gold" style={{ fontSize: '11px', margin: 0 }}>{labels[purpose] || 'Review'}</Tag>;
      }
    },
    {
      title: 'Urgency',
      dataIndex: 'timeSensitivity',
      width: 100,
      render: (urgency) => (
        <Tag color={urgency === 'deadline_driven' ? 'red' : 'green'} style={{ fontSize: '11px', margin: 0 }}>
          {urgency === 'deadline_driven' ? 'URGENT' : 'STANDARD'}
        </Tag>
      )
    },
    {
      title: 'Time',
      dataIndex: 'startsAt',
      width: 120,
      render: (time) => <span style={{ fontSize: '12px' }}>{moment(time).format('MMM DD, HH:mm')}</span>
    },
    {
      title: 'Action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<VideoCameraOutlined />}
            onClick={() => window.open(record.zoomStartUrl || '#', '_blank')}
            style={{ background: '#00B0F0', fontSize: '11px' }}
          >
            Join
          </Button>
          <Button
            size="small"
            icon={<RobotOutlined />}
            onClick={() => loadAIInsights(record)}
            style={{ background: '#52c41a', color: 'white', border: 'none', fontSize: '11px' }}
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
            title="Preview Document"
            style={{ background: 'rgba(0, 176, 240, 0.1)', color: '#00B0F0', borderColor: 'rgba(0, 176, 240, 0.3)' }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setSelectedDocument(record); setReviewModalVisible(true); }}
            title="Review Document"
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
          <ActionButton onClick={() => loadDashboardData(true)} disabled={refreshing}>
            <ReloadOutlined spin={refreshing} /> {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </ActionButton>
          <ActionButton onClick={handleExport}><FileTextOutlined /> Export Report</ActionButton>
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

        {/* Third Row - Main Tables */}
        <Col span={12}>
          <TableContainer title="Upcoming Meetings">
            <Table
              dataSource={data.meetings.slice(0, 5)}
              columns={meetingColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 600 }}
            />
          </TableContainer>
        </Col>
        <Col span={12}>
          <TableContainer title="Pending Document Reviews">
            <Table
              dataSource={data.documents.slice(0, 5)}
              columns={documentColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 600 }}
            />
          </TableContainer>
        </Col>

        {/* Fourth Row - Secondary Chart */}
        <Col span={24}>
          <ChartContainer title="New Client Acquisition Trends">
            <Column {...acquisitionConfig} height={200} />
          </ChartContainer>
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
        title={
          <Space>
            <RobotOutlined style={{ color: '#00B0F0' }} />
            <span>AI Financial Intelligence - Client Prep Kit</span>
          </Space>
        }
        visible={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={null}
        width={1100}
        bodyStyle={{ background: '#000', padding: '24px', minHeight: '80vh' }}
        closeIcon={<CloseOutlined style={{ color: 'white' }} />}
      >
        <Tabs defaultActiveKey="1" className="ai-prep-tabs">
          <TabPane
            tab={<span><RobotOutlined /> Intelligent Briefing</span>}
            key="1"
          >
            {selectedSubmission?.id && <BriefingPanel submissionId={selectedSubmission.id} />}
            <ClientSnapshot insights={selectedMeetingInsights} loading={aiLoading} />
            <div style={{ marginTop: '24px' }}>
              <DocumentInsightsPanel
                documents={selectedMeetingInsights?.map(i => i.document) || []}
                insights={selectedMeetingInsights || []}
              />
            </div>
          </TabPane>
          <TabPane
            tab={<span><FileTextOutlined /> Client Submission Data (Report)</span>}
            key="2"
          >
            {selectedSubmission ? (
              <ClientSubmissionReport submission={selectedSubmission} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No form submission data found for this consultation.</p>
              </div>
            )}
          </TabPane>
        </Tabs>

        <style dangerouslySetInnerHTML={{
          __html: `
          .ai-prep-tabs .ant-tabs-nav::before {
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .ai-prep-tabs .ant-tabs-tab {
            color: rgba(255,255,255,0.6);
          }
          .ai-prep-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #00B0F0 !important;
          }
          .ai-prep-tabs .ant-tabs-ink-bar {
            background: #00B0F0;
          }
        `}} />
      </Modal>

      <DocumentPreviewModal
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        fileType={previewDoc?.fileType}
      />

    </DashboardContainer>
  );
};

// Helper for CloseIcon
const CloseOutlined = ({ style }) => (
  <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="close"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    style={style}
  >
    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
  </svg>
);

export default FinancialPlannerDashboard;