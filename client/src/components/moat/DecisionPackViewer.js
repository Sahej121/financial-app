import React from 'react';
import { Card, Descriptions, Tag, List, Divider, Progress, Empty } from 'antd';
import {
    UserOutlined,
    DollarOutlined,
    SafetyOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import ValidationFlags from './ValidationFlags';
import './DecisionPackViewer.css';

/**
 * Decision Pack Viewer - Full view of the generated Decision Pack
 */
const DecisionPackViewer = ({ pack, loading = false }) => {
    if (!pack) {
        return (
            <Empty
                description="No Decision Pack generated yet"
                className="empty-pack"
            />
        );
    }

    const formatMoney = (value) => {
        if (!value) return '—';
        return `₹${value.toLocaleString('en-IN')}`;
    };

    return (
        <div className="decision-pack-viewer">
            {/* Header */}
            <div className="pack-header">
                <div className="pack-title">
                    <ThunderboltOutlined />
                    <h2>Decision Pack</h2>
                </div>
                <Tag color="purple">{pack.meta?.purpose?.replace('_', ' ').toUpperCase()}</Tag>
            </div>

            {/* User & Scores Summary */}
            <div className="pack-summary-row">
                <Card className="summary-card">
                    <div className="summary-icon"><UserOutlined /></div>
                    <div className="summary-content">
                        <div className="summary-label">Client</div>
                        <div className="summary-value">{pack.user?.name}</div>
                    </div>
                </Card>

                <Card className="summary-card score-card">
                    <div className="summary-icon"><SafetyOutlined /></div>
                    <div className="summary-content">
                        <div className="summary-label">Readiness Score</div>
                        <div className="summary-value">{pack.scores?.primary || 0}/100</div>
                    </div>
                    <Progress
                        percent={pack.scores?.primary || 0}
                        size="small"
                        showInfo={false}
                        strokeColor={pack.scores?.primary >= 60 ? '#52c41a' : '#faad14'}
                    />
                </Card>

                <Card className="summary-card score-card">
                    <div className="summary-icon"><CheckCircleOutlined /></div>
                    <div className="summary-content">
                        <div className="summary-label">Data Complete</div>
                        <div className="summary-value">{pack.scores?.dataCompleteness || 0}%</div>
                    </div>
                    <Progress
                        percent={pack.scores?.dataCompleteness || 0}
                        size="small"
                        showInfo={false}
                        strokeColor={pack.scores?.dataCompleteness >= 70 ? '#52c41a' : '#faad14'}
                    />
                </Card>
            </div>

            {/* Intelligence Findings (High Attention) */}
            {pack.demandIntelligence && (
                <Card
                    title={<span><ThunderboltOutlined style={{ color: '#faad14' }} /> Intelligence Findings</span>}
                    className="pack-section findings-section"
                >
                    <div className="executive-summary">
                        {pack.demandIntelligence.summary || "No executive summary available."}
                    </div>

                    <div className="nuance-tags">
                        {(pack.demandIntelligence.nuances || []).map(nuance => (
                            <Tag key={nuance} className="nuance-tag">
                                {nuance.replace(/_/g, ' ')}
                            </Tag>
                        ))}
                        {pack.demandIntelligence.urgency && (
                            <Tag color={pack.demandIntelligence.urgency === 'HIGH' ? 'red' : 'blue'}>
                                URGENCY: {pack.demandIntelligence.urgency}
                            </Tag>
                        )}
                        {pack.demandIntelligence.complexityLevel && (
                            <Tag color="purple">
                                COMPLEXITY: {pack.demandIntelligence.complexityLevel}
                            </Tag>
                        )}
                    </div>
                </Card>
            )}

            {/* Financial Snapshot */}
            <Card title="Financial Snapshot" className="pack-section">
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Monthly Income">
                        {formatMoney(pack.financialSnapshot?.income?.monthly)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Income Type">
                        <Tag>{pack.financialSnapshot?.income?.type || '—'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Monthly Savings">
                        {formatMoney(pack.financialSnapshot?.savings?.monthly)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Savings Rate">
                        {pack.financialSnapshot?.savings?.rate || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Liabilities">
                        {formatMoney(pack.financialSnapshot?.liabilities?.total)}
                    </Descriptions.Item>
                    <Descriptions.Item label="EMI/Income Ratio">
                        {pack.financialSnapshot?.expenses?.emiToIncomeRatio || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Health Insurance">
                        {pack.financialSnapshot?.insurance?.hasHealth ?
                            <Tag color="success">Yes</Tag> : <Tag color="warning">No</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Life Insurance">
                        {pack.financialSnapshot?.insurance?.hasLife ?
                            <Tag color="success">Yes</Tag> : <Tag color="warning">No</Tag>}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Strengths */}
            {pack.strengths && pack.strengths.length > 0 && (
                <Card title="Strengths" className="pack-section strengths-section">
                    <List
                        dataSource={pack.strengths}
                        renderItem={(item) => (
                            <List.Item>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                <Tag color="green">{item.category}</Tag>
                                {item.point}
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Red Flags & Warnings */}
            <Card title="Validation Results" className="pack-section">
                <ValidationFlags
                    validation={{
                        flags: [...(pack.redFlags || []), ...(pack.warnings || [])]
                    }}
                />
            </Card>

            {/* Risk Concentration */}
            {pack.riskConcentration && pack.riskConcentration.length > 0 && (
                <Card title="Risk Areas" className="pack-section">
                    <List
                        dataSource={pack.riskConcentration}
                        renderItem={(risk) => (
                            <List.Item>
                                <Tag color={risk.level === 'high' ? 'error' : 'warning'}>{risk.level}</Tag>
                                <strong>{risk.area}:</strong> {risk.detail}
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Analyst Questions */}
            {pack.recommendedQuestions && pack.recommendedQuestions.length > 0 && (
                <Card
                    title={
                        <span><QuestionCircleOutlined /> Recommended Questions for Analyst</span>
                    }
                    className="pack-section questions-section"
                >
                    <List
                        dataSource={pack.recommendedQuestions}
                        renderItem={(q, index) => (
                            <List.Item className="question-item">
                                <div className="question-number">{index + 1}</div>
                                <div className="question-content">
                                    <Tag color={q.priority === 'high' ? 'red' : q.priority === 'medium' ? 'orange' : 'blue'}>
                                        {q.topic}
                                    </Tag>
                                    <div className="question-text">{q.question}</div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Generated Timestamp */}
            <div className="pack-footer">
                Generated: {new Date(pack.meta?.generatedAt).toLocaleString()}
            </div>
        </div>
    );
};

export default DecisionPackViewer;
