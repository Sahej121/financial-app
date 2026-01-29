import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Card, Row, Col, Button, Select, Upload, Table, Tag, Typography,
    message, Spin, Statistic, Alert, Progress, Collapse, Empty, Tabs
} from 'antd';
import {
    UploadOutlined, CheckCircleOutlined, WarningOutlined,
    CloseCircleOutlined, SyncOutlined, ArrowLeftOutlined,
    ExclamationCircleOutlined, FileExcelOutlined, BulbOutlined
} from '@ant-design/icons';
import gstApi from '../services/gstApi';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin-bottom: 24px;
  
  .ant-card-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  .ant-card-head-title {
    color: #fff;
  }
`;

const StatCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  text-align: center;
  
  .ant-statistic-title {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .ant-statistic-content-value {
    color: #fff;
  }
`;

const SuggestionCard = styled(Card)`
  background: ${props =>
        props.priority === 'high' ? 'rgba(255, 77, 79, 0.1)' :
            props.priority === 'medium' ? 'rgba(250, 173, 20, 0.1)' :
                'rgba(82, 196, 26, 0.1)'
    };
  border: 1px solid ${props =>
        props.priority === 'high' ? 'rgba(255, 77, 79, 0.3)' :
            props.priority === 'medium' ? 'rgba(250, 173, 20, 0.3)' :
                'rgba(82, 196, 26, 0.3)'
    };
  border-radius: 12px;
  margin-bottom: 16px;
  
  .ant-card-body {
    padding: 16px;
  }
`;

const UploadSection = styled.div`
  .ant-upload-drag {
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed rgba(0, 176, 240, 0.3);
    border-radius: 12px;
    
    &:hover {
      border-color: #00B0F0;
    }
  }
`;

const matchStatusColors = {
    matched: 'success',
    unmatched: 'default',
    partial: 'warning',
    mismatch_value: 'error',
    mismatch_tax: 'error',
    not_in_books: 'orange',
    not_in_2a: 'red'
};

const ITCReconciliation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [period, setPeriod] = useState(null);
    const [reconciliationData, setReconciliationData] = useState(null);
    const [riskAnalysis, setRiskAnalysis] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const periods = generatePeriods();

    function generatePeriods() {
        const periods = [];
        const now = dayjs();
        for (let i = 0; i < 12; i++) {
            const date = now.subtract(i, 'month');
            periods.push({
                value: date.format('MMYYYY'),
                label: date.format('MMMM YYYY')
            });
        }
        return periods;
    }

    const handleUpload = async (file, source) => {
        if (!period) {
            message.error('Please select a period first');
            return false;
        }

        try {
            setUploading(true);
            if (source === '2A') {
                await gstApi.uploadGSTR2A(file, period);
            } else {
                await gstApi.uploadGSTR2B(file, period);
            }
            message.success(`GSTR-${source} uploaded successfully`);
            loadReconciliation();
        } catch (error) {
            message.error(error.response?.data?.error || `Failed to upload GSTR-${source}`);
        } finally {
            setUploading(false);
        }
        return false;
    };

    const loadReconciliation = async () => {
        if (!period) return;

        try {
            setLoading(true);
            const data = await gstApi.getITCReconciliation(period);
            setReconciliationData(data.reconciliation);
            setRiskAnalysis(data.riskAnalysis);
            setSuggestions(data.suggestions || []);
        } catch (error) {
            if (error.response?.status !== 404) {
                message.error('Failed to load reconciliation data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (period) {
            loadReconciliation();
        }
    }, [period]);

    const matchedColumns = [
        {
            title: 'Invoice #',
            dataIndex: ['invoice', 'invoiceNumber'],
            key: 'invoiceNumber'
        },
        {
            title: 'Supplier',
            dataIndex: ['invoice', 'counterpartyName'],
            key: 'supplier',
            ellipsis: true
        },
        {
            title: 'GSTIN',
            dataIndex: ['invoice', 'counterpartyGstin'],
            key: 'gstin',
            ellipsis: true
        },
        {
            title: 'Taxable Value',
            dataIndex: ['invoice', 'totalTaxableValue'],
            key: 'taxableValue',
            align: 'right',
            render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`
        },
        {
            title: 'ITC Available',
            key: 'itc',
            align: 'right',
            render: (_, record) => {
                const itc = (record.invoice?.totalCgst || 0) +
                    (record.invoice?.totalSgst || 0) +
                    (record.invoice?.totalIgst || 0);
                return <Text style={{ color: '#52c41a' }}>₹{itc.toLocaleString('en-IN')}</Text>;
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                    Matched
                </Tag>
            )
        }
    ];

    const mismatchedColumns = [
        {
            title: 'Invoice #',
            dataIndex: ['invoice', 'invoiceNumber'],
            key: 'invoiceNumber'
        },
        {
            title: 'Supplier',
            dataIndex: ['invoice', 'counterpartyName'],
            key: 'supplier',
            ellipsis: true
        },
        {
            title: 'Books Value',
            dataIndex: ['invoice', 'totalTaxableValue'],
            key: 'booksValue',
            align: 'right',
            render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`
        },
        {
            title: '2A/2B Value',
            dataIndex: ['gstr2a', 'taxableValue'],
            key: '2aValue',
            align: 'right',
            render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`
        },
        {
            title: 'Difference',
            key: 'diff',
            align: 'right',
            render: (_, record) => {
                const diff = (record.invoice?.totalTaxableValue || 0) - (record.gstr2a?.taxableValue || 0);
                return <Text style={{ color: diff > 0 ? '#ff4d4f' : '#faad14' }}>
                    ₹{Math.abs(diff).toLocaleString('en-IN')}
                </Text>;
            }
        },
        {
            title: 'Risk',
            dataIndex: 'riskScore',
            key: 'risk',
            render: (score) => (
                <Progress
                    percent={Math.round((score || 0) * 100)}
                    size="small"
                    status={score > 0.6 ? 'exception' : score > 0.3 ? 'normal' : 'success'}
                    showInfo={false}
                    style={{ width: 60 }}
                />
            )
        }
    ];

    const notIn2AColumns = [
        {
            title: 'Invoice #',
            dataIndex: ['invoice', 'invoiceNumber'],
            key: 'invoiceNumber'
        },
        {
            title: 'Supplier',
            dataIndex: ['invoice', 'counterpartyName'],
            key: 'supplier',
            ellipsis: true
        },
        {
            title: 'GSTIN',
            dataIndex: ['invoice', 'counterpartyGstin'],
            key: 'gstin',
            ellipsis: true
        },
        {
            title: 'ITC at Risk',
            dataIndex: 'potentialITCAtRisk',
            key: 'itcAtRisk',
            align: 'right',
            render: (val) => <Text style={{ color: '#ff4d4f' }}>₹{(val || 0).toLocaleString('en-IN')}</Text>
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="link" size="small">Follow Up</Button>
            )
        }
    ];

    const summary = reconciliationData?.summary || {};

    return (
        <PageContainer>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/gst')}
                style={{ marginBottom: 16, color: 'rgba(255,255,255,0.7)' }}
            >
                Back to Dashboard
            </Button>

            <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
                <Col flex="auto">
                    <Title level={2} style={{
                        margin: 0,
                        background: 'linear-gradient(135deg, #00B0F0 0%, #00D4AA 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ITC Reconciliation
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Match your purchase invoices with GSTR-2A/2B data
                    </Text>
                </Col>
                <Col>
                    <Select
                        value={period}
                        onChange={setPeriod}
                        placeholder="Select Period"
                        style={{ width: 180 }}
                        size="large"
                    >
                        {periods.map(p => (
                            <Option key={p.value} value={p.value}>{p.label}</Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={loadReconciliation}
                        disabled={!period}
                    >
                        Refresh
                    </Button>
                </Col>
            </Row>

            {/* Upload Section */}
            <StyledCard title="Upload GSTR-2A/2B Data">
                <Row gutter={24}>
                    <Col span={12}>
                        <UploadSection>
                            <Dragger
                                name="file"
                                accept=".xlsx,.xls,.json"
                                beforeUpload={(file) => handleUpload(file, '2A')}
                                showUploadList={false}
                                disabled={!period || uploading}
                            >
                                <p className="ant-upload-drag-icon">
                                    <FileExcelOutlined style={{ fontSize: 32, color: '#00B0F0' }} />
                                </p>
                                <p className="ant-upload-text">Upload GSTR-2A</p>
                                <p className="ant-upload-hint">Excel or JSON from GST Portal</p>
                            </Dragger>
                        </UploadSection>
                    </Col>
                    <Col span={12}>
                        <UploadSection>
                            <Dragger
                                name="file"
                                accept=".xlsx,.xls,.json"
                                beforeUpload={(file) => handleUpload(file, '2B')}
                                showUploadList={false}
                                disabled={!period || uploading}
                            >
                                <p className="ant-upload-drag-icon">
                                    <FileExcelOutlined style={{ fontSize: 32, color: '#00D4AA' }} />
                                </p>
                                <p className="ant-upload-text">Upload GSTR-2B</p>
                                <p className="ant-upload-hint">Excel or JSON from GST Portal</p>
                            </Dragger>
                        </UploadSection>
                    </Col>
                </Row>
            </StyledCard>

            <Spin spinning={loading}>
                {reconciliationData ? (
                    <>
                        {/* Summary Stats */}
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col span={6}>
                                <StatCard>
                                    <Statistic
                                        title="Matched ITC"
                                        value={summary.matchedITC?.total || 0}
                                        prefix="₹"
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </StatCard>
                            </Col>
                            <Col span={6}>
                                <StatCard>
                                    <Statistic
                                        title="Mismatched ITC"
                                        value={summary.mismatchedITC?.total || 0}
                                        prefix="₹"
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </StatCard>
                            </Col>
                            <Col span={6}>
                                <StatCard>
                                    <Statistic
                                        title="ITC at Risk"
                                        value={summary.potentialLoss || 0}
                                        prefix="₹"
                                        valueStyle={{ color: '#ff4d4f' }}
                                    />
                                </StatCard>
                            </Col>
                            <Col span={6}>
                                <StatCard>
                                    <Statistic
                                        title="Match Rate"
                                        value={
                                            summary.totalInBooks > 0
                                                ? Math.round((summary.matchedITC?.total / summary.totalInBooks) * 100)
                                                : 0
                                        }
                                        suffix="%"
                                        valueStyle={{ color: '#00B0F0' }}
                                    />
                                </StatCard>
                            </Col>
                        </Row>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <StyledCard
                                title={
                                    <span>
                                        <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                        Optimization Suggestions
                                    </span>
                                }
                            >
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <SuggestionCard key={index} priority={suggestion.priority}>
                                        <Row align="middle">
                                            <Col flex="auto">
                                                <Text strong style={{ color: '#fff' }}>{suggestion.title}</Text>
                                                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: '8px 0 0' }}>
                                                    {suggestion.description}
                                                </Paragraph>
                                            </Col>
                                            {suggestion.impactAmount > 0 && (
                                                <Col>
                                                    <Statistic
                                                        value={suggestion.impactAmount}
                                                        prefix="₹"
                                                        valueStyle={{ fontSize: 18 }}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    </SuggestionCard>
                                ))}
                            </StyledCard>
                        )}

                        {/* Detailed Tables */}
                        <StyledCard>
                            <Tabs defaultActiveKey="matched">
                                <TabPane
                                    tab={
                                        <span>
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            Matched ({reconciliationData.matched?.length || 0})
                                        </span>
                                    }
                                    key="matched"
                                >
                                    <Table
                                        columns={matchedColumns}
                                        dataSource={reconciliationData.matched || []}
                                        rowKey={(r) => r.invoice?.id}
                                        pagination={{ pageSize: 10 }}
                                        locale={{ emptyText: <Empty description="No matched records" /> }}
                                    />
                                </TabPane>

                                <TabPane
                                    tab={
                                        <span>
                                            <WarningOutlined style={{ color: '#faad14' }} />
                                            Mismatched ({reconciliationData.mismatched?.length || 0})
                                        </span>
                                    }
                                    key="mismatched"
                                >
                                    <Table
                                        columns={mismatchedColumns}
                                        dataSource={reconciliationData.mismatched || []}
                                        rowKey={(r) => r.invoice?.id}
                                        pagination={{ pageSize: 10 }}
                                        locale={{ emptyText: <Empty description="No mismatched records" /> }}
                                    />
                                </TabPane>

                                <TabPane
                                    tab={
                                        <span>
                                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                            Not in 2A/2B ({reconciliationData.notIn2A?.length || 0})
                                        </span>
                                    }
                                    key="notIn2A"
                                >
                                    <Alert
                                        message="Action Required"
                                        description="These invoices are in your books but not in GSTR-2A/2B. Contact suppliers to ensure they file their returns."
                                        type="warning"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Table
                                        columns={notIn2AColumns}
                                        dataSource={reconciliationData.notIn2A || []}
                                        rowKey={(r) => r.invoice?.id}
                                        pagination={{ pageSize: 10 }}
                                        locale={{ emptyText: <Empty description="All invoices found in 2A/2B" /> }}
                                    />
                                </TabPane>
                            </Tabs>
                        </StyledCard>
                    </>
                ) : (
                    <StyledCard>
                        <Empty
                            description={
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {period
                                        ? "No reconciliation data. Upload GSTR-2A/2B to begin."
                                        : "Select a period and upload GSTR-2A/2B data to start reconciliation"
                                    }
                                </span>
                            }
                        />
                    </StyledCard>
                )}
            </Spin>
        </PageContainer>
    );
};

export default ITCReconciliation;
