import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Space, Avatar, message, Modal, Form, Select, Input } from 'antd';
import { UserOutlined, VideoCameraOutlined, EyeOutlined, EditOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, documentsRes] = await Promise.all([
        api.get('/meetings/professional?role=ca&upcoming=true'),
        api.get('/documents/pending?role=ca')
      ]);

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
      title: 'Type',
      dataIndex: 'reason', // CA meetings usuall have 'reason' or similar
      render: (reason) => <Tag color="blue">{reason || 'Consultation'}</Tag>
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
      title: 'Priority',
      dataIndex: 'priority',
      render: (p) => <Tag color={p === 'urgent' ? 'red' : 'blue'}>{p.toUpperCase()}</Tag>
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => window.open(`/api/documents/${record.id}/download`, '_blank')} />
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => { setSelectedDocument(record); setReviewModalVisible(true); }} />
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

    </DashboardContainer>
  );
};

export default CADashboard;