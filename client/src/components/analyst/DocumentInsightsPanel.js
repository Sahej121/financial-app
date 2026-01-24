import React from 'react';
import { Card, Typography, Tag, Collapse, Badge, Table, Descriptions, Space } from 'antd';
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
                                        {Object.entries(insight.extractedData).map(([key, value]) => (
                                            <Descriptions.Item key={key} label={key.replace(/([A-Z])/g, ' $1').toUpperCase()}>
                                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                </span>
                                            </Descriptions.Item>
                                        ))}
                                    </Descriptions>

                                    {insight.summary && (
                                        <div style={{ background: 'rgba(82, 196, 26, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #52c41a' }}>
                                            <Text strong style={{ color: '#52c41a' }}>AI Summary: </Text>
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
