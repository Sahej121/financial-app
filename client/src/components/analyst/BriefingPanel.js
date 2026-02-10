import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, List, Tag, Spin, Result, Button, Space, Tabs, Input, Avatar, Empty } from 'antd';
import { RobotOutlined, WarningOutlined, ThunderboltOutlined, QuestionCircleOutlined, ReloadOutlined, SendOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../services/api';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  background: rgba(0, 176, 240, 0.05) !important;
  border: 1px solid rgba(0, 176, 240, 0.2) !important;
  margin-bottom: 24px;

  .ant-card-head {
     border-bottom: 1px solid rgba(0, 176, 240, 0.1);
  }
  
  .ant-tabs-nav {
      margin-bottom: 16px;
  }
  .ant-tabs-tab {
      color: rgba(255,255,255,0.6);
  }
  .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #00B0F0 !important;
  }
  .ant-tabs-ink-bar {
      background: #00B0F0;
  }
`;

const ChatContainer = styled.div`
    height: 400px;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
`;

const MessageList = styled.div`
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;
    padding-right: 8px;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
    }
`;

const MessageBubble = styled.div`
    display: flex;
    margin-bottom: 16px;
    justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const BubbleContent = styled.div`
    max-width: 80%;
    background: ${props => props.isUser ? '#00B0F0' : 'rgba(255,255,255,0.1)'};
    color: white;
    padding: 10px 14px;
    border-radius: 12px;
    border-top-right-radius: ${props => props.isUser ? '2px' : '12px'};
    border-top-left-radius: ${props => props.isUser ? '12px' : '2px'};
    font-size: 14px;
    line-height: 1.5;
`;

const BriefingPanel = ({ submissionId }) => {
    const [loading, setLoading] = useState(false);
    const [briefing, setBriefing] = useState(null);
    const [error, setError] = useState(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState([
        { role: 'system', content: 'I have analyzed the documents. Ask me anything about the client\'s finances.' }
    ]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (submissionId) {
            loadBriefing();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setChatMessages(prev => [...prev, userMsg]);
        setInput('');
        setChatLoading(true);

        try {
            const res = await api.post('/documents/submission/rag/query', {
                submissionId,
                query: userMsg.content
            });

            if (res.data.success) {
                const aiMsg = {
                    role: 'assistant',
                    content: res.data.answer,
                    citations: res.data.citations
                };
                setChatMessages(prev => [...prev, aiMsg]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error searching the documents.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the document brain.' }]);
        } finally {
            setChatLoading(false);
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
            <Tabs defaultActiveKey="briefing">
                <TabPane tab="Strategy & Risks" key="briefing">
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
                </TabPane>

                <TabPane tab="Ask Documents (RAG)" key="chat">
                    <ChatContainer>
                        <MessageList>
                            {chatMessages.map((msg, idx) => (
                                <MessageBubble key={idx} isUser={msg.role === 'user'}>
                                    {!msg.isUser && (
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            size="small"
                                            style={{ background: '#00B0F0', marginRight: 8, marginTop: 4 }}
                                        />
                                    )}
                                    <div style={{ maxWidth: '85%' }}>
                                        <BubbleContent isUser={msg.role === 'user'}>
                                            {msg.content}
                                        </BubbleContent>
                                        {msg.citations && msg.citations.length > 0 && (
                                            <div style={{ marginTop: 4, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                <Space size={4}>
                                                    <FileTextOutlined />
                                                    Sources: {msg.citations.map(c => c).join(', ')}
                                                </Space>
                                            </div>
                                        )}
                                    </div>
                                    {msg.isUser && (
                                        <Avatar
                                            icon={<UserOutlined />}
                                            size="small"
                                            style={{ background: '#555', marginLeft: 8, marginTop: 4 }}
                                        />
                                    )}
                                </MessageBubble>
                            ))}
                            {chatLoading && (
                                <MessageBubble>
                                    <Avatar icon={<RobotOutlined />} size="small" style={{ background: '#00B0F0', marginRight: 8 }} />
                                    <BubbleContent>
                                        <Spin size="small" /> Thinking...
                                    </BubbleContent>
                                </MessageBubble>
                            )}
                            <div ref={messagesEndRef} />
                        </MessageList>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <TextArea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about income, expenses, risks..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                style={{ background: '#00B0F0', borderColor: '#00B0F0', height: 'auto' }}
                            />
                        </div>
                    </ChatContainer>
                </TabPane>
            </Tabs>
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

  @media (max-width: 768px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
`;

export default BriefingPanel;
