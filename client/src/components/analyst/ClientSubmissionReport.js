import React from 'react';
import { Typography, Descriptions, Divider, Tag, Table } from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;

const ClientSubmissionReport = ({ submission }) => {
    if (!submission) return <Text type="secondary">No submission data available.</Text>;

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            submitted: 'blue',
            under_review: 'orange',
            completed: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    return (
        <div style={{ padding: '24px', background: '#141414', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <Title level={3} style={{ color: '#00B0F0', margin: 0 }}>Client Preference Report</Title>
                    <Text type="secondary">Submitted on {moment(submission.createdAt).format('DD MMM YYYY, HH:mm')}</Text>
                </div>
                <Tag color={getStatusColor(submission.status)}>{submission.status?.toUpperCase()}</Tag>
            </div>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>1. Basic Information</Title>
            <Descriptions bordered column={2} className="custom-descriptions">
                <Descriptions.Item label="Full Name">{submission.fullName}</Descriptions.Item>
                <Descriptions.Item label="Age">{submission.age || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{submission.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{submission.phone}</Descriptions.Item>
                <Descriptions.Item label="Occupation">{submission.occupation || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Meeting Mode">{submission.preferredMeetingType?.toUpperCase() || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>2. Goals & Timeline</Title>
            <Descriptions bordered column={2} className="custom-descriptions">
                <Descriptions.Item label="Planning Type">{submission.planningType?.replace('_', ' ').toUpperCase()}</Descriptions.Item>
                <Descriptions.Item label="Target Amount">{formatCurrency(submission.targetAmount)}</Descriptions.Item>
                <Descriptions.Item label="Target Timeline">{submission.targetTimeline || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Flexibility">{submission.timelineFlexibility || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>3. Risk Profile (Score: {submission.riskScore || 0}/100)</Title>
            <Descriptions bordered column={2} className="custom-descriptions">
                <Descriptions.Item label="Risk Reaction">{submission.riskReaction || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Experience">{submission.investmentExperience || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Risk Preference">{submission.riskPreference || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>4. Financial Health</Title>
            <Descriptions bordered column={2} className="custom-descriptions">
                <Descriptions.Item label="Monthly Income">{submission.monthlyIncome || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Income Stability">{submission.incomeStability || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Monthly Savings">{formatCurrency(submission.monthlySavings)}</Descriptions.Item>
                <Descriptions.Item label="Dependents">{submission.dependents || 0}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>5. Liabilities</Title>
            {submission.liabilities && submission.liabilities.length > 0 ? (
                <Table
                    dataSource={submission.liabilities}
                    pagination={false}
                    size="small"
                    columns={[
                        { title: 'Type', dataIndex: 'type', key: 'type' },
                        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val) => formatCurrency(val) },
                        { title: 'Rate %', dataIndex: 'rate', key: 'rate' }
                    ]}
                    style={{ marginBottom: '16px' }}
                    className="custom-table"
                />
            ) : (
                <Text type="secondary">No active liabilities reported.</Text>
            )}

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Title level={4} style={{ color: '#fff' }}>6. Preferences & Constraints</Title>
            <Descriptions bordered column={1} className="custom-descriptions">
                <Descriptions.Item label="Avoided Investments">
                    {submission.avoidedInvestments?.length > 0 ? submission.avoidedInvestments.join(', ') : 'None'}
                </Descriptions.Item>
                <Descriptions.Item label="Liquidity Needs">
                    {submission.liquidityNeeds ? 'Immediate/High' : 'Normal'}
                </Descriptions.Item>
                <Descriptions.Item label="Ethical Preferences">{submission.ethicalPreferences || 'None specified'}</Descriptions.Item>
                <Descriptions.Item label="Exposure Preference">{submission.exposurePreference || 'No preference'}</Descriptions.Item>
            </Descriptions>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-descriptions .ant-descriptions-item-label {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #00B0F0 !important;
          font-weight: 600 !important;
          width: 25%;
        }
        .custom-descriptions .ant-descriptions-item-content {
          color: white !important;
          background: rgba(0, 0, 0, 0.2) !important;
        }
        .ant-descriptions-bordered .ant-descriptions-item-label, .ant-descriptions-bordered .ant-descriptions-item-content {
           border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
           border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .ant-descriptions-bordered {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px;
          overflow: hidden;
        }
        .custom-table .ant-table {
          background: transparent !important;
          color: white !important;
        }
        .custom-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.8) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
      `}} />
        </div>
    );
};

export default ClientSubmissionReport;
