import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input, Popover, Descriptions, Badge, Typography, Statistic, List, Divider, Card, DatePicker, Radio } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined, RobotOutlined, InfoCircleOutlined, WarningOutlined, SafetyCertificateOutlined, FileTextOutlined, CheckCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import moment from 'moment';
import api from '../../services/api';
import ClientSnapshot from '../analyst/ClientSnapshot';
import DocumentInsightsPanel from '../analyst/DocumentInsightsPanel';
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
const { Text, Title } = Typography;

const CADashboard = () => {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, documentsRes, logsRes] = await Promise.all([
        api.get('/meetings/professional?role=ca&upcoming=true'),
        api.get('/documents/pending?role=ca'),
        api.get('/activity-logs?limit=8')
      ]);

      setActivityLogs(logsRes.data.logs || []);

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
      // Assuming submissionId is linked to meeting or requires specific lookup
      // For now, fetching by submissionId if it exists in meeting
      const res = await api.get(`/documents/submission/${meeting.submissionId}/snapshot`);
      setSelectedMeetingInsights(res.data.insights || []);
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

  const handleViewDocument = async (docId, fileName) => {
    try {
      message.loading({ content: 'Opening document...', key: 'docView' });
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));

      window.open(url, '_blank');
      message.success({ content: 'Document opened', key: 'docView', duration: 2 });

      // Auto-revoke after some time to manage memory
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('View error:', error);
      message.error({ content: 'Failed to open document', key: 'docView' });
    }
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
    radius: 0.8,
    innerRadius: 0.6,
    color: ['#107C10', '#F2C811', '#D13438', '#00B0F0'],
    legend: { position: 'bottom', itemHeight: 20 }
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
                {record.industry?.toUpperCase() || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Turnover">
                {record.turnoverBand?.replace('_', ' ').toUpperCase() || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Income">
                {Array.isArray(record.incomeSources) ? record.incomeSources.join(', ') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Method">
                {record.accountingMethod?.toUpperCase() || 'N/A'}
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
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
    },
    {
      title: 'Client',
      dataIndex: 'owner',
      render: (owner) => owner?.name
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (p) => <Tag color={p === 'urgent' ? 'red' : 'blue'}>{p.toUpperCase()}</Tag>
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
            onClick={() => handleViewDocument(record.id, record.fileName)}
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
        <h1>CA Workspace</h1>
        <div className="actions">
          <ActionButton onClick={loadDashboardData}><ReloadOutlined /> Refresh</ActionButton>
          <ActionButton>GST Report</ActionButton>
        </div>
      </Header>

      <GridContainer>
        <Col span={8}>
          <KPICard title="Pending Reviews" trend={-1} color="#F2C811">
            <div className="kpi-value">{data.stats.pendingReviews}</div>
            <div className="kpi-trend">Requires attention</div>
          </KPICard>
        </Col>
        <Col span={8}>
          <KPICard title="Scheduled Meetings" trend={1} color="#00B0F0">
            <div className="kpi-value">{data.stats.scheduledMeetings}</div>
            <div className="kpi-trend">For this week</div>
          </KPICard>
        </Col>
        <Col span={8}>
          <KPICard title="Urgent Documents" trend={-1} color="#D13438">
            <div className="kpi-value">{data.stats.urgentAttention}</div>
            <div className="kpi-trend">High Priority</div>
          </KPICard>
        </Col>
      </GridContainer>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ChartContainer title="Weekly Activity (Meetings)">
            <Column {...meetingsChartConfig} height={250} />
          </ChartContainer>
        </Col>
        <Col span={12}>
          <ChartContainer title="Document Status">
            <Pie {...docStatusConfig} height={250} />
          </ChartContainer>
        </Col>

        <Col span={12}>
          <TableContainer title="Upcoming Consultations">
            <Table
              dataSource={data.meetings.slice(0, 5)}
              columns={meetingColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </TableContainer>
        </Col>
        <Col span={12}>
          <TableContainer title="Document Review Queue">
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

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <TableContainer title="⚡ Real-time Client Activity Feed">
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
          </TableContainer>
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
              <Title level={5} style={{ color: 'white', margin: 0 }}>{selectedBriefing.objective}</Title>
            </div>

            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col span={8}>
                <Card size="small" style={{ background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.45)' }}>TOTAL CREDITS</span>}
                    value={selectedBriefing.snapshot.totalCredits}
                    precision={0}
                    prefix="₹"
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.45)' }}>AVG BALANCE</span>}
                    value={selectedBriefing.snapshot.avgMonthlyBalance}
                    precision={0}
                    prefix="₹"
                    valueStyle={{ color: '#faad14', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.45)' }}>GROWTH TREND</span>}
                    value={selectedBriefing.snapshot.revenueTrend}
                    valueStyle={{ color: '#00B0F0', fontSize: '16px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

            <div style={{ marginBottom: '20px' }}>
              <Text strong style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', display: 'block', marginBottom: '10px' }}>PRE-PROCESSED RISK MATRIX</Text>
              <Space wrap>
                {selectedBriefing.riskMatrix.map((risk, idx) => (
                  <Tag
                    key={idx}
                    color={risk.status === 'RED' ? '#ff4d4f' : risk.status === 'ORANGE' ? '#fa8c16' : risk.status === 'YELLOW' ? '#fadb14' : '#52c41a'}
                    style={{ borderRadius: '4px', fontWeight: 600 }}
                  >
                    {risk.label}
                  </Tag>
                ))}
              </Space>
            </div>

            {selectedBriefing.missingDocs.length > 0 && (
              <div style={{ marginBottom: '20px', background: 'rgba(255,77,79,0.05)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #ff4d4f' }}>
                <Text strong style={{ color: '#ff4d4f' }}>⚠️ MISSING CRITICAL DATA:</Text>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
                  {selectedBriefing.missingDocs.join(', ')}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
              <Text strong style={{ color: '#52c41a', fontSize: '12px', display: 'block', marginBottom: '8px' }}>🚀 SUGGESTED CALL AGENDA</Text>
              <List
                size="small"
                dataSource={selectedBriefing.agenda}
                renderItem={(item, idx) => (
                  <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.85)' }}>
                    • {item}
                  </List.Item>
                )}
              />
            </div>

            <div style={{ background: 'rgba(0,176,240,0.05)', padding: '16px', borderRadius: '12px', marginTop: '16px', border: '1px dashed rgba(0,176,240,0.3)' }}>
              <Text strong style={{ color: '#00B0F0', fontSize: '12px', display: 'block', marginBottom: '8px' }}>🤖 AI-GENERATED DIAGNOSTIC QUESTIONS</Text>
              <List
                size="small"
                dataSource={selectedBriefing.diagnosticQuestions}
                renderItem={(item, idx) => (
                  <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.7)' }}>
                    {idx + 1}. {item}
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span style={{ color: 'white' }}>Post-Call Engagement & Quote</span>
          </Space>
        }
        visible={completionModalVisible}
        onCancel={() => setCompletionModalVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ background: '#141414', color: 'white', padding: '24px' }}
      >
        <Form
          form={completionForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await api.patch(`/meetings/${selectedMeetingForCompletion.id}/status`, {
                ...values,
                status: 'completed'
              });
              message.success('Case engagement formalized successfully');
              setCompletionModalVisible(false);
              loadDashboardData();
              completionForm.resetFields();
            } catch (e) {
              message.error('Failed to formalize engagement');
            }
          }}
        >
          <Form.Item
            name="finalFee"
            label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>💰 Confirmed Professional Fee (INR)</span>}
            rules={[{ required: true, message: 'Please enter the final quote' }]}
          >
            <Input type="number" prefix="₹" placeholder="e.g. 5000" size="large" />
          </Form.Item>

          <Form.Item
            name="engagementScope"
            label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>📋 Engagement Scope</span>}
            rules={[{ required: true }]}
          >
            <Select placeholder="Select engagement mode" size="large">
              <Select.Option value="one_time">One-time Task Execution</Select.Option>
              <Select.Option value="monthly_managed">Monthly Managed Service (Retainer)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="pendingStatus"
            label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>🚦 Current Dependency</span>}
            initialValue="none"
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="none">None</Radio.Button>
              <Radio.Button value="client_pending" style={{ background: 'transparent', color: '#faad14' }}>Client Pending</Radio.Button>
              <Radio.Button value="ca_pending" style={{ background: 'transparent', color: '#00B0F0' }}>CA Pending</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nextFollowUp"
                label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>📅 Next Follow-up Date</span>}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }}>📝 Structured Deliverables</Divider>

          <Form.List name="deliverables">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name]}
                      rules={[{ required: true, message: 'Missing deliverable' }]}
                    >
                      <Input placeholder="e.g. GST Filing for Oct" style={{ width: '450px' }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Add Deliverable
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }}>🏁 Key Milestones</Divider>

          <Form.List name="milestones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing milestone description' }]}
                    >
                      <Input placeholder="Milestone description" style={{ width: '300px' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dueDate']}
                    >
                      <DatePicker placeholder="Due Date" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Add Milestone
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="engagementNotes"
            label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>🖋️ Final Engagement Terms</span>}
          >
            <TextArea
              rows={3}
              placeholder="Outline any additional terms or context agreed during the call..."
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" style={{ background: '#52c41a', border: 'none', marginTop: '12px', height: '48px', fontWeight: 600 }}>
            Categorize Case & Close Consultation
          </Button>
        </Form>
      </Modal>

    </DashboardContainer>
  );
};

export default CADashboard;