import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Tag, Spin, Result, Button, Space } from 'antd';
import { RobotOutlined, WarningOutlined, ThunderboltOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;

const StyledCard = styled(Card)`
  background: rgba(0, 176, 240, 0.05) !important;
  border: 1px solid rgba(0, 176, 240, 0.2) !important;
  margin-bottom: 24px;

  .ant-card-head {
     border-bottom: 1px solid rgba(0, 176, 240, 0.1);
  }
`;

const BriefingPanel = ({ submissionId }) => {
    const [loading, setLoading] = useState(false);
    const [briefing, setBriefing] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (submissionId) {
            loadBriefing();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionId]);

    const loadBriefing = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/documents/submission/${submissionId}/briefing`);
            if (res.data.success) {
                setBriefing(res.data.briefing);
            }
        } catch (err) {
            console.error('Failed to load briefing:', err);
            setError('Could not synthesize client data. Please review documents manually.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Card style={{ background: '#1c1c1c', border: '1px dashed #333', textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="AI is synthesizing documents and profile..." indicator={<ThunderboltOutlined spin style={{ fontSize: 24 }} />} />
        </Card>
    );

    if (error) return (
        <Card style={{ background: '#1c1c1c', border: '1px solid #333' }}>
            <Result
                status="warning"
                title="Analysis Paused"
                subTitle={error}
                extra={<Button icon={<ReloadOutlined />} onClick={loadBriefing}>Retry Synthesis</Button>}
            />
        </Card>
    );

    if (!briefing) return null;

    return (
        <StyledCard
            title={
                <Space>
                    <RobotOutlined style={{ color: '#00B0F0' }} />
                    <span style={{ color: '#fff' }}>AI Strategic Briefing</span>
                </Space>
            }
            extra={<Tag color="blue">{briefing._isMock ? 'MOCK' : 'LIVE AI'}</Tag>}
        >
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={5} style={{ color: '#00B0F0' }}>
                        <ThunderboltOutlined /> STRATEGY OUTLINE
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                        {typeof briefing.strategyOutline === 'object' ? JSON.stringify(briefing.strategyOutline) : briefing.strategyOutline}
                    </Paragraph>
                </Col>

                <Col span={12}>
                    <Title level={5} style={{ color: '#ff4d4f' }}>
                        <WarningOutlined /> CRITICAL RISKS
                    </Title>
                    <List
                        size="small"
                        dataSource={Array.isArray(briefing.criticalRisks) ? briefing.criticalRisks : []}
                        renderItem={item => (
                            <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.7)' }}>
                                • {typeof item === 'object' ? JSON.stringify(item) : item}
                            </List.Item>
                        )}
                    />
                </Col>

                <Col span={12}>
                    <Title level={5} style={{ color: '#faad14' }}>
                        <QuestionCircleOutlined /> QUESTIONS TO ASK
                    </Title>
                    <List
                        size="small"
                        dataSource={Array.isArray(briefing.actionPlan) ? briefing.actionPlan : []}
                        renderItem={item => (
                            <List.Item style={{ border: 'none', padding: '4px 0', color: 'rgba(255,255,255,0.7)' }}>
                                ? {typeof item === 'object' ? JSON.stringify(item) : item}
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </StyledCard>
    );
};

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -12px;
`;

const Col = styled.div`
  padding: 12px;
  flex: ${props => props.span ? `0 0 ${(props.span / 24) * 100}%` : '1'};
  max-width: ${props => props.span ? `${(props.span / 24) * 100}%` : '100%'};
`;

export default BriefingPanel;
