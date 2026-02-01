import React from 'react';
import { Card, Row, Col, Typography, Tag, Space, List, Statistic, Alert, Divider } from 'antd';
import {
    FileSearchOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    DollarCircleOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title } = Typography;

const SnapshotCard = styled(Card)`
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  
  .ant-card-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .ant-card-head-title {
    color: white !important;
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
`;


const ClientSnapshot = ({ insights, decisionPack, loading }) => {
    if (loading) return <Card loading={true} />;
    const hasInsights = insights && insights.length > 0;
    const hasDecisionPack = decisionPack && decisionPack.scores;

    if (!hasInsights && !hasDecisionPack) {
        return (
            <SnapshotCard>
                <Alert
                    message="No AI Insights Available"
                    description="Documents for this consultation haven't been analyzed yet or were recently uploaded."
                    type="info"
                    showIcon
                />
            </SnapshotCard>
        );
    }

    // Aggregate insights from multiple sources
    // Decision Pack is primary, document insights are supplementary

    // Red Flags
    const packRedFlags = decisionPack?.redFlags?.map(f => f.detail || f) || [];
    const docRedFlags = insights?.flatMap(i => i.redFlags || []) || [];
    const allRedFlags = [...packRedFlags, ...docRedFlags];

    // Recommended Focus
    const packQuestions = decisionPack?.recommendedQuestions?.map(q => q.question) || [];
    const docFocus = insights?.flatMap(i => i.suggestedFocus || []) || [];
    const allSuggestedFocus = [...packQuestions, ...docFocus];

    // Financial Metrics - Prefer Decision Pack
    const metrics = {
        avgMonthlyBalance: decisionPack?.financialSnapshot?.savings?.monthly ||
            (insights?.find(i => i.insightType === 'bank_statement')?.extractedData?.avgMonthlyBalance) || 0,
        incomeStability: decisionPack?.financialSnapshot?.income?.stability ?
            (decisionPack.financialSnapshot.income.stability === 'very_stable' ? 'High (Stable)' : 'Variable') :
            (insights?.find(i => i.insightType === 'bank_statement')?.extractedData?.salaryDetected ? 'High (Salary)' : 'Not Detected'),
        obligations: decisionPack?.financialSnapshot?.expenses?.emi ||
            (insights?.find(i => i.insightType === 'bank_statement')?.extractedData?.emiCount || 0)
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <SnapshotCard
                title={
                    <Space>
                        <DashboardOutlined style={{ color: '#52c41a' }} />
                        <span>AI Client Intelligence Snapshot</span>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <MetricCard>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>Avg Monthly Savings</span>}
                                value={metrics.avgMonthlyBalance}
                                prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: 'white', fontWeight: 800 }}
                            />
                        </MetricCard>
                    </Col>
                    <Col xs={24} md={8}>
                        <MetricCard>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>Income Stability</span>}
                                value={metrics.incomeStability}
                                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: 'white', fontWeight: 800, fontSize: '18px' }}
                            />
                        </MetricCard>
                    </Col>
                    <Col xs={24} md={8}>
                        <MetricCard>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>Monthly Obligations (EMI)</span>}
                                value={metrics.obligations}
                                prefix={<InfoCircleOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: 'white', fontWeight: 800 }}
                            />
                        </MetricCard>
                    </Col>
                </Row>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <Title level={5} style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <WarningOutlined /> Risk Factors & Red Flags
                        </Title>
                        <List
                            dataSource={allRedFlags}
                            renderItem={item => (
                                <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.8)' }}>
                                    • {typeof item === 'object' ? JSON.stringify(item) : item}
                                </List.Item>
                            )}
                        />
                    </Col>

                    <Col xs={24} lg={12}>
                        <Title level={5} style={{ color: '#1890ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileSearchOutlined /> Recommended Call Focus
                        </Title>
                        <List
                            dataSource={allSuggestedFocus}
                            renderItem={item => (
                                <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.8)' }}>
                                    • {typeof item === 'object' ? JSON.stringify(item) : item}
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
            </SnapshotCard>
        </Space>
    );
};

export default ClientSnapshot;
