import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Card, Row, Col, Statistic, Button, Alert, Typography, Table, Tag,
    Progress, Empty, Spin, Modal, Form, Input, Select, message, Tooltip
} from 'antd';
import {
    FileTextOutlined, CalendarOutlined, WarningOutlined, CheckCircleOutlined,
    ExclamationCircleOutlined, ClockCircleOutlined, PlusOutlined, SettingOutlined,
    DollarOutlined, UploadOutlined, RightOutlined, BankOutlined
} from '@ant-design/icons';
import gstApi from '../services/gstApi';

const { Title, Text } = Typography;
const { Option } = Select;

// Styled Components
const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #00B0F0 0%, #00D4AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  p {
    margin: 4px 0 0 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 176, 240, 0.3);
    box-shadow: 0 8px 32px rgba(0, 176, 240, 0.1);
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const StatCard = styled(StyledCard)`
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }
  
  .stat-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin-top: 4px;
  }
`;

const DeadlineCard = styled(StyledCard)`
  .deadline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    &:first-child {
      padding-top: 0;
    }
  }
  
  .deadline-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .deadline-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .deadline-details {
    h4 {
      margin: 0;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }
    p {
      margin: 2px 0 0 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }
  }
`;

const QuickActionCard = styled(StyledCard)`
  cursor: pointer;
  text-align: center;
  
  .action-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, rgba(0, 176, 240, 0.2) 0%, rgba(0, 212, 170, 0.2) 100%);
    color: #00B0F0;
  }
  
  h3 {
    margin: 0;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }
  
  p {
    margin: 8px 0 0 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }
`;

const ProfileSetupCard = styled(StyledCard)`
  background: linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 212, 170, 0.1) 100%);
  border: 1px solid rgba(0, 176, 240, 0.3);
  
  .setup-content {
    text-align: center;
    padding: 24px;
  }
  
  .setup-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, rgba(0, 176, 240, 0.3) 0%, rgba(0, 212, 170, 0.3) 100%);
    color: #00B0F0;
  }
`;

const GSTDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [deadlines, setDeadlines] = useState([]);
    const [setupModalVisible, setSetupModalVisible] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const dashboardData = await gstApi.getDashboardStats();
            setProfile(dashboardData.profile);
            setStats(dashboardData.stats);
            setDeadlines(dashboardData.upcomingDeadlines || []);
        } catch (error) {
            if (error.response?.status === 404) {
                // No profile found, show setup
                setProfile(null);
            } else {
                message.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSetupProfile = async (values) => {
        try {
            setSetupLoading(true);
            await gstApi.createProfile(values);
            message.success('GST Profile created successfully!');
            setSetupModalVisible(false);
            loadDashboardData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to create profile');
        } finally {
            setSetupLoading(false);
        }
    };

    const validateGSTIN = async (_, value) => {
        if (!value || value.length !== 15) {
            return Promise.reject('GSTIN must be 15 characters');
        }
        try {
            const result = await gstApi.validateGSTIN(value);
            if (!result.isValid) {
                return Promise.reject(result.error);
            }
            // Auto-fill state info from GSTIN
            form.setFieldsValue({
                state: result.details?.stateName
            });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject('Failed to validate GSTIN');
        }
    };

    const getDeadlineStatus = (deadline) => {
        if (deadline.isOverdue) return { color: '#ff4d4f', icon: <ExclamationCircleOutlined />, text: 'Overdue' };
        if (deadline.daysRemaining <= 3) return { color: '#faad14', icon: <ClockCircleOutlined />, text: `${deadline.daysRemaining} days` };
        if (deadline.daysRemaining <= 7) return { color: '#1890ff', icon: <ClockCircleOutlined />, text: `${deadline.daysRemaining} days` };
        return { color: '#52c41a', icon: <CheckCircleOutlined />, text: `${deadline.daysRemaining} days` };
    };

    if (loading) {
        return (
            <DashboardContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Spin size="large" />
                </div>
            </DashboardContainer>
        );
    }

    // Show setup prompt if no profile
    if (!profile) {
        return (
            <DashboardContainer>
                <PageHeader>
                    <HeaderTitle>
                        <h1>GST Filing Assistant</h1>
                        <p>Manage your GST compliance with ease</p>
                    </HeaderTitle>
                </PageHeader>

                <Row justify="center" style={{ marginTop: 60 }}>
                    <Col xs={24} sm={20} md={16} lg={12}>
                        <ProfileSetupCard>
                            <div className="setup-content">
                                <div className="setup-icon">
                                    <BankOutlined />
                                </div>
                                <Title level={3} style={{ color: '#fff', marginBottom: 8 }}>
                                    Set Up Your GST Profile
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 24 }}>
                                    Get started by adding your GSTIN. We'll help you manage invoices,
                                    generate returns, and never miss a deadline.
                                </Text>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={() => setSetupModalVisible(true)}
                                >
                                    Add GST Profile
                                </Button>
                            </div>
                        </ProfileSetupCard>
                    </Col>
                </Row>

                {/* Setup Modal */}
                <Modal
                    title="Set Up GST Profile"
                    open={setupModalVisible}
                    onCancel={() => setSetupModalVisible(false)}
                    footer={null}
                    width={500}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSetupProfile}
                        style={{ marginTop: 16 }}
                    >
                        <Form.Item
                            name="gstin"
                            label="GSTIN"
                            rules={[
                                { required: true, message: 'Please enter GSTIN' },
                                { validator: validateGSTIN }
                            ]}
                            hasFeedback
                        >
                            <Input
                                placeholder="27AABCU9603R1ZM"
                                maxLength={15}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="businessName"
                            label="Business Name"
                            rules={[{ required: true, message: 'Please enter business name' }]}
                        >
                            <Input placeholder="Your Business Name" />
                        </Form.Item>

                        <Form.Item
                            name="businessType"
                            label="Business Type"
                        >
                            <Select placeholder="Select business type">
                                <Option value="proprietorship">Proprietorship</Option>
                                <Option value="partnership">Partnership</Option>
                                <Option value="llp">LLP</Option>
                                <Option value="private_limited">Private Limited</Option>
                                <Option value="public_limited">Public Limited</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="filingFrequency"
                            label="Filing Frequency"
                            initialValue="monthly"
                        >
                            <Select>
                                <Option value="monthly">Monthly</Option>
                                <Option value="quarterly">Quarterly (QRMP)</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Business Email"
                        >
                            <Input placeholder="business@example.com" type="email" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Business Phone"
                        >
                            <Input placeholder="+91 9876543210" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={setupLoading}
                                block
                                size="large"
                            >
                                Create GST Profile
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </DashboardContainer>
        );
    }

    // Main Dashboard
    return (
        <DashboardContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1>GST Dashboard</h1>
                    <p>{profile.businessName} • {profile.gstin}</p>
                </HeaderTitle>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button icon={<SettingOutlined />} onClick={() => navigate('/gst/settings')}>
                        Settings
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/gst/invoices/new')}>
                        New Invoice
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Row */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.2) 0%, rgba(0, 176, 240, 0.1) 100%)', color: '#00B0F0' }}>
                            <FileTextOutlined />
                        </div>
                        <h2 className="stat-value">{stats?.totalInvoices || 0}</h2>
                        <p className="stat-label">Total Invoices</p>
                    </StatCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.2) 0%, rgba(250, 173, 20, 0.1) 100%)', color: '#faad14' }}>
                            <ClockCircleOutlined />
                        </div>
                        <h2 className="stat-value">{stats?.pendingReview || 0}</h2>
                        <p className="stat-label">Pending Review</p>
                    </StatCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(82, 196, 26, 0.1) 100%)', color: '#52c41a' }}>
                            <DollarOutlined />
                        </div>
                        <h2 className="stat-value">₹{(stats?.currentMonthSales || 0).toLocaleString('en-IN')}</h2>
                        <p className="stat-label">This Month Sales</p>
                    </StatCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.2) 0%, rgba(114, 46, 209, 0.1) 100%)', color: '#722ed1' }}>
                            <DollarOutlined />
                        </div>
                        <h2 className="stat-value">₹{(stats?.currentMonthPurchases || 0).toLocaleString('en-IN')}</h2>
                        <p className="stat-label">This Month Purchases</p>
                    </StatCard>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Upcoming Deadlines */}
                <Col xs={24} lg={14}>
                    <DeadlineCard title={<span style={{ color: '#fff' }}>Upcoming Deadlines</span>}>
                        {deadlines.length === 0 ? (
                            <Empty description="No upcoming deadlines" />
                        ) : (
                            deadlines.map((deadline, index) => {
                                const status = getDeadlineStatus(deadline);
                                return (
                                    <div className="deadline-item" key={index}>
                                        <div className="deadline-info">
                                            <div
                                                className="deadline-icon"
                                                style={{ background: `${status.color}20`, color: status.color }}
                                            >
                                                <CalendarOutlined />
                                            </div>
                                            <div className="deadline-details">
                                                <h4>{deadline.returnType}</h4>
                                                <p>Period: {deadline.period} • Due: {deadline.dueDate}</p>
                                            </div>
                                        </div>
                                        <Tag color={status.color} icon={status.icon}>
                                            {status.text}
                                        </Tag>
                                    </div>
                                );
                            })
                        )}
                    </DeadlineCard>
                </Col>

                {/* Quick Actions */}
                <Col xs={24} lg={10}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12}>
                            <QuickActionCard onClick={() => navigate('/gst/invoices')}>
                                <div className="action-icon">
                                    <FileTextOutlined />
                                </div>
                                <h3>Manage Invoices</h3>
                                <p>View & edit invoices</p>
                            </QuickActionCard>
                        </Col>
                        <Col xs={12}>
                            <QuickActionCard onClick={() => navigate('/gst/filing')}>
                                <div className="action-icon">
                                    <UploadOutlined />
                                </div>
                                <h3>File Returns</h3>
                                <p>Generate GSTR-1/3B</p>
                            </QuickActionCard>
                        </Col>
                        <Col xs={12}>
                            <QuickActionCard onClick={() => navigate('/gst/itc')}>
                                <div className="action-icon">
                                    <CheckCircleOutlined />
                                </div>
                                <h3>ITC Reconciliation</h3>
                                <p>Match GSTR-2A/2B</p>
                            </QuickActionCard>
                        </Col>
                        <Col xs={12}>
                            <QuickActionCard onClick={() => navigate('/gst/reports')}>
                                <div className="action-icon">
                                    <CalendarOutlined />
                                </div>
                                <h3>Reports</h3>
                                <p>View analytics</p>
                            </QuickActionCard>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Alerts Section */}
            {deadlines.some(d => d.isOverdue) && (
                <Alert
                    message="Overdue Filings"
                    description="You have overdue GST filings. File now to avoid additional penalties."
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginTop: 24 }}
                    action={
                        <Button type="primary" danger onClick={() => navigate('/gst/filing')}>
                            File Now
                        </Button>
                    }
                />
            )}
        </DashboardContainer>
    );
};

export default GSTDashboard;
