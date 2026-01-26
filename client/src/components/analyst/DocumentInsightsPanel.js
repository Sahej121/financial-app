import React from 'react';
import { Card, Typography, Tag, Collapse, Badge, Table, Descriptions, Space, Tooltip, message } from 'antd';
import { FilePdfOutlined, FileImageOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Panel } = Collapse;
const { Text } = Typography;

const InsightCard = styled(Card)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  .ant-collapse {
    background: transparent;
    border: none;
  }
  
  .ant-collapse-header {
    color: white !important;
  }
`;

const DocumentInsightsPanel = ({ documents, insights }) => {
    const getInsightForDoc = (docId) => insights.find(i => i.documentId === docId);

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Typography.Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
                <RobotOutlined style={{ marginRight: '8px' }} /> Document Intelligence
            </Typography.Title>

            <Collapse ghost expandIconPosition="right">
                {documents.map(doc => {
                    const insight = getInsightForDoc(doc.id);
                    const isDocImage = doc.fileType?.startsWith('image/');

                    return (
                        <Panel
                            key={doc.id}
                            header={
                                <Space size="middle">
                                    {isDocImage ? <FileImageOutlined /> : <FilePdfOutlined />}
                                    <Text style={{ color: 'white' }}>{doc.fileName}</Text>
                                    {insight ? (
                                        <Tag color="#52c41a">AI Analyzed</Tag>
                                    ) : (
                                        <Tag color="orange">Analysis Pending</Tag>
                                    )}
                                    {insight?.confidenceScore && (
                                        <Badge count={`${Math.round(insight.confidenceScore * 100)}% Match`} style={{ backgroundColor: '#1890ff' }} />
                                    )}
                                </Space>
                            }
                        >
                            {insight ? (
                                <div style={{ padding: '0 12px' }}>
                                    <Descriptions column={2} bordered size="small" style={{ marginBottom: '16px' }}>
                                        {Object.entries(insight.extractedData).map(([key, value]) => {
                                            const highlight = insight.highlights?.[key];

                                            // Formatters for high-value professional fields
                                            let displayValue = value;
                                            if (key.toLowerCase().includes('total') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('emi')) {
                                                displayValue = typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value;
                                            }

                                            if (key === 'revenueTrend') {
                                                displayValue = (
                                                    <Space>
                                                        {value === 'up' ? <Tag color="green">GROWING ↑</Tag> : value === 'down' ? <Tag color="red">DECLINING ↓</Tag> : <Tag color="blue">STABLE</Tag>}
                                                    </Space>
                                                );
                                            }

                                            if (key === 'incomeSources' || key === 'gstMismatchFlags' || Array.isArray(value)) {
                                                displayValue = Array.isArray(value) ? value.join(', ') : value;
                                            }

                                            if (key === 'loanEmis' && Array.isArray(value)) {
                                                displayValue = value.map((v, i) => `${v.lender}: ₹${v.amount}`).join(' | ');
                                            }

                                            return (
                                                <Descriptions.Item
                                                    key={key}
                                                    label={
                                                        <Space>
                                                            {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                                            {highlight && (
                                                                <Tooltip title={`Source: "${highlight.text}"`}>
                                                                    <Tag
                                                                        color="blue"
                                                                        style={{ cursor: 'pointer', scale: '0.8' }}
                                                                        onClick={() => {
                                                                            if (highlight.page) {
                                                                                window.open(`/api/documents/${doc.id}/download#page=${highlight.page}`, '_blank');
                                                                            } else {
                                                                                message.info(`Source: "${highlight.text}"`);
                                                                            }
                                                                        }}
                                                                    >
                                                                        SRC
                                                                    </Tag>
                                                                </Tooltip>
                                                            )}
                                                        </Space>
                                                    }
                                                >
                                                    <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : displayValue}
                                                    </span>
                                                </Descriptions.Item>
                                            );
                                        })}
                                    </Descriptions>

                                    {insight.redFlags && insight.redFlags.length > 0 && (
                                        <div style={{ background: 'rgba(255, 77, 79, 0.05)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #ff4d4f', marginBottom: '12px' }}>
                                            <Text strong style={{ color: '#ff4d4f' }}>🚨 Risk Red Flags:</Text>
                                            <ul style={{ color: 'white', marginTop: '4px', paddingLeft: '20px' }}>
                                                {insight.redFlags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {insight.summary && (
                                        <div style={{ background: 'rgba(82, 196, 26, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #52c41a' }}>
                                            <Text strong style={{ color: '#52c41a' }}>AI Intelligence Report: </Text>
                                            <Text style={{ color: 'white' }}>{insight.summary}</Text>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Text type="secondary">Waiting for AI to process this document...</Text>
                            )}
                        </Panel>
                    );
                })}
            </Collapse>
        </Space>
    );
};

export default DocumentInsightsPanel;
