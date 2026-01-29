import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Table, Tag, Button, Upload, message, Modal, Space, Statistic, Row, Col, Progress, Alert, Spin, List, Avatar } from 'antd';
import { CameraOutlined, WalletOutlined, ShoppingCartOutlined, RestOutlined, ThunderboltOutlined, DeleteOutlined, RobotOutlined, PieChartOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

const MonitorContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const AdviceCard = styled(Card)`
  background: rgba(0, 176, 240, 0.05) !important;
  border: 1px solid rgba(0, 176, 240, 0.2) !important;
  border-radius: 12px;
  
  .ant-card-body {
    padding: 16px;
  }
`;

const StyledTable = styled(Table)`
  .ant-table {
    background: transparent !important;
    color: white !important;
  }
  .ant-table-thead > tr > th {
    background: rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.6) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
  .ant-table-tbody > tr:hover > td {
    background: rgba(255, 255, 255, 0.02) !important;
  }
`;

const WealthMonitor = () => {
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/wealth-monitor/entries');
            setEntries(response.data.entries);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to load wealth data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('receipt', file);
        setUploading(true);

        try {
            await api.post('/wealth-monitor/upload', formData);
            message.success('Receipt analyzed successfully!');
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to analyze receipt');
        } finally {
            setUploading(false);
        }
        return false; // Prevent default upload behavior
    };

    const deleteEntry = async (id) => {
        try {
            await api.delete(`/wealth-monitor/${id}`);
            message.success('Entry removed');
            fetchData();
        } catch (error) {
            message.error('Failed to delete');
        }
    };

    const columns = [
        {
            title: 'Purchase',
            dataIndex: 'merchantName',
            key: 'merchantName',
            render: (text, record) => (
                <Space>
                    <Avatar
                        icon={record.category === 'Food' ? <RestOutlined /> : <ShoppingCartOutlined />}
                        style={{ backgroundColor: record.isAvoidable ? 'rgba(255, 77, 79, 0.2)' : 'rgba(82, 196, 26, 0.2)', border: 'none' }}
                    />
                    <div>
                        <Text strong style={{ color: 'white' }}>{text}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>{new Date(record.date).toLocaleDateString()}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: val => <Text style={{ color: 'white' }}>₹{val.toLocaleString()}</Text>
        },
        {
            title: 'Analysis',
            key: 'analysis',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color={record.isAvoidable ? 'error' : 'success'}>
                        {record.isAvoidable ? 'Avoidable' : 'Essential'}
                    </Tag>
                    {record.itrRelevance !== 'None' && record.itrRelevance && (
                        <Tag color="blue" style={{ marginTop: 4 }}>{record.itrRelevance}</Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'AI Advice',
            dataIndex: 'aiAdvice',
            key: 'aiAdvice',
            width: '30%',
            render: text => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteEntry(record.id)}
                />
            )
        }
    ];

    return (
        <MonitorContainer>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ color: 'white' }}>Wealth Monitor</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Snapshot your bills to track spending patterns and receive AI insights on wealth optimization.
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                    <Card style={{ background: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }} title={<span style={{ color: 'white' }}>Expense History</span>}>
                        <StyledTable
                            loading={loading}
                            columns={columns}
                            dataSource={entries}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <Card style={{ background: 'rgba(0, 176, 240, 0.1)', border: '1px dashed #00B0F0' }}>
                            <Upload beforeUpload={handleUpload} showUploadList={false}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CameraOutlined />}
                                    block
                                    loading={uploading}
                                    style={{ height: '60px', fontSize: '18px' }}
                                >
                                    Scan New Receipt
                                </Button>
                            </Upload>
                        </Card>

                        {stats && (
                            <Card style={{ background: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }} title={<span style={{ color: 'white' }}>Wealth Health</span>}>
                                <Statistic
                                    title={<span style={{ color: 'rgba(255,255,255,0.45)' }}>Total Tracked</span>}
                                    value={stats.totalSpent}
                                    prefix="₹"
                                    valueStyle={{ color: 'white' }}
                                />
                                <div style={{ marginTop: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text type="secondary">Avoidable Spending</Text>
                                        <Text danger>{Math.round(stats.avoidablePercentage)}%</Text>
                                    </div>
                                    <Progress
                                        percent={Math.round(stats.avoidablePercentage)}
                                        status="active"
                                        strokeColor="#ff4d4f"
                                        trailColor="rgba(255,255,255,0.05)"
                                    />
                                    <div style={{ marginTop: 12 }}>
                                        <Text type="danger" style={{ fontSize: '13px' }}>
                                            ₹{stats.avoidableSpent.toLocaleString()} could have been saved/invested.
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <AdviceCard>
                            <Space align="start">
                                <RobotOutlined style={{ color: '#00B0F0', fontSize: '24px' }} />
                                <div>
                                    <Text strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>Smart Wealth Tip</Text>
                                    <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>
                                        {stats?.avoidablePercentage > 20
                                            ? "Your luxury spending is slightly high this month. Consider moving 'Avoidable' funds into your Debt-Repayment SIP."
                                            : "Great job! Your spending is focused on essentials. Keep maintaining this surplus for your long-term goals."}
                                    </Paragraph>
                                </div>
                            </Space>
                        </AdviceCard>
                    </Space>
                </Col>
            </Row>
        </MonitorContainer>
    );
};

export default WealthMonitor;
