import React from 'react';
import { Card, Descriptions, Tag, List, Typography, Divider, Row, Col, Statistic } from 'antd';
import {
    DollarOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    BankOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import BriefingPanel from './BriefingPanel';

const { Title } = Typography;

const ClientSubmissionDetail = ({ submission }) => {
    if (!submission) return null;

    return (
        <div style={{ padding: 24, background: 'var(--bg-primary)', minHeight: '100%' }}>
            <Title level={3} style={{ color: 'var(--text-primary)', marginBottom: 24 }}>Client Profile Analysis</Title>

            {/* AI Synthesized Briefing */}
            <BriefingPanel submissionId={submission.id} />

            {/* High Level Snapshot */}
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card bordered={false} style={{ background: 'var(--bg-card)' }}>
                        <Statistic
                            title={<span style={{ color: 'var(--text-secondary)' }}>Net Worth (Est.)</span>}
                            value={submission.netWorthSnapshot?.total || 'N/A'}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: 'var(--success-color)' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: 'var(--bg-card)' }}>
                        <Statistic
                            title={<span style={{ color: 'var(--text-secondary)' }}>Risk Score</span>}
                            value={submission.riskScore || 'N/A'}
                            suffix="/ 100"
                            prefix={<SafetyCertificateOutlined />}
                            valueStyle={{ color: 'var(--secondary-color)' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: 'var(--bg-card)' }}>
                        <Statistic
                            title={<span style={{ color: 'var(--text-secondary)' }}>Timeline</span>}
                            value={submission.targetTimeline || 'N/A'}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: 'var(--primary-color)' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <Descriptions title={<span style={{ color: 'var(--text-primary)' }}>Core Identification</span>} layout="vertical" bordered size="small" column={2}>
                <Descriptions.Item label="Target Amount">₹{submission.targetAmount}</Descriptions.Item>
                <Descriptions.Item label="Time Horizon">{submission.achievementTimeline?.replace('_', ' ')}</Descriptions.Item>
                <Descriptions.Item label="Income Type">{submission.incomeType?.replace('_', ' ').toUpperCase()} ({submission.monthlyIncome})</Descriptions.Item>
            </Descriptions>

            <br />

            <Descriptions title={<span style={{ color: 'var(--text-primary)' }}>Risk & Constraints</span>} layout="vertical" bordered size="small" column={2}>
                <Descriptions.Item label="Reaction to Drop">{submission.riskReaction}</Descriptions.Item>
                <Descriptions.Item label="Preference">{submission.riskPreference}</Descriptions.Item>
                <Descriptions.Item label="Avoided Assets">
                    {submission.avoidedInvestments?.map(a => <Tag key={a} color="red">{a}</Tag>)}
                </Descriptions.Item>
                <Descriptions.Item label="Liquidity Need">{submission.liquidityNeeds ? <Tag color="orange">HIGH</Tag> : 'Standard'}</Descriptions.Item>
            </Descriptions>

            <br />

            <Title level={4} style={{ color: 'var(--text-primary)' }}>Assets & Liabilities</Title>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card size="small" title="Assets" style={{ background: 'var(--bg-card)', borderColor: 'transparent' }} headStyle={{ color: 'var(--text-primary)' }}>
                        <List
                            dataSource={Object.entries(submission.assets || {}).filter(([k, v]) => v)}
                            renderItem={([key, val]) => (
                                <List.Item>
                                    <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                                    <Tag color="green"><CheckCircleOutlined /></Tag>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card size="small" title="Liabilities" style={{ background: 'var(--bg-card)', borderColor: 'transparent' }} headStyle={{ color: 'var(--text-primary)' }}>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Outstanding: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>₹{submission.totalLiabilityAmount || 0}</strong>
                        </div>
                        <List
                            dataSource={submission.liabilities || []}
                            renderItem={item => (
                                <List.Item>
                                    <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <br />

            <Descriptions title={<span style={{ color: 'var(--text-primary)' }}>Tax & Protection</span>} layout="vertical" bordered size="small" column={2}>
                <Descriptions.Item label="Health Insurance">{submission.hasHealthInsurance ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}</Descriptions.Item>
                <Descriptions.Item label="Life Insurance">{submission.hasLifeInsurance ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}</Descriptions.Item>
                <Descriptions.Item label="Tax Bracket">{submission.taxBracket}</Descriptions.Item>
                <Descriptions.Item label="Residency">{submission.taxResidency}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default ClientSubmissionDetail;
