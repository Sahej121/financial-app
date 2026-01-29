
import React from 'react';
import { Card, Typography, Progress, Button, Space, Tooltip, Modal, Form, Input, InputNumber } from 'antd';
import { TrophyOutlined, PlusOutlined, RocketOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const WidgetCard = styled(Card)`
  background: linear-gradient(145deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #F2C811, #ff4d4f);
    opacity: 0.7;
  }
`;

const GoalItem = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    
    .title { color: white; font-weight: 500; font-size: 14px; }
    .amount { color: rgba(255,255,255,0.65); font-size: 12px; }
  }
`;

const GoalProgressWidget = () => {
    const [goals, setGoals] = React.useState([
        { title: 'Dream Home', current: 4500000, target: 15000000, color: '#00B0F0', icon: '🏠' },
        { title: 'Emergency Fund', current: 480000, target: 500000, color: '#52c41a', icon: '🛡️' },
        { title: 'World Tour', current: 150000, target: 800000, color: '#F2C811', icon: '✈️' },
    ]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [form] = Form.useForm();

    const formatCurrency = (val) => `₹${(val / 100000).toFixed(1)}L`;

    const handleAdd = (values) => {
        const newGoal = {
            title: values.title,
            current: values.current || 0,
            target: values.target,
            color: values.color || '#00B0F0',
            icon: values.icon || '🎯'
        };
        setGoals([...goals, newGoal]);
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <WidgetCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <Title level={5} style={{ color: 'white', margin: 0 }}>
                    <TrophyOutlined style={{ color: '#F2C811', marginRight: 8 }} />
                    Financial Goals
                </Title>
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    size="small"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onClick={() => setIsModalVisible(true)}
                >
                    Add
                </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.map((goal, idx) => {
                    const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    return (
                        <GoalItem key={idx}>
                            <div className="header">
                                <Space>
                                    <span>{goal.icon}</span>
                                    <span className="title">{goal.title}</span>
                                </Space>
                                <span className="amount">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                            </div>
                            <Tooltip title={`${percent}% Completed - ${percent > 75 ? 'Almost there!' : 'Keep going!'}`}>
                                <Progress
                                    percent={percent}
                                    strokeColor={goal.color}
                                    trailColor="rgba(255,255,255,0.1)"
                                    size="small"
                                    showInfo={false}
                                />
                            </Tooltip>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                <Text style={{ fontSize: '11px', color: percent >= 80 ? '#52c41a' : '#faad14' }}>
                                    {percent >= 80 ? 'On Track' : 'Needs Focus'}
                                </Text>
                            </div>
                        </GoalItem>
                    );
                })}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button type="link" size="small" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    View All Goals & projections <RocketOutlined />
                </Button>
            </div>

            <Modal
                title="Add New Financial Goal"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Add Goal"
                cancelText="Cancel"
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="title" label="Goal Title" rules={[{ required: true, message: 'Please enter a title' }]}>
                        <Input placeholder="e.g. New Car, Wedding" />
                    </Form.Item>
                    <Form.Item name="target" label="Target Amount (₹)" rules={[{ required: true, message: 'Please enter target amount' }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\₹\s?|(,*)/g, '')} />
                    </Form.Item>
                    <Form.Item name="current" label="Current Savings (₹)">
                        <InputNumber style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\₹\s?|(,*)/g, '')} />
                    </Form.Item>
                    <Form.Item name="icon" label="Icon (Emoji)">
                        <Input placeholder="e.g. 🚗, 💍" />
                    </Form.Item>
                </Form>
            </Modal>
        </WidgetCard>
    );
};

export default GoalProgressWidget;
