import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, List, Typography, Divider, Row, Col, Statistic, Tabs, Button, Spin, message } from 'antd';
import {
    DollarOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    BankOutlined,
    CheckCircleOutlined,
    ThunderboltOutlined,
    UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import BriefingPanel from './BriefingPanel';
import { DecisionReadinessCard, DecisionPackViewer, AnalystFeedbackForm } from '../moat';

const { Title } = Typography;
const { TabPane } = Tabs;

const ClientSubmissionDetail = ({ submission }) => {
    const [decisionPack, setDecisionPack] = useState(null);
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (submission?.id) {
            fetchScores();
        }
    }, [submission?.id]);

    const fetchScores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/decision-packs/${submission.id}/scores`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setScores(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    };

    const handleGeneratePack = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/decision-packs/${submission.id}/generate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setDecisionPack(response.data.data);
                setActiveTab('decision-pack');
                message.success('Decision Pack generated!');
            }
        } catch (error) {
            console.error('Error generating pack:', error);
            message.error('Failed to generate Decision Pack');
        } finally {
            setLoading(false);
        }
    };

    if (!submission) return null;

    return (
        <div style={{ padding: 24, background: 'var(--bg-primary)', minHeight: '100%' }}>
            <Title level={3} style={{ color: 'var(--text-primary)', marginBottom: 24 }}>
                <UserOutlined /> {submission.fullName}'s Profile
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                style={{ color: 'white' }}
            >
                <TabPane tab="Profile Analysis" key="profile">
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
                        <Descriptions.Item label="Purpose">
                            <Tag color="purple">{submission.planningPurpose?.replace('_', ' ').toUpperCase() || 'Investment'}</Tag>
                        </Descriptions.Item>
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
                </TabPane>

                <TabPane
                    tab={<span><ThunderboltOutlined /> Decision Intelligence</span>}
                    key="decision-pack"
                >
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <DecisionReadinessCard
                                scores={scores}
                                purpose={submission.planningPurpose}
                                onGeneratePack={handleGeneratePack}
                                loading={loading}
                            />
                        </Col>
                        <Col span={16}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 60 }}>
                                    <Spin size="large" />
                                    <p style={{ color: 'white', marginTop: 16 }}>Generating Decision Pack...</p>
                                </div>
                            ) : decisionPack ? (
                                <DecisionPackViewer pack={decisionPack} />
                            ) : (
                                <Card style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px dashed rgba(255,255,255,0.2)',
                                    textAlign: 'center',
                                    padding: 40
                                }}>
                                    <ThunderboltOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
                                    <Title level={4} style={{ color: 'white' }}>No Decision Pack Yet</Title>
                                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        Click "Generate Decision Pack" to create an AI-powered analysis.
                                    </p>
                                </Card>
                            )}
                        </Col>
                    </Row>

                    {/* Analyst Feedback Form */}
                    {decisionPack && (
                        <AnalystFeedbackForm
                            submissionId={submission.id}
                            decisionPack={decisionPack}
                            onSubmitSuccess={() => message.success('Feedback recorded for ML improvement')}
                        />
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ClientSubmissionDetail;
