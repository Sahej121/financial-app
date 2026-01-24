import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Table, Tag, Button, Upload, message, Modal, Space, Statistic, Row, Col, Progress, Alert, Spin } from 'antd';
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
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [insightModalVisible, setInsightModalVisible] = useState(false);
    const [insights, setInsights] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // We don't need token selector for manual headers anymore
    // const { token } = useSelector(state => state.user);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // For MVP, CAs and Analysts uploading documents for themselves (e.g. verification) 
            // should seemingly use 'documents/user'.
            // If they are viewing CLIENT documents, that would be a different dashboard (e.g. Pending Reviews).
            // Since this is the "Document Dashboard" for the logged-in user:
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

        try {
            const response = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: ({ total, loaded }) => {
                    onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
                },
            });

            onSuccess(response.data);
            message.success(`${file.name} file uploaded successfully.`);
            fetchDocuments(); // Refresh list immediately
        } catch (error) {
            console.error('Upload failed:', error);
            onError({ error });
            message.error(`${file.name} file upload failed.`);
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

    const columns = [
        {
            title: 'Document Name',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text, record) => (
                <Space>
                    <FileTextOutlined />
                    <Text style={{ color: 'white' }}>{text}</Text>
                    {record.aiProcessingStatus === 'completed' && <Tag color="green">AI Analyzed</Tag>}
                    {record.aiProcessingStatus === 'processing' && <Tag color="blue" icon={<SyncOutlined spin />}>Processing</Tag>}
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: text => <Tag>{text?.toUpperCase() || 'UNCATEGORIZED'}</Tag>
        },
        {
            title: 'Uploaded At',
            dataIndex: 'uploadedAt',
            key: 'uploadedAt',
            render: text => new Date(text).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<RobotOutlined />}
                        onClick={() => viewInsights(record)}
                    >
                        Insights
                    </Button>
                    <Button size="small" href={`/api/documents/${record.id}/download`}>Download</Button>
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
                </Paragraph>
            </div>

            <Row gutter={24}>
                <Col span={24}>
                    <InsightCard title="Document Upload">
                        <Dragger {...uploadProps} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ color: '#00B0F0' }} />
                            </p>
                            <p className="ant-upload-text" style={{ color: 'white' }}>Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Support for PDF, JPG, PNG. Securely encrypted and processed.
                            </p>
                        </Dragger>
                    </InsightCard>
                </Col>
            </Row>

            <InsightCard title="My Documents" bordered={false}>
                <Table
                    columns={columns}
                    dataSource={documents}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                />
            </InsightCard>

            <Modal
                title={<Space><RobotOutlined style={{ color: '#00B0F0' }} /> AI Financial Insights</Space>}
                open={insightModalVisible}
                onCancel={() => setInsightModalVisible(false)}
                footer={[<Button key="close" onClick={() => setInsightModalVisible(false)}>Close</Button>]}
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

                        <Card type="inner" title="Extracted Financial Data">
                            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
                                {JSON.stringify(insights.extractedData, null, 2)}
                            </pre>
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
                        <p>No insights available. Please trigger analysis.</p>
                    </div>
                )}
            </Modal>
        </DashboardContainer>
    );
};

export default DocumentDashboard;
