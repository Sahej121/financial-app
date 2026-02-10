import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input, Tabs, Card, Statistic, Typography } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined, RobotOutlined, FileTextOutlined, SafetyCertificateOutlined, CheckCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { Pie, Area, Column } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import ClientSnapshot from '../analyst/ClientSnapshot';
import DocumentInsightsPanel from '../analyst/DocumentInsightsPanel';
import BriefingPanel from '../analyst/BriefingPanel';
import ClientSubmissionReport from '../analyst/ClientSubmissionReport';
import DocumentPreviewModal from '../analyst/DocumentPreviewModal';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;

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
      satisfaction: 4.9,
      reputation: {
        trustScore: 50,
        competenceScore: 0,
        outcomeScore: 0,
        totalCompletedCases: 0
      }
    },
    aiInsights: []
  });

  const [refreshing, setRefreshing] = useState(false);

  // AI Prep State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedMeetingInsights, setSelectedMeetingInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Document Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();

  // Report Writing State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedMeetingForReport, setSelectedMeetingForReport] = useState(null);
  const [reportForm] = Form.useForm();

  // Document Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Client Submission View State
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Outcome Logging State
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false);
  const [selectedMeetingForOutcome, setSelectedMeetingForOutcome] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const [meetingsRes, documentsRes, statsRes, pastMeetingsRes] = await Promise.all([
        api.get('/meetings/professional?role=financial_planner&upcoming=true'),
        api.get('/documents/pending?role=financial_planner'),
        api.get('/financial-planners/stats').catch(() => ({ data: {} })),
        api.get('/meetings/professional?role=financial_planner&upcoming=false&limit=10').catch(() => ({ data: { meetings: [] } }))
      ]);

      setData({
        meetings: meetingsRes.data.meetings || [],
        pastMeetings: pastMeetingsRes.data.meetings || [],
        documents: documentsRes.data.documents || [],
        stats: {
          ...statsRes.data,
          meetingsToday: meetingsRes.data.meetings?.filter(m => moment(m.startsAt).isSame(moment(), 'day')).length || 0,
          activeClients: new Set(meetingsRes.data.meetings?.map(m => m.client?.id)).size || 0,
          aum: statsRes.data?.aum || 12500000
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
      csv += `Trust Score,${data.stats.reputation?.trustScore || 'N/A'}\n\n`;
      downloadCSV(csv, `Analyst_Report_${moment().format('YYYYMMDD')}.csv`);
      message.success({ content: 'Report exported successfully', key: 'export' });
    } catch (error) {
      message.error({ content: 'Failed to export report', key: 'export' });
    }
  };

  const loadAIInsights = async (meeting) => {
    try {
      setAiLoading(true);
      setAiModalVisible(true);
      setSelectedSubmission(meeting.submission);
      const res = await api.get(`/documents/submission/${meeting.submissionId}/snapshot`);
      setSelectedMeetingInsights(res.data.insights || []);
    } catch (error) {
      message.error('Failed to load AI intelligence for this client');
    } finally {
      setAiLoading(false);
    }
  };

  const openReportModal = (meeting) => {
    setSelectedMeetingForReport(meeting);
    reportForm.setFieldsValue({
      reportContent: meeting.reportContent || '',
      rating: meeting.rating || 5
    });
    setReportModalVisible(true);
  };

  const handleReportSubmit = async (values) => {
    try {
      await api.patch(`/meetings/${selectedMeetingForReport.id}`, {
        reportContent: values.reportContent,
        rating: values.rating
      });
      message.success('Report saved successfully');
      setReportModalVisible(false);
      loadDashboardData();
    } catch (error) {
      message.error('Failed to save report');
    }
  };

  const handleLogOutcome = (meeting) => {
    setSelectedMeetingForOutcome(meeting);
    setOutcomeModalVisible(true);
  };

  const submitOutcome = async (values) => {
    try {
      const response = await api.post('/financial-planners/outcomes', {
        clientId: selectedMeetingForOutcome.client?.id,
        meetingId: selectedMeetingForOutcome.id,
        adviceType: selectedMeetingForOutcome.planningType || 'financial_planning',
        ...values
      });

      if (response.status === 201) {
        message.success('Outcome logged. Trust Score updating...');
        setOutcomeModalVisible(false);
        loadDashboardData();
      }
    } catch (error) {
      message.error('Failed to log outcome');
    }
  };

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
    legend: { position: 'bottom', itemHeight: 20 }
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

  const meetingColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
      width: 150,
      render: (client) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00B0F0' }} size="small" />
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>{client?.name}</span>
        </Space>
      )
    },
    {
      title: 'Goal',
      dataIndex: 'engagementPurpose',
      width: 100,
      render: (purpose) => (
        <Tag color="gold" style={{ fontSize: '11px', margin: 0 }}>{purpose || 'Review'}</Tag>
      )
    },
    {
      title: 'Time',
      dataIndex: 'startsAt',
      width: 120,
      render: (time) => <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{moment(time).format('MMM DD, HH:mm')}</span>
    },
    {
      title: 'Action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<VideoCameraOutlined />}
            onClick={() => window.open(record.zoomStartUrl || '#', '_blank')}
            style={{ background: '#00B0F0', fontSize: '11px', borderColor: '#00B0F0' }}
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
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openReportModal(record)}
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '11px' }}
          >
            Report
          </Button>
        </Space>
      )
    }
  ];

  const documentColumns = [
    {
      title: 'Document',
      dataIndex: 'fileName',
      render: (name) => <span style={{ fontWeight: 500, color: 'white' }}>{name}</span>
    },
    {
      title: 'Client',
      dataIndex: 'owner',
      render: (owner) => <span style={{ color: 'rgba(255,255,255,0.85)' }}>{owner?.name}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
        return <Tag color={colors[status] || 'default'}>{status ? status.toUpperCase() : 'UNKNOWN'}</Tag>;
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analyst Overview</h1>
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
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* NEW: Reputation & Trust Score Card */}
        <Col span={24}>
          <Card className="widget-card reputation-card" title="Reputation & Impact" bordered={false}>
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Trust Score"
                  value={data.stats.reputation?.trustScore || 50}
                  precision={1}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<SafetyCertificateOutlined />}
                  suffix="/ 100"
                />
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: 5 }}>
                  Based on competence, outcomes & speed
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Competence"
                  value={data.stats.reputation?.competenceScore || 0}
                  precision={0}
                  suffix="%"
                  valueStyle={{ color: '#fff' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Client Outcomes"
                  value={data.stats.reputation?.outcomeScore || 0}
                  precision={0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Completed Cases"
                  value={data.stats.reputation?.totalCompletedCases || 0}
                  valueStyle={{ color: '#fff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card blue" bordered={false}>
            <div className="kpi-icon-wrapper blue">
              <DollarCircleOutlined />
            </div>
            <div className="kpi-label">AUM (Est.)</div>
            <div className="kpi-value">₹{(data.stats.aum / 10000000).toFixed(2)} Cr</div>
            <div className={`kpi-trend positive`}>▲ 12.5% vs last month</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card yellow" bordered={false}>
            <div className="kpi-icon-wrapper yellow">
              <UserOutlined />
            </div>
            <div className="kpi-label">Active Clients</div>
            <div className="kpi-value">{data.stats.activeClients}</div>
            <div className={`kpi-trend positive`}>▲ 4 new this month</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card green" bordered={false}>
            <div className="kpi-icon-wrapper green">
              <VideoCameraOutlined />
            </div>
            <div className="kpi-label">Meetings Today</div>
            <div className="kpi-value">{data.stats.meetingsToday}</div>
            <div className={`kpi-trend neutral`}>8 scheduled for week</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card red" bordered={false} style={{ borderColor: '#ef4444' }}>
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(209, 52, 56, 0.15)', color: '#D13438' }}>
              <CheckCircleOutlined />
            </div>
            <div className="kpi-label">Client Satisfaction</div>
            <div className="kpi-value">{data.stats.satisfaction}/5.0</div>
            <div className={`kpi-trend positive`}>Based on 24 reviews</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card className="chart-container widget-card" title="Portfolio Growth (AUM)" bordered={false}>
            <Area {...aumConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="chart-container widget-card" title="Asset Allocation" bordered={false}>
            <Pie {...portfolioConfig} height={300} />
          </Card>
        </Col>

        <Col span={24}>
          <Card className="widget-card" bordered={false} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="1" tabBarStyle={{ padding: '0 24px' }}>
              <TabPane tab="Upcoming Meetings" key="1">
                <div style={{ padding: '0 24px 24px' }}>
                  <Table
                    dataSource={data.meetings.slice(0, 5)}
                    columns={meetingColumns}
                    pagination={false}
                    size="small"
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: <div style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '20px' }}>No upcoming meetings</div> }}
                  />
                </div>
              </TabPane>
              <TabPane tab="Meeting History" key="2">
                <div style={{ padding: '0 24px 24px' }}>
                  <Table
                    dataSource={data.pastMeetings?.slice(0, 5) || []}
                    columns={[
                      ...meetingColumns.filter(c => c.key !== 'action' && c.title !== 'Action'),
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        render: s => <Tag color={s === 'completed' ? 'green' : 'default'}>{s ? s.toUpperCase() : 'UNKNOWN'}</Tag>
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        fixed: 'right',
                        width: 200,
                        render: (_, record) => (
                          <Space>
                            <Button
                              size="small"
                              type={record.reportContent ? 'default' : 'primary'}
                              ghost={!!record.reportContent}
                              icon={<EditOutlined />}
                              onClick={() => openReportModal(record)}
                              style={record.reportContent ?
                                { borderColor: 'rgba(255,255,255,0.3)', color: 'white' } :
                                { background: '#00B0F0', border: 'none' }
                              }
                            >
                              {record.reportContent ? 'Edit' : 'Write'}
                            </Button>
                            <Button
                              size="small"
                              type="text"
                              icon={<CheckCircleOutlined />}
                              style={{ color: '#52c41a', background: 'rgba(82, 196, 26, 0.1)', borderColor: '#52c41a' }}
                              onClick={() => handleLogOutcome(record)}
                            >
                              Outcome
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                    pagination={false}
                    size="small"
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: <div style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '20px' }}>No past meetings found</div> }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col span={24}>
          <Card className="widget-card" title="Pending Document Reviews" bordered={false}>
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

        <Col span={24}>
          <Card className="chart-container widget-card" title="New Client Acquisition Trends" bordered={false}>
            <Column {...acquisitionConfig} height={200} />
          </Card>
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
            <FileTextOutlined style={{ color: '#00B0F0' }} />
            <span>Meeting Report & Notes</span>
          </Space>
        }
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleReportSubmit}
        >
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,176,240,0.05)', borderRadius: '8px', border: '1px solid rgba(0,176,240,0.1)' }}>
            <Text strong style={{ color: '#00B0F0' }}>Client: {selectedMeetingForReport?.client?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Meeting: {moment(selectedMeetingForReport?.startsAt).format('MMM DD, YYYY HH:mm')}
            </Text>
          </div>

          <Form.Item
            name="reportContent"
            label="Report Content"
            rules={[{ required: true, message: 'Please enter report content' }]}
          >
            <TextArea
              rows={8}
              placeholder="Enter detailed meeting notes, client requirements, and action items..."
              style={{ background: '#1f1f1f', color: 'white', borderColor: '#434343' }}
            />
          </Form.Item>

          <Form.Item name="rating" label="Meeting Rating (Internal)">
            <Select>
              <Option value={1}>1 - Needs Improvement</Option>
              <Option value={2}>2 - Fair</Option>
              <Option value={3}>3 - Good</Option>
              <Option value={4}>4 - Very Good</Option>
              <Option value={5}>5 - Excellent</Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block style={{ background: '#00B0F0', borderColor: '#00B0F0' }}>
            Save Report
          </Button>
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
          <TabPane tab={<span><RobotOutlined /> Intelligent Briefing</span>} key="1">
            {selectedSubmission?.id && <BriefingPanel submissionId={selectedSubmission.id} />}
            <ClientSnapshot insights={selectedMeetingInsights} loading={aiLoading} />
            <div style={{ marginTop: '24px' }}>
              <DocumentInsightsPanel
                documents={selectedMeetingInsights?.map(i => i.document) || []}
                insights={selectedMeetingInsights || []}
              />
            </div>
          </TabPane>
          <TabPane tab={<span><FileTextOutlined /> Client Submission Data (Report)</span>} key="2">
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

      <Modal
        title="Log Outcome & Impact"
        visible={outcomeModalVisible}
        onCancel={() => setOutcomeModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={submitOutcome}
          initialValues={{ outcomeScore: 8 }}
        >
          <Form.Item label="Outcome Score (1-10)" name="outcomeScore" rules={[{ required: true }]}>
            <Input type="number" min={1} max={10} />
          </Form.Item>
          <Form.Item label="Financial Impact (₹)" name="financialImpact" help="Estimated savings or value generated">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Advice Summary" name="adviceSummary" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Briefly describe the key recommendation..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            Submit & Close Loop
          </Button>
        </Form>
      </Modal>

      <DocumentPreviewModal
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        fileType={previewDoc?.fileType}
      />

    </div>
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