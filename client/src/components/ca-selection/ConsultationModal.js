import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Button, message, Space, Typography, Alert, Input, Steps, Select, Switch, Grid } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import AuthGuard from '../auth/AuthGuard';
import moment from 'moment';
import { initiatePayment } from '../../services/paymentService';

const { Title, Text } = Typography;
const { Step } = Steps;
const { useBreakpoint } = Grid;

const ModalContainer = styled.div`
  .ant-modal-content {
    background: #141414;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
  }
  .ant-modal-header {
    background: #141414;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px 24px;
    .ant-modal-title { color: white; font-size: 20px; }
  }
`;

const FormSection = styled.div`
  padding: 10px 0;
`;

const StepContainer = styled.div`
  margin-bottom: 24px;
  .ant-steps-item-title { color: rgba(255,255,255,0.45) !important; }
  .ant-steps-item-active .ant-steps-item-title { color: white !important; }
  .ant-steps-item-finish .ant-steps-item-icon { border-color: var(--primary-color); }
  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon { color: var(--primary-color); }
`;

const CAInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

const StyledInput = styled(Input)`
  height: 56px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  padding: 0 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    background: rgba(0, 0, 0, 0.4);
    border-color: #00B0F0;
    box-shadow: 0 0 0 4px rgba(0, 176, 240, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  
  .ant-select-selector {
    height: 56px !important;
    background: rgba(0, 0, 0, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 20px !important;
    transition: all 0.3s !important;
  }
  
  .ant-select-selection-item {
    color: white !important;
    font-size: 16px !important;
    font-family: 'Inter', sans-serif;
  }

  .ant-select-selection-placeholder {
    color: rgba(255, 255, 255, 0.25) !important;
    font-size: 16px;
  }

  .ant-select-arrow {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  &:hover .ant-select-selector {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.25) !important;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: #00B0F0 !important;
    box-shadow: 0 0 0 4px rgba(0, 176, 240, 0.1) !important;
  }
`;

// Helper for premium labels
const FieldLabel = ({ children, required }) => (
  <span style={{
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'block'
  }}>
    {children} {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
  </span>
);

const PaymentButton = styled(Button)`
  height: 56px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 16px;
  background: linear-gradient(135deg, #00B0F0 0%, #0080C0 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(0, 176, 240, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 176, 240, 0.4);
    background: linear-gradient(135deg, #00C0FF 0%, #0090D0 100%) !important;
  }
`;

const DocumentList = styled.div`
  margin: 20px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #00B0F0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, rgba(0, 176, 240, 0.1), transparent);
  }
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ConsultationModal = ({ visible, onCancel, selectedCA }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { user } = useSelector(state => state.user);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (user && visible) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }, [user, visible, form]);

  const handleConsultationSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // 1. Initiate Payment
      await initiatePayment({
        amount: selectedCA?.consultationFee || 500,
        purpose: 'consultation_booking',
        referenceId: 0,
        metadata: {
          meetingDetails: {
            professionalId: selectedCA.userId || 1,
            professionalRole: 'ca',
            title: `Consultation with ${selectedCA.name}`,
            startsAt: moment().add(1, 'days').hour(10).minute(0).second(0).toISOString(),
            endsAt: moment().add(1, 'days').hour(11).minute(0).second(0).toISOString(),
            clientNotes: values.notes || `Consultation booked via CA selection.`,
            planningType: values.engagementPurpose || 'advisory',
            intakeFields: {
              clientType: values.clientType,
              residentStatus: values.residentStatus,
              pan: values.pan,
              city: values.city,
              industry: values.industry,
              turnoverBand: values.turnoverBand,
              incomeSources: values.incomeSources,
              accountingMethod: values.accountingMethod,
              hasPastNotices: !!values.hasPastNotices,
              hasPendingFilings: !!values.hasPendingFilings,
              hasLoans: !!values.hasLoans,
              hasCryptoForeignAssets: !!values.hasCryptoForeignAssets,
              isCashHeavy: !!values.isCashHeavy
            }
          }
        }
      }, async (paymentRes) => {
        // 2. On Success: handle original logic (file uploads) - although ideally files are uploaded BEFORE payment or handled differently
        // For now, let's just show success as the backend already created the meeting record.
        message.success({ content: `Consultation booked with ${selectedCA?.name}. Room link sent to email.`, key: 'payment' });
        setFileList([]);
        form.resetFields();
        setCurrentStep(0);
        onCancel();
      }, (error) => {
        message.error({ content: error, key: 'payment' });
      });

    } catch (error) {
      console.error('Consultation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Submission failed.';
      message.error({ content: errorMsg, key: 'payment' });
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    multiple: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
  };

  const renderChecklist = () => {
    const type = form.getFieldValue('clientType');
    const isBusiness = ['pvt_ltd', 'llp', 'partnership', 'proprietor'].includes(type);

    const individualDocs = [
      { label: 'Last 2 Years ITR', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> },
      { label: 'Form 26AS + AIS', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> },
      { label: 'Bank Statements (Last 12 Months)', icon: <FileExcelOutlined style={{ color: '#52c41a' }} /> }
    ];

    const businessDocs = [
      { label: 'Primary Bank Statements (12m)', icon: <FileExcelOutlined style={{ color: '#52c41a' }} /> },
      { label: 'GST Returns (GSTR-1, 3B)', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> },
      { label: 'Trial Balance / P&L', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> }
    ];

    const docs = isBusiness ? businessDocs : individualDocs;

    return (
      <DocumentList>
        <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
          📋 Checklist:
        </Title>
        <Space direction="vertical" size="small">
          {docs.map((doc, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {doc.icon}
              <Text style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>{doc.label}</Text>
            </div>
          ))}
        </Space>
      </DocumentList>
    );
  };

  const stepTitles = ['Situational', 'Business', 'Risk', 'Docs', 'Pay'];

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['clientType', 'residentStatus', 'city', 'engagementPurpose', 'timeSensitivity', 'engagementType', 'phone']);
      } else if (currentStep === 1) {
        await form.validateFields(['industry', 'turnoverBand', 'incomeSources', 'accountingMethod']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Please fill in all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <ModalContainer>
      <Modal
        title={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Consultation with</span>
            <span style={{ color: 'var(--primary-color)', fontSize: '14px' }}>{selectedCA?.name}</span>
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={isMobile ? '95%' : 800}
        style={{ top: 10 }}
        bodyStyle={{ padding: holdsMobile => isMobile ? '16px' : '24px' }}
      >
        <StepContainer>
          <Steps
            current={currentStep}
            size="small"
            style={{ marginBottom: '24px' }}
            responsive={true}
          >
            {stepTitles.map(title => (
              <Step key={title} title={!isMobile ? title : null} subTitle={isMobile && currentStep === stepTitles.indexOf(title) ? title : null} />
            ))}
          </Steps>
        </StepContainer>

        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <FormSection>
              <StyledGrid>
                <Form.Item name="clientType" label={<FieldLabel required>Entity Type</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select type" size="large">
                    <Select.Option value="individual">Individual</Select.Option>
                    <Select.Option value="proprietor">Proprietor</Select.Option>
                    <Select.Option value="partnership">Partnership</Select.Option>
                    <Select.Option value="pvt_ltd">Pvt Ltd</Select.Option>
                    <Select.Option value="llp">LLP</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="residentStatus" label={<FieldLabel required>Resident Status</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select status" size="large">
                    <Select.Option value="resident">Resident</Select.Option>
                    <Select.Option value="nri">NRI</Select.Option>
                    <Select.Option value="rnor">RNOR</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="pan" label={<FieldLabel required>PAN</FieldLabel>}><StyledInput placeholder="XXXXX0000X" size="large" /></Form.Item>
                <Form.Item name="city" label={<FieldLabel required>City</FieldLabel>} rules={[{ required: true }]}><StyledInput placeholder="Enter city" size="large" /></Form.Item>
                <Form.Item name="engagementPurpose" label={<FieldLabel required>Goal</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select goal" size="large">
                    <Select.Option value="tax_filing">Tax Filing</Select.Option>
                    <Select.Option value="loan_expansion">Loan Planning</Select.Option>
                    <Select.Option value="compliance_cleanup">Compliance</Select.Option>
                    <Select.Option value="advisory">Advisory</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="timeSensitivity" label={<FieldLabel required>Urgency</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select urgency" size="large">
                    <Select.Option value="deadline_driven">Deadline-driven</Select.Option>
                    <Select.Option value="advisory_only">Advisory-only</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="engagementType" label={<FieldLabel required>Scope</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select scope" size="large">
                    <Select.Option value="one_time">One-time</Select.Option>
                    <Select.Option value="ongoing">Ongoing</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="phone" label={<FieldLabel required>Phone</FieldLabel>} rules={[{ required: true }]}><StyledInput placeholder="Enter phone" size="large" /></Form.Item>
              </StyledGrid>
            </FormSection>
          )}

          {currentStep === 1 && (
            <FormSection>
              <StyledGrid>
                <Form.Item name="industry" label={<FieldLabel required>Industry</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select industry" size="large">
                    <Select.Option value="manufacturing">Manufacturing</Select.Option>
                    <Select.Option value="services">Services / Tech</Select.Option>
                    <Select.Option value="trading">Trading / Retail</Select.Option>
                    <Select.Option value="gig">Gig / Freelance</Select.Option>
                    <Select.Option value="salaried">Salaried Professional</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="turnoverBand" label={<FieldLabel required>Annual Turnover</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select band" size="large">
                    <Select.Option value="under_20l">&lt; 20 Lakhs</Select.Option>
                    <Select.Option value="20l_2cr">20 Lakhs - 2 Cr</Select.Option>
                    <Select.Option value="2cr_10cr">2 Cr - 10 Cr</Select.Option>
                    <Select.Option value="over_10cr">10 Cr +</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="incomeSources" label={<FieldLabel required>Income Sources</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect mode="multiple" placeholder="Select sources" size="large">
                    <Select.Option value="salary">Salary</Select.Option>
                    <Select.Option value="business">Business</Select.Option>
                    <Select.Option value="capital_gains">Capital Gains</Select.Option>
                    <Select.Option value="rental">Rental</Select.Option>
                  </StyledSelect>
                </Form.Item>
                <Form.Item name="accountingMethod" label={<FieldLabel required>Accounting</FieldLabel>} rules={[{ required: true }]}>
                  <StyledSelect placeholder="Select method" size="large">
                    <Select.Option value="cash">Cash</Select.Option>
                    <Select.Option value="accrual">Accrual</Select.Option>
                  </StyledSelect>
                </Form.Item>
              </StyledGrid>
            </FormSection>
          )}

          {currentStep === 2 && (
            <FormSection>
              <StyledGrid>
                <Form.Item name="hasPastNotices" label={<FieldLabel>Past Notices?</FieldLabel>} valuePropName="checked"><Switch /></Form.Item>
                <Form.Item name="hasPendingFilings" label={<FieldLabel>Pending Filings?</FieldLabel>} valuePropName="checked"><Switch /></Form.Item>
                <Form.Item name="hasLoans" label={<FieldLabel>Existing Loans?</FieldLabel>} valuePropName="checked"><Switch /></Form.Item>
                <Form.Item name="hasCryptoForeignAssets" label={<FieldLabel>Crypto/Foreign Assets?</FieldLabel>} valuePropName="checked"><Switch /></Form.Item>
              </StyledGrid>
            </FormSection>
          )}

          {currentStep === 3 && (
            <FormSection>
              {renderChecklist()}
              <Form.Item label={<span style={{ fontWeight: '600', color: 'white' }}>Upload Documents</span>}>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />} size="large" block>Select Documents</Button>
                </Upload>
              </Form.Item>
            </FormSection>
          )}

          {currentStep === 4 && (
            <FormSection>
              <CAInfoCard>
                <Title level={4} style={{ color: 'var(--primary-color)', margin: 0 }}>Fee: ₹{selectedCA?.consultationFee}</Title>
              </CAInfoCard>
              <AuthGuard>
                <PaymentButton type="primary" onClick={handleConsultationSubmit} loading={uploading} block>
                  {uploading ? 'Processing...' : `Pay & Start`}
                </PaymentButton>
              </AuthGuard>
            </FormSection>
          )}
        </Form>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <Button size="large" onClick={prev} disabled={currentStep === 0 || uploading}>←</Button>
          {currentStep < 4 && <Button type="primary" size="large" onClick={next}>Next→</Button>}
        </div>
      </Modal>
    </ModalContainer>
  );
};

export default ConsultationModal;