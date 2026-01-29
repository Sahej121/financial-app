import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Table, Tag, Button, Upload, message, Modal, Space, Statistic, Row, Col, Progress, Alert, Spin, Descriptions, Select, Input } from 'antd';
import { InboxOutlined, FileTextOutlined, SafetyCertificateOutlined, AlertOutlined, CloudUploadOutlined, RobotOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const InsightCard = styled(Card)`
  background: rgba(20, 20, 20, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  margin-bottom: 24px;
  
  .ant-card-head-title {
    color: white;
  }
`;

const DocumentDashboard = () => {
    const { user } = useSelector(state => state.user);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [insightModalVisible, setInsightModalVisible] = useState(false);
    const [insights, setInsights] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadCategory, setUploadCategory] = useState('other');

    const categories = [
        { value: 'bank_statements', label: 'Bank Statement' },
        { value: 'tax_documents', label: 'Tax Document / ITR' },
        { value: 'financial_statements', label: 'Financial Statement (P&L/BS)' },
        { value: 'invoices', label: 'Invoice' },
        { value: 'contracts', label: 'Contract/Agreement' },
        { value: 'other', label: 'Other/General' }
    ];

    // Add professional categories if applicable
    if (user?.role === 'ca' || user?.role === 'financial_planner') {
        categories.unshift(
            { value: 'professional_report', label: '📜 Professional Report' },
            { value: 'assessment', label: '⚖️ Assessment' }
        );
    }

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/documents/user');
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Fetch docs error:', error);
            message.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    // Custom upload request to use our API service (handles base URL, headers, etc. reliably)
    const customRequest = async (options) => {
        const { onSuccess, onError, file, onProgress } = options;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadCategory); // Include selected category

        try {
            const response = await api.post('/documents/upload', formData, {
                onUploadProgress: ({ total, loaded }) => {
                    onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
                },
            });

            onSuccess(response.data);
            message.success(`${file.name} uploaded as ${uploadCategory.replace('_', ' ')}`);
            fetchDocuments(); // Refresh list immediately
        } catch (error) {
            console.error('Upload failed details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            onError({ error });
            const errorMsg = error.response?.data?.error || error.message || 'File upload failed';
            message.error(`${file.name}: ${errorMsg}`);
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        customRequest: customRequest, // Use custom request instead of action URL
        showUploadList: false,
        onChange: (info) => {
            // Only handle status updates for UI state if needed, notifications are in customRequest
            if (info.file.status === 'uploading') {
                setUploading(true);
            } else {
                setUploading(false);
            }
        },
    };

    const viewInsights = async (doc) => {
        setSelectedDocument(doc);
        setInsightModalVisible(true);
        setAnalyzing(true);
        setInsights(null);

        try {
            // First check if insights exist
            let res = await api.get(`/documents/${doc.id}/insights`);
            if (res.data.insight) {
                setInsights(res.data.insight);
            } else {
                // If not, trigger analysis (or show it's processing)
                if (doc.aiProcessingStatus === 'completed') {
                    // Should have been found, maybe fetch again
                } else {
                    // Trigger?
                    message.info('Analysis in progress or not started. Triggering.');
                    await api.post(`/documents/${doc.id}/analyze`);
                    // Poll or wait? For MVP, assume fast or wait a bit
                    setTimeout(async () => {
                        res = await api.get(`/documents/${doc.id}/insights`);
                        setInsights(res.data.insight);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Fetch insight error:', error);
            // If 404, maybe trigger analysis
            try {
                await api.post(`/documents/${doc.id}/analyze`);
                message.loading('AI is analyzing the document...', 2.5)
                    .then(async () => {
                        const res = await api.get(`/documents/${doc.id}/insights`);
                        setInsights(res.data.insight);
                    });
            } catch (e) {
                message.error('Failed to analyze document');
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const triggerManualAnalysis = async (docId) => {
        setAnalyzing(true);
        try {
            await api.post(`/documents/${docId}/analyze`);
            message.loading('AI is analyzing the document...', 2.5);
            setTimeout(async () => {
                const res = await api.get(`/documents/${docId}/insights`);
                if (res.data.insight) {
                    setInsights(res.data.insight);
                    fetchDocuments(); // Refresh list to get status
                } else {
                    message.warning('Still processing. Please check back in a moment.');
                }
                setAnalyzing(false);
            }, 3000);
        } catch (error) {
            console.error('Manual analysis error:', error);
            message.error('Failed to trigger analysis');
            setAnalyzing(false);
        }
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

    const [filterCategory, setFilterCategory] = useState('all');
    const [searchText, setSearchText] = useState('');

    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
        const matchesSearch = doc.fileName.toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const columns = [
        {
            title: 'Document Details',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <FileTextOutlined style={{ color: '#00B0F0' }} />
                        <Text style={{ color: 'white', fontWeight: 600 }}>{text}</Text>
                        {record.aiProcessingStatus === 'completed' && <Tag color="green">AI Analyzed</Tag>}
                    </Space>
                    <Space style={{ marginTop: 4 }}>
                        <Tag color={record.category.startsWith('professional') ? 'gold' : 'blue'} style={{ fontSize: '10px' }}>
                            {record.category.replace('_', ' ').toUpperCase()}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Uploaded {new Date(record.uploadedAt).toLocaleDateString()}
                        </Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<RobotOutlined />}
                        onClick={() => viewInsights(record)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                        disabled={record.category === 'professional_report' || record.category === 'assessment'}
                    >
                        Insights
                    </Button>
                    <Button
                        size="small"
                        onClick={() => handleDownload(record.id, record.fileName)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                        Download
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <DashboardContainer>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ color: 'white' }}>Financial Document Intelligence</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Upload bank statements, ITRs, and GST returns. Our AI will extract, classify, and validate financial data instantly.
                    {(user?.role === 'ca' || user?.role === 'financial_planner') && " Professionals can also upload reports and assessments."}
                </Paragraph>
            </div>

            <Row gutter={24}>
                <Col span={24}>
                    <InsightCard title="Upload New Document">
                        <div style={{ marginBottom: 20 }}>
                            <Text style={{ color: 'white', display: 'block', marginBottom: 8 }}>Select Document Category:</Text>
                            <Select
                                value={uploadCategory}
                                onChange={setUploadCategory}
                                style={{ width: 300 }}
                                dropdownStyle={{ background: '#1c1c1c' }}
                            >
                                {categories.map(cat => (
                                    <Select.Option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <Dragger {...uploadProps} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ color: '#00B0F0' }} />
                            </p>
                            <p className="ant-upload-text" style={{ color: 'white' }}>Click or drag file here</p>
                            <p className="ant-upload-hint" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Support for PDF, JPG, PNG. Category: <Tag color="blue">{uploadCategory.toUpperCase()}</Tag>
                            </p>
                        </Dragger>
                    </InsightCard>
                </Col>
            </Row>

            <InsightCard
                title="My Documents"
                bordered={false}
                extra={
                    <Space size="middle">
                        <Input.Search
                            placeholder="Search by name..."
                            onSearch={setSearchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 250 }}
                            allowClear
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={setFilterCategory}
                            dropdownStyle={{ background: '#1c1c1c' }}
                        >
                            <Select.Option value="all">All Categories</Select.Option>
                            {categories.map(cat => (
                                <Select.Option key={cat.value} value={cat.value}>{cat.label}</Select.Option>
                            ))}
                        </Select>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredDocuments}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                />
            </InsightCard>

            <Modal
                title={<Space><RobotOutlined style={{ color: '#00B0F0' }} /> AI Financial Insights</Space>}
                open={insightModalVisible}
                onCancel={() => setInsightModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setInsightModalVisible(false)}>Close</Button>,
                    !insights && !analyzing && (
                        <Button
                            key="analyze"
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={() => triggerManualAnalysis(selectedDocument?.id)}
                        >
                            Trigger Analysis
                        </Button>
                    )
                ]}
                width={800}
                style={{ top: 20 }}
            >
                {analyzing ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Analyzing document structure and extracting financial data...</p>
                    </div>
                ) : insights ? (
                    <div style={{ padding: 8 }}>
                        <Alert
                            message="Analysis Complete"
                            description={insights.summary}
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Statistic title="Confidence Score" value={insights.confidenceScore * 100} precision={1} suffix="%" />
                                <Progress percent={insights.confidenceScore * 100} size="small" status={insights.confidenceScore > 0.8 ? 'success' : 'exception'} />
                            </Col>
                            <Col span={16}>
                                <Text strong>Document Type:</Text> <Tag color="blue">{insights.insightType.toUpperCase()}</Tag>
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>Validation Status: </Text>
                                    <Tag color="green">Valid Format</Tag>
                                </div>
                            </Col>
                        </Row>

                        {insights.redFlags && insights.redFlags.length > 0 && (
                            <Card type="inner" title={<span style={{ color: '#ff4d4f' }}><AlertOutlined /> Risk Flags</span>} style={{ marginBottom: 24, borderColor: '#ff4d4f' }}>
                                <ul>
                                    {insights.redFlags.map((flag, idx) => (
                                        <li key={idx}><Text type="danger">{flag}</Text></li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        <Card type="inner" title="Extracted Financial Data" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Descriptions column={2} bordered size="small" style={{ background: 'transparent' }}>
                                {Object.entries(insights.extractedData || {}).map(([key, value]) => {
                                    if (typeof value === 'object' && value !== null) return null;
                                    return (
                                        <Descriptions.Item key={key} label={<span style={{ color: 'rgba(255,255,255,0.6)' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>}>
                                            <span style={{ color: 'white' }}>{value?.toString() || 'N/A'}</span>
                                        </Descriptions.Item>
                                    );
                                })}
                            </Descriptions>

                            {insights.extractedData?.loanEmis && insights.extractedData.loanEmis.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <Text strong style={{ color: 'white', display: 'block', marginBottom: 8 }}>Detected Loan EMIs:</Text>
                                    <Table
                                        size="small"
                                        pagination={false}
                                        dataSource={insights.extractedData.loanEmis}
                                        rowKey={(record, index) => index}
                                        columns={[
                                            { title: 'Amount', dataIndex: 'emiAmount', key: 'emiAmount', render: val => `₹${val}` },
                                            { title: 'Date', dataIndex: 'emiDate', key: 'emiDate' },
                                            { title: 'Institution', dataIndex: 'institution', key: 'institution' }
                                        ]}
                                    />
                                </div>
                            )}
                        </Card>

                        {insights.suggestedFocus && (
                            <div style={{ marginTop: 24 }}>
                                <Text strong>Analyst Focus Areas:</Text>
                                <ul>
                                    {insights.suggestedFocus.map((focus, idx) => <li key={idx}>{focus}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <p>No insights available.</p>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SyncOutlined />}
                            onClick={() => triggerManualAnalysis(selectedDocument?.id)}
                            style={{ marginTop: 16 }}
                        >
                            Run AI Analysis Now
                        </Button>
                    </div>
                )}
            </Modal>
        </DashboardContainer>
    );
};

export default DocumentDashboard;
