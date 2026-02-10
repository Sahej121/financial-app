import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input, Popover, Descriptions, Badge, Typography, Statistic, Divider, Card, Calendar, Timeline } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined, RobotOutlined, InfoCircleOutlined, WarningOutlined, SafetyCertificateOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarCircleOutlined, AuditOutlined, CloseOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import gstApi from '../../services/gstApi';
import ClientSnapshot from '../analyst/ClientSnapshot';
import DocumentInsightsPanel from '../analyst/DocumentInsightsPanel';
import ClientSubmissionReport from '../analyst/ClientSubmissionReport';
import DocumentPreviewModal from '../analyst/DocumentPreviewModal';
import CAVerificationPanel from '../gst/CAVerificationPanel';
import '../../styles/dashboard.css';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Typography;

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

const CADashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    meetings: [],
    documents: [],
    stats: {
      pendingReviews: 0,
      scheduledMeetings: 0,
      urgentAttention: 0
    },
    aiInsights: []
  });

  const [pendingGSTFilings, setPendingGSTFilings] = useState([]);
  const [gstLoading, setGstLoading] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState(null);

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedMeetingInsights, setSelectedMeetingInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();

  const [briefingModalVisible, setBriefingModalVisible] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [selectedMeetingForCompletion, setSelectedMeetingForCompletion] = useState(null);
  const [completionForm] = Form.useForm();

  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Document Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // GST Report State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingClients, setReportingClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [reportForm] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      if (isRefresh) setRefreshing(true);

      const [meetingsRes, documentsRes, logsRes, gstRes] = await Promise.all([
        api.get('/meetings/professional?role=ca&upcoming=true'),
        api.get('/documents/pending?role=ca'),
        api.get('/activity-logs?limit=8'),
        gstApi.getPendingFilings().catch(err => {
          console.error('Failed to load GST filings:', err);
          return [];
        })
      ]);

      setActivityLogs(logsRes.data.logs || []);
      setPendingGSTFilings(gstRes || []);

      const meetings = meetingsRes.data.meetings || [];
      const documents = documentsRes.data.documents || [];

      setData({
        meetings,
        documents,
        stats: {
          pendingReviews: documents.length,
          scheduledMeetings: meetings.length,
          urgentAttention: documents.filter(d => d.priority === 'urgent').length
        }
      });

      if (isRefresh) message.success('Dashboard synchronized with latest filings');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleGSTReport = async () => {
    setReportModalVisible(true);
    setClientsLoading(true);
    try {
      const clients = await gstApi.getReportingClients();
      setReportingClients(clients);
    } catch (error) {
      console.error('Failed to load reporting clients:', error);
      message.error('Failed to load eligible clients for reporting');
    } finally {
      setClientsLoading(false);
    }
  };

  const handleClearQueue = async () => {
    if (data.documents.length === 0) return;

    Modal.confirm({
      title: 'Clear Document Queue',
      content: `This will mark all ${data.documents.length} pending documents as reviewed. Are you sure?`,
      okText: 'Clear All',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          message.loading({ content: 'Clearing document queue...', key: 'clear_queue' });
          const docIds = data.documents.map(d => d.id);
          console.log('Clearing document IDs:', docIds);
          const response = await api.post('/documents/bulk-review', {
            documentIds: docIds,
            status: 'reviewed',
            reviewNotes: 'Bulk cleared from dashboard'
          });
          console.log('Bulk review response:', response.data);
          message.success({ content: 'Queue cleared successfully', key: 'clear_queue' });
          loadDashboardData();
        } catch (error) {
          console.error('Failed to clear queue:', error);
          message.error({ content: 'Failed to clear document queue', key: 'clear_queue' });
        }
      }
    });
  };

  const submitGSTReport = async (values) => {
    try {
      message.loading({ content: 'Sending GST Report...', key: 'gst_report_submit' });
      await gstApi.createReport({
        ...values,
        financialYear: moment().format('YYYY') + '-' + (moment().add(1, 'year').format('YY'))
      });
      message.success({ content: 'GST Report sent to client successfully', key: 'gst_report_submit' });
      setReportModalVisible(false);
      reportForm.resetFields();
    } catch (error) {
      console.error('Report submission failed:', error);
      message.error({ content: 'Failed to send GST Report', key: 'gst_report_submit' });
    }
  };

  const loadAIInsights = async (meeting) => {
    try {
      setAiLoading(true);
      setAiModalVisible(true);
      setSelectedSubmission(meeting.submission);
      const res = await api.get(`/documents/submission/${meeting.submissionId}/snapshot`);
      setSelectedMeetingInsights({
        insights: res.data.insights || [],
        decisionPack: res.data.decisionPack || null
      });
    } catch (error) {
      console.error('Error loading AI insights:', error);
      message.error('Failed to load AI intelligence for this client');
    } finally {
      setAiLoading(false);
    }
  };

  const loadBriefing = async (meeting) => {
    try {
      setBriefingLoading(true);
      setBriefingModalVisible(true);
      const res = await api.get(`/meetings/${meeting.id}/briefing`);
      setSelectedBriefing(res.data.briefing);
    } catch (error) {
      console.error('Error loading briefing:', error);
      message.error('Failed to generate professional briefing');
      setBriefingModalVisible(false);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handlePreview = (record) => {
    setPreviewDoc(record);
    setPreviewVisible(true);
  };

  // --- Charts Config ---
  const meetingsChartConfig = {
    data: [
      { day: 'Mon', value: 4 },
      { day: 'Tue', value: 6 },
      { day: 'Wed', value: 8 },
      { day: 'Thu', value: 5 },
      { day: 'Fri', value: 7 },
    ],
    xField: 'day',
    yField: 'value',
    color: '#00B0F0',
    columnWidthRatio: 0.6,
    xAxis: { grid: null },
    yAxis: { grid: { line: { style: { stroke: '#333' } } } }
  };

  const docStatusConfig = {
    data: [
      { type: 'Approved', value: 45 },
      { type: 'Review Pending', value: 25 },
      { type: 'Rejected', value: 10 },
      { type: 'Queries', value: 20 },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    radius: 0.85,
    innerRadius: 0.65,
    color: ['#00B0F0', '#52c41a', '#F2C811', '#ff4d4f'],
    legend: {
      position: 'bottom',
      itemHeight: 24,
      itemName: {
        style: { fill: '#cbd5e1', fontSize: 13 }
      }
    },
    statistic: {
      title: {
        style: { color: '#64748b', fontSize: '14px', fontWeight: 500 },
        content: 'Total',
      },
      content: {
        style: {
          color: '#fff',
          fontSize: '28px',
          fontWeight: 800,
          textShadow: '0 0 10px rgba(0,176,240,0.5)'
        },
        customHtml: (container, view, datum, data) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          return `${total}`;
        },
      },
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
            <div style="color: #fff; font-size: 16px; font-weight: 600;">${items[0]?.value} Documents</div>
          </div>
        `;
      }
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    pieStyle: {
      lineWidth: 2,
      stroke: '#1e293b',
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      cursor: 'pointer',
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    },
  };

  // --- Columns ---
  const meetingColumns = [
    {
      title: 'Case ID',
      dataIndex: 'referenceNumber',
      width: 140,
      render: (ref) => <Text style={{ fontFamily: 'monospace', color: '#00B0F0', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{ref || 'TBD'}</Text>
    },
    {
      title: 'Client',
      dataIndex: 'client',
      width: 180,
      render: (client, record) => (
        <div style={{ minWidth: '150px' }}>
          <Space align="center">
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#00B0F0' }} />
            <span style={{ fontWeight: 600, color: 'white' }}>{client?.name}</span>
          </Space>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '28px', marginTop: '2px' }}>
            Health: <span style={{ color: (record.healthScore > 80 ? '#52c41a' : record.healthScore > 50 ? '#faad14' : '#ff4d4f') }}>{record.healthScore || 0}%</span>
          </div>
        </div>
      )
    },
    {
      title: 'Goal',
      dataIndex: 'engagementPurpose',
      width: 120,
      render: (purpose) => {
        const labels = {
          tax_filing: 'Tax Filing',
          loan_expansion: 'Loan/Expansion',
          compliance_cleanup: 'Compliance',
          advisory: 'Advisory'
        };
        return <Tag color="blue" style={{ margin: 0 }}>{labels[purpose] || 'Consultation'}</Tag>;
      }
    },
    {
      title: 'Urgency',
      dataIndex: 'timeSensitivity',
      width: 110,
      render: (urgency) => (
        <Tag color={urgency === 'deadline_driven' ? 'red' : 'green'} style={{ margin: 0 }}>
          {urgency === 'deadline_driven' ? 'URGENT' : 'STANDARD'}
        </Tag>
      )
    },
    {
      title: 'Snapshot',
      key: 'snapshot',
      width: 120,
      render: (_, record) => (
        <Popover
          title="Business Snapshot"
          overlayStyle={{ width: 300 }}
          content={
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Industry">
                {(record.industry && record.industry.toUpperCase()) || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Turnover">
                {(record.turnoverBand && record.turnoverBand.replace('_', ' ').toUpperCase()) || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Income">
                {Array.isArray(record.incomeSources) ? record.incomeSources.join(', ') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Method">
                {(record.accountingMethod && record.accountingMethod.toUpperCase()) || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          }
        >
          <Button icon={<InfoCircleOutlined />} size="small" type="ghost">View Details</Button>
        </Popover>
      )
    },
    {
      title: 'Risk Posture',
      key: 'risk',
      width: 140,
      render: (_, record) => {
        const score = record.riskScore || 0;
        const color = score > 60 ? '#ff4d4f' : score > 20 ? '#faad14' : '#52c41a';
        const flags = record.riskFlags || {};

        return (
          <Popover
            title="Risk Detail Flags"
            content={
              <Space direction="vertical">
                {flags.notices && <Tag color="error">Past Notices</Tag>}
                {flags.pending && <Tag color="warning">Pending Filings</Tag>}
                {flags.loans && <Tag color="processing">Existing Loans</Tag>}
                {flags.crypto && <Tag color="magenta">Crypto/Foreign</Tag>}
                {flags.cashHeavy && <Tag color="volcano">Cash Heavy</Tag>}
                {!Object.values(flags).some(Boolean) && <Text type="secondary">No specific flags reported</Text>}
              </Space>
            }
          >
            <Space size="small" style={{ minWidth: '100px' }}>
              <Badge count={`${score}/100`} style={{ backgroundColor: color }} />
              {score > 40 ? <WarningOutlined style={{ color: color }} /> : <SafetyCertificateOutlined style={{ color: color }} />}
            </Space>
          </Popover>
        );
      }
    },
    {
      title: 'Engagement',
      key: 'engagement',
      width: 160,
      render: (_, record) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {record.pendingStatus !== 'none' && (
            <Tag color={record.pendingStatus === 'client_pending' ? 'gold' : 'blue'} style={{ margin: 0, fontSize: '10px' }}>
              {record.pendingStatus === 'client_pending' ? 'CLIENT PENDING' : 'CA ACTION'}
            </Tag>
          )}
          <div style={{ marginTop: '4px' }}>
            {record.nextFollowUp ? (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                📅 {moment(record.nextFollowUp).format('DD MMM')}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '11px' }}>Pending Scope</Text>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Time',
      dataIndex: 'startsAt',
      width: 130,
      render: (time) => moment(time).format('MMM DD, HH:mm')
    },
    {
      title: 'Payment',
      dataIndex: 'transactionId',
      width: 100,
      render: (tid) => <Tag color={tid ? 'success' : 'warning'}>{tid ? 'PAID' : 'PENDING'}</Tag>
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<VideoCameraOutlined />}
            onClick={() => {
              if (record.zoomStartUrl) {
                window.open(record.zoomStartUrl, '_blank');
              } else {
                message.warning('Zoom host link not generated yet.');
              }
            }}
            style={{ background: '#00B0F0' }}
          >
            Start
          </Button>
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => loadBriefing(record)}
            style={{ background: '#00B0F0', color: 'white', border: 'none' }}
          >
            One-Page Brief
          </Button>
          <Button
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setSelectedMeetingForCompletion(record);
              setCompletionModalVisible(true);
            }}
            style={{ background: '#52c41a', color: 'white', border: 'none' }}
          >
            Complete Call
          </Button>
          <Button
            size="small"
            icon={<RobotOutlined />}
            onClick={() => loadAIInsights(record)}
            style={{ background: '#00B0F0', color: 'white', border: 'none' }}
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
      render: (name) => <span style={{ fontWeight: 600, color: 'white' }}>{name || 'Unknown Document'}</span>
    },
    {
      title: 'Client',
      dataIndex: 'owner',
      render: (owner) => <span style={{ color: 'rgba(255,255,255,0.85)' }}>{owner?.name || 'Multiple Clients'}</span>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (p) => <Tag color={p === 'urgent' ? 'red' : 'blue'}>{p ? p.toUpperCase() : 'NORMAL'}</Tag>
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
            onClick={() => handlePreview(record)}
            style={{ background: 'rgba(0, 176, 240, 0.1)', color: '#00B0F0', borderColor: 'rgba(0, 176, 240, 0.3)' }}
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

  const gstFilingColumns = [
    {
      title: 'Client',
      dataIndex: ['gstProfile', 'businessName'],
      key: 'client',
      render: (text, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
          <span style={{ fontWeight: 600, color: 'white' }}>{text || record.gstProfile?.legalName}</span>
        </Space>
      )
    },
    {
      title: 'Return Type',
      dataIndex: 'returnType',
      key: 'returnType',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period) => {
        const month = period.substring(0, 2);
        const year = period.substring(2);
        const date = moment(`${year}-${month}-01`);
        return date.isValid() ? date.format('MMM YYYY') : period;
      }
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => (
        <span style={{ color: moment(date).isBefore(moment()) ? '#ff4d4f' : 'inherit' }}>
          {moment(date).format('DD MMM YYYY')}
        </span>
      )
    },
    {
      title: 'Value',
      dataIndex: 'totalInvoiceValue',
      key: 'value',
      render: (val) => `₹${Number(val).toLocaleString()}`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          size="small"
          onClick={() => {
            setSelectedFiling(record);
            setVerificationModalVisible(true);
          }}
          style={{ background: '#52c41a', border: 'none' }}
        >
          Review & Sign
        </Button>
      )
    }
  ];


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">CA Workspace</h1>
        <Space>
          <Button
            className="dashboard-action-btn"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            className="dashboard-action-btn"
            icon={<FileTextOutlined />}
            onClick={handleGSTReport}
          >
            GST Report
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="kpi-card yellow" bordered={false}>
            <div className="kpi-icon-wrapper yellow">
              <FileTextOutlined />
            </div>
            <div className="kpi-label">Pending Reviews</div>
            <div className="kpi-value">{data.stats.pendingReviews}</div>
            <div className="kpi-subtitle">
              <WarningOutlined style={{ color: '#F2C811' }} />
              Requires attention
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="kpi-card blue" bordered={false}>
            <div className="kpi-icon-wrapper blue">
              <VideoCameraOutlined />
            </div>
            <div className="kpi-label">Scheduled Meetings</div>
            <div className="kpi-value">{data.stats.scheduledMeetings}</div>
            <div className="kpi-subtitle">
              <CheckCircleOutlined style={{ color: '#00B0F0' }} />
              For this week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="kpi-card red" bordered={false}>
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <WarningOutlined />
            </div>
            <div className="kpi-label">Urgent Documents</div>
            <div className="kpi-value">{data.stats.urgentAttention}</div>
            <div className="kpi-subtitle">
              <WarningOutlined style={{ color: '#ef4444' }} />
              High Priority
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card className="chart-container widget-card" title="Weekly Activity (Meetings)" bordered={false}>
            <Column {...meetingsChartConfig} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-container widget-card" title="Document Status" bordered={false}>
            <Pie {...docStatusConfig} height={250} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="widget-card" title="Upcoming Consultations" bordered={false}>
            <Table
              dataSource={data.meetings.slice(0, 5)}
              columns={meetingColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="widget-card"
            title="Document Review Queue"
            bordered={false}
            extra={
              data.documents.length > 0 && (
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleClearQueue}
                  style={{ padding: 0 }}
                >
                  Clear Queue
                </Button>
              )
            }
          >
            <Table
              dataSource={data.documents.slice(0, 5)}
              columns={documentColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card className="widget-card" title={<span><AuditOutlined style={{ marginRight: 8, color: '#00B0F0' }} /> GST Filing Reviews</span>} bordered={false}>
            <Table
              dataSource={pendingGSTFilings}
              columns={gstFilingColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No pending filings for review' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card className="widget-card" title="⚡ Real-time Client Activity Feed" bordered={false}>
            <Table
              dataSource={activityLogs}
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                {
                  title: 'Timestamp',
                  dataIndex: 'createdAt',
                  width: 150,
                  render: (t) => <Text type="secondary" style={{ fontSize: '11px' }}>{moment(t).format('HH:mm [on] DD MMM')}</Text>
                },
                {
                  title: 'Actor',
                  dataIndex: 'user',
                  width: 180,
                  render: (user) => <Text strong style={{ color: user?.role === 'ca' ? '#00B0F0' : '#52c41a' }}>{user?.name}</Text>
                },
                {
                  title: 'Type',
                  dataIndex: 'action',
                  width: 180,
                  render: (a) => <Tag style={{ borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)' }}>{a}</Tag>
                },
                {
                  title: 'Event Narrative',
                  dataIndex: 'description',
                  render: (d) => <Text style={{ color: 'white' }}>{d}</Text>
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Review Document"
        visible={reviewModalVisible} // Using visible for older antd versions compatibility, can use open in v5
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
        {/* Modal content omitted for brevity but should be preserved if needed, or structured similarly to AnalystDashboard if shared components are used */}
      </Modal>

      <DocumentPreviewModal
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        fileType={previewDoc?.fileType}
      />

      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#00B0F0' }} />
            <span style={{ color: 'white' }}>Professional Case Briefing - One Page</span>
          </Space>
        }
        visible={briefingModalVisible}
        onCancel={() => setBriefingModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setBriefingModalVisible(false)} style={{ background: '#00B0F0' }}>
            Ready for Consultation
          </Button>
        ]}
        width={750}
        bodyStyle={{ background: '#141414', color: 'white', padding: '24px' }}
      >
        {briefingLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><ReloadOutlined spin style={{ fontSize: '24px' }} /></div>
        ) : selectedBriefing && (
          <div>
            <div style={{ background: 'rgba(0,176,240,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,176,240,0.2)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong style={{ color: '#00B0F0', fontSize: '11px' }}>CASE REF: {selectedBriefing.referenceNumber}</Text>
                <Text strong style={{ color: (selectedBriefing.healthScore > 80 ? '#52c41a' : '#faad14'), fontSize: '11px' }}>
                  FINANCIAL HEALTH: {selectedBriefing.healthScore}%
                </Text>
              </div>
              <Text strong style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>PRIMARY OBJECTIVE</Text>
              <Title level={5} style={{ color: 'white', margin: 0 }}>
                {typeof selectedBriefing.objective === 'object' ? JSON.stringify(selectedBriefing.objective) : selectedBriefing.objective}
              </Title>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
              <Col xs={24} sm={8}>
                <Card size="small" style={{ background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.45)' }}>TOTAL CREDITS</span>}
                    value={selectedBriefing.snapshot.totalCredits}
                    precision={0}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <AuditOutlined style={{ color: '#00B0F0' }} />
            <span>Professional GST Compliance Report</span>
          </Space>
        }
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={submitGSTReport}
          initialValues={{ title: `GST Compliance Report - ${moment().format('MMMM YYYY')}` }}
        >
          <Form.Item
            name="userId"
            label="Select Client"
            rules={[{ required: true, message: 'Please select a client' }]}
          >
            <Select
              placeholder="Select which client to report to"
              loading={clientsLoading}
              showSearch
              optionFilterProp="children"
            >
              {reportingClients.map(client => (
                <Option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Report Title"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g., GST GSTR-1 Compliance Analysis - Jan 2026" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Report Professional Commentary"
            rules={[{ required: true, message: 'Please add your professional findings' }]}
          >
            <TextArea
              rows={8}
              placeholder="Provide a detailed professional analysis of the client's GST status, any discrepancies found, and action items..."
            />
          </Form.Item>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => setReportModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#00B0F0' }}>
              Send Report to Client
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CADashboard;