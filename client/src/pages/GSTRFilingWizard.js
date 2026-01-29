import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Card, Steps, Button, Select, Form, Table, Tag, Space, Typography,
    message, Spin, Alert, Statistic, Row, Col, Divider, Modal, Input, Result
} from 'antd';
import {
    CalendarOutlined, FileTextOutlined, CheckCircleOutlined,
    DownloadOutlined, SendOutlined, ExclamationCircleOutlined,
    ArrowLeftOutlined, ArrowRightOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import gstApi from '../services/gstApi';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
`;

const WizardCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin-bottom: 24px;
  
  .ant-card-body {
    padding: 32px;
  }
  
  .ant-steps-item-process .ant-steps-item-icon {
    background: linear-gradient(135deg, #00B0F0 0%, #00D4AA 100%);
    border: none;
  }
`;

const SummaryCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  
  .ant-statistic-title {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .ant-statistic-content-value {
    color: #fff;
  }
`;

const TaxTable = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  
  .tax-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    
    &:last-child {
      border-bottom: none;
      font-weight: bold;
      color: #00B0F0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const GSTRFilingWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [returnType, setReturnType] = useState('GSTR1');
    const [period, setPeriod] = useState(null);
    const [filingData, setFilingData] = useState(null);
    const [submitModalVisible, setSubmitModalVisible] = useState(false);
    const [arnInput, setArnInput] = useState('');

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

    const handleGenerateFiling = async () => {
        if (!period) {
            message.error('Please select a filing period');
            return;
        }

        try {
            setLoading(true);
            let result;
            if (returnType === 'GSTR1') {
                result = await gstApi.generateGSTR1(period);
            } else {
                result = await gstApi.generateGSTR3B(period);
            }
            setFilingData(result);
            setCurrentStep(1);
            message.success(`${returnType} generated successfully`);
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to generate filing');
        } finally {
            setLoading(false);
        }
    };

    const handleExportJSON = async () => {
        if (!filingData?.filing?.id) return;

        try {
            const blob = await gstApi.exportFilingJSON(filingData.filing.id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${returnType}_${period}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('JSON file downloaded');
            setCurrentStep(2);
        } catch (error) {
            message.error('Failed to export JSON');
        }
    };

    const handleExportExcel = async () => {
        if (!filingData?.filing?.id) return;

        try {
            const blob = await gstApi.exportFilingExcel(filingData.filing.id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${returnType}_${period}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Excel file downloaded');
        } catch (error) {
            message.error('Failed to export Excel');
        }
    };

    const handleSubmitForReview = async () => {
        if (!filingData?.filing?.id) return;

        try {
            await gstApi.submitForReview(filingData.filing.id);
            message.success('Filing submitted for CA review');
            setCurrentStep(3);
        } catch (error) {
            message.error('Failed to submit for review');
        }
    };

    const handleMarkAsFiled = async () => {
        if (!filingData?.filing?.id || !arnInput) {
            message.error('Please enter the ARN');
            return;
        }

        try {
            await gstApi.markAsFiled(filingData.filing.id, arnInput, dayjs().format('YYYY-MM-DD'));
            message.success('Filing marked as complete!');
            setSubmitModalVisible(false);
            setCurrentStep(4);
        } catch (error) {
            message.error('Failed to mark as filed');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderSelectPeriod();
            case 1:
                return renderReviewSummary();
            case 2:
                return renderExportDownload();
            case 3:
                return renderCAReview();
            case 4:
                return renderComplete();
            default:
                return null;
        }
    };

    const renderSelectPeriod = () => (
        <div>
            <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
                Select Return Type & Period
            </Title>

            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item label={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Return Type</Text>}>
                        <Select
                            value={returnType}
                            onChange={setReturnType}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Option value="GSTR1">GSTR-1 (Outward Supplies)</Option>
                            <Option value="GSTR3B">GSTR-3B (Summary Return)</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Filing Period</Text>}>
                        <Select
                            value={period}
                            onChange={setPeriod}
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="Select period"
                        >
                            {periods.map(p => (
                                <Option key={p.value} value={p.value}>{p.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Alert
                message={returnType === 'GSTR1' ? 'GSTR-1 Details' : 'GSTR-3B Details'}
                description={
                    returnType === 'GSTR1'
                        ? 'GSTR-1 contains details of all outward supplies (sales). Due date: 11th of next month.'
                        : 'GSTR-3B is a summary return for tax payment. Due date: 20th of next month.'
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
            />
        </div>
    );

    const renderReviewSummary = () => {
        const summary = filingData?.summary || {};
        const taxLiability = summary.taxLiability || filingData?.summary || {};

        return (
            <div>
                <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
                    Review {returnType} Summary
                </Title>

                <Row gutter={24} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <SummaryCard>
                            <Statistic
                                title="Total Invoices"
                                value={filingData?.invoiceCount || summary.b2b?.count + summary.b2cs?.count || 0}
                            />
                        </SummaryCard>
                    </Col>
                    <Col span={6}>
                        <SummaryCard>
                            <Statistic
                                title="Taxable Value"
                                value={summary.totalValue || taxLiability.taxableOutwardSupply || 0}
                                prefix="₹"
                                precision={2}
                            />
                        </SummaryCard>
                    </Col>
                    <Col span={6}>
                        <SummaryCard>
                            <Statistic
                                title="Total Tax"
                                value={taxLiability.total || 0}
                                prefix="₹"
                                precision={2}
                                valueStyle={{ color: '#00B0F0' }}
                            />
                        </SummaryCard>
                    </Col>
                    <Col span={6}>
                        <SummaryCard>
                            <Statistic
                                title="Filing Period"
                                value={period}
                                prefix={<CalendarOutlined />}
                            />
                        </SummaryCard>
                    </Col>
                </Row>

                <TaxTable>
                    <div className="tax-row">
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>CGST</Text>
                        <Text style={{ color: '#fff' }}>₹{(taxLiability.cgst || 0).toLocaleString('en-IN')}</Text>
                    </div>
                    <div className="tax-row">
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>SGST/UTGST</Text>
                        <Text style={{ color: '#fff' }}>₹{(taxLiability.sgst || 0).toLocaleString('en-IN')}</Text>
                    </div>
                    <div className="tax-row">
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>IGST</Text>
                        <Text style={{ color: '#fff' }}>₹{(taxLiability.igst || 0).toLocaleString('en-IN')}</Text>
                    </div>
                    <div className="tax-row">
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Cess</Text>
                        <Text style={{ color: '#fff' }}>₹{(taxLiability.cess || 0).toLocaleString('en-IN')}</Text>
                    </div>
                    <div className="tax-row">
                        <Text>Total Tax Liability</Text>
                        <Text>₹{(taxLiability.total || 0).toLocaleString('en-IN')}</Text>
                    </div>
                </TaxTable>

                {returnType === 'GSTR1' && summary.b2b && (
                    <Alert
                        message="Category Breakdown"
                        description={
                            <Space split={<Divider type="vertical" />}>
                                <span>B2B: {summary.b2b.count} invoices</span>
                                <span>B2CS: {summary.b2cs?.count || 0} entries</span>
                                <span>B2CL: {summary.b2cl?.count || 0} invoices</span>
                            </Space>
                        }
                        type="info"
                        style={{ marginTop: 16 }}
                    />
                )}
            </div>
        );
    };

    const renderExportDownload = () => (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <DownloadOutlined style={{ fontSize: 64, color: '#00B0F0', marginBottom: 24 }} />
            <Title level={3} style={{ color: '#fff' }}>Export Filing Data</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 32px' }}>
                Download the JSON file to upload to the GST Portal, or export Excel for your records.
            </Paragraph>

            <Space size="large">
                <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={handleExportJSON}
                >
                    Download JSON for Portal
                </Button>
                <Button
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={handleExportExcel}
                >
                    Download Excel
                </Button>
            </Space>

            <Alert
                message="Next Steps"
                description={
                    <ol style={{ textAlign: 'left', margin: '8px 0' }}>
                        <li>Login to GST Portal (gst.gov.in)</li>
                        <li>Navigate to Returns → {returnType}</li>
                        <li>Upload the JSON file using 'Offline Tool' option</li>
                        <li>Verify and submit the return</li>
                        <li>Come back here to mark it as filed</li>
                    </ol>
                }
                type="warning"
                showIcon
                style={{ marginTop: 32, textAlign: 'left' }}
            />
        </div>
    );

    const renderCAReview = () => (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <SafetyCertificateOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 24 }} />
            <Title level={3} style={{ color: '#fff' }}>Pending CA Verification</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 32px' }}>
                Your filing has been submitted for CA review. You'll be notified once it's verified.
            </Paragraph>

            <Tag color="warning" style={{ fontSize: 14, padding: '8px 16px' }}>
                <ExclamationCircleOutlined /> Awaiting CA Approval
            </Tag>

            <div style={{ marginTop: 32 }}>
                <Button onClick={() => setSubmitModalVisible(true)}>
                    Already filed? Enter ARN
                </Button>
            </div>
        </div>
    );

    const renderComplete = () => (
        <Result
            status="success"
            title="Filing Complete!"
            subTitle={`${returnType} for ${period} has been successfully filed.`}
            extra={[
                <Button type="primary" key="dashboard" onClick={() => navigate('/gst')}>
                    Back to Dashboard
                </Button>,
                <Button key="new" onClick={() => {
                    setCurrentStep(0);
                    setFilingData(null);
                    setPeriod(null);
                }}>
                    File Another Return
                </Button>
            ]}
        />
    );

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

            <WizardCard>
                <Steps current={currentStep} style={{ marginBottom: 40 }}>
                    <Step title="Select Period" icon={<CalendarOutlined />} />
                    <Step title="Review Summary" icon={<FileTextOutlined />} />
                    <Step title="Export & Upload" icon={<DownloadOutlined />} />
                    <Step title="CA Review" icon={<SafetyCertificateOutlined />} />
                    <Step title="Complete" icon={<CheckCircleOutlined />} />
                </Steps>

                <Spin spinning={loading}>
                    {renderStepContent()}
                </Spin>

                {currentStep < 4 && (
                    <ActionButtons>
                        <Button
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            icon={<ArrowLeftOutlined />}
                        >
                            Previous
                        </Button>

                        {currentStep === 0 && (
                            <Button type="primary" onClick={handleGenerateFiling} loading={loading}>
                                Generate {returnType}
                            </Button>
                        )}

                        {currentStep === 1 && (
                            <Button type="primary" onClick={() => setCurrentStep(2)} icon={<ArrowRightOutlined />}>
                                Proceed to Export
                            </Button>
                        )}

                        {currentStep === 2 && (
                            <Space>
                                <Button onClick={handleSubmitForReview} icon={<SendOutlined />}>
                                    Send for CA Review
                                </Button>
                                <Button type="primary" onClick={() => setSubmitModalVisible(true)}>
                                    Mark as Filed
                                </Button>
                            </Space>
                        )}
                    </ActionButtons>
                )}
            </WizardCard>

            {/* ARN Modal */}
            <Modal
                title="Enter Filing Details"
                open={submitModalVisible}
                onCancel={() => setSubmitModalVisible(false)}
                onOk={handleMarkAsFiled}
                okText="Confirm Filing"
            >
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Enter the Acknowledgement Reference Number (ARN) received after filing on the GST Portal.
                </Paragraph>
                <Input
                    placeholder="e.g., AA2701234567890"
                    value={arnInput}
                    onChange={(e) => setArnInput(e.target.value)}
                    size="large"
                />
            </Modal>
        </PageContainer>
    );
};

export default GSTRFilingWizard;
