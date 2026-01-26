import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Button, message, Space, Typography, Alert, Input, Steps, Select, Switch } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import AuthGuard from '../auth/AuthGuard';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

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
  margin-bottom: 30px;
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
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, rgba(0, 176, 240, 0.1), transparent);
  }
`;

const ConsultationModal = ({ visible, onCancel, selectedCA }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { user } = useSelector(state => state.user);

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

      // Simulate Payment Process (Dummy)
      message.loading('Processing payment securely...', 1.5);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. Upload Documents
      const documentIds = [];
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignedToId', selectedCA.userId || 1);
        formData.append('assignedRole', 'ca');
        formData.append('category', 'tax_documents');

        const uploadRes = await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.document) {
          documentIds.push(uploadRes.data.document.id);
        }
      }

      // 2. Create Meeting
      const startsAt = moment().add(1, 'days').hour(10).minute(0).second(0).toISOString();
      const endsAt = moment().add(1, 'days').hour(11).minute(0).second(0).toISOString();

      const meetingPayload = {
        professionalId: selectedCA.userId || 1,
        professionalRole: 'ca',
        title: `Consultation with ${selectedCA.name}`,
        startsAt,
        endsAt,
        clientNotes: values.notes || `Consultation booked via CA selection.`,
        documentIds,
        // Specific field mapping to ensure cleanliness
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
      };

      await api.post('/meetings', meetingPayload);

      message.success(`Consultation booked with ${selectedCA?.name}. Room link sent to email.`);

      setFileList([]);
      form.resetFields();
      setCurrentStep(0);
      onCancel();
    } catch (error) {
      console.error('Consultation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Submission failed. Please check all fields.';
      message.error(errorMsg, 5); // Show for 5 seconds to allow reading
    } finally {
      setUploading(false);
    }
  };

  const props = {
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
      { label: 'Bank Statements (Last 12 Months)', icon: <FileExcelOutlined style={{ color: '#52c41a' }} /> },
      { label: 'Salary Slips / Form 16 (If salaried)', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> }
    ];

    const businessDocs = [
      { label: 'Primary Bank Statements (12m)', icon: <FileExcelOutlined style={{ color: '#52c41a' }} /> },
      { label: 'GST Returns (GSTR-1, 3B)', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> },
      { label: 'Trial Balance / P&L / Balance Sheet', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> },
      { label: 'Loan Sanction Letters (If any)', icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} /> }
    ];

    const docs = isBusiness ? businessDocs : individualDocs;

    return (
      <DocumentList>
        <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
          📋 {isBusiness ? 'Business' : 'Individual'} Case Checklist:
        </Title>
        <Space direction="vertical" size="middle">
          {docs.map((doc, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {doc.icon}
              <Text style={{ fontSize: '15px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>{doc.label}</Text>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileImageOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
            <Text style={{ fontSize: '15px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>Supporting Identity Docs (PAN/Aadhar)</Text>
          </div>
        </Space>
      </DocumentList>
    );
  };

  const stepTitles = ['Situational', 'Business', 'Risk', 'Documents', 'Payment'];

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
        title={`🛸 Start Consultation v2 with ${selectedCA?.name}`}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Alert
          message="🎯 Demo Mode"
          description="This is a demonstration. Payment is simulated for your convenience."
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: '12px', background: 'rgba(0, 176, 240, 0.05)', color: 'white' }}
        />

        <StepContainer>
          <Steps current={currentStep} style={{ marginBottom: '32px' }}>
            {stepTitles.map(title => (
              <Step key={title} title={title} />
            ))}
          </Steps>
        </StepContainer>

        <Form form={form} layout="vertical">
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <FormSection>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Form.Item name="clientType" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>🏢 Entity Type</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select type" size="large">
                    <Select.Option value="individual">Individual</Select.Option>
                    <Select.Option value="proprietor">Proprietor</Select.Option>
                    <Select.Option value="partnership">Partnership</Select.Option>
                    <Select.Option value="pvt_ltd">Pvt Ltd</Select.Option>
                    <Select.Option value="llp">LLP</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="residentStatus" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>🌍 Resident Status</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select status" size="large">
                    <Select.Option value="resident">Resident</Select.Option>
                    <Select.Option value="nri">NRI</Select.Option>
                    <Select.Option value="rnor">RNOR</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="pan" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>🆔 PAN</span>}><Input placeholder="XXXXX0000X" size="large" /></Form.Item>
                <Form.Item name="city" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>📍 City</span>} rules={[{ required: true }]}><Input placeholder="Enter city" size="large" /></Form.Item>
                <Form.Item name="engagementPurpose" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>🎯 Goal</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select goal" size="large">
                    <Select.Option value="tax_filing">Tax Filing</Select.Option>
                    <Select.Option value="loan_expansion">Loan Planning</Select.Option>
                    <Select.Option value="compliance_cleanup">Compliance</Select.Option>
                    <Select.Option value="advisory">Advisory</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="timeSensitivity" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>⏱️ Urgency</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select urgency" size="large">
                    <Select.Option value="deadline_driven">Deadline-driven</Select.Option>
                    <Select.Option value="advisory_only">Advisory-only</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="engagementType" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>📅 Scope</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select scope" size="large">
                    <Select.Option value="one_time">One-time</Select.Option>
                    <Select.Option value="ongoing">Ongoing</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="phone" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>📱 Phone</span>} rules={[{ required: true }]}><Input placeholder="Enter phone" size="large" /></Form.Item>
              </div>
            </FormSection>
          </div>

          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <FormSection>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Form.Item name="industry" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>🏢 Industry</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select industry" size="large">
                    <Select.Option value="manufacturing">Manufacturing</Select.Option>
                    <Select.Option value="services">Services / Tech</Select.Option>
                    <Select.Option value="trading">Trading / Retail</Select.Option>
                    <Select.Option value="gig">Gig / Freelance</Select.Option>
                    <Select.Option value="salaried">Salaried Professional</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="turnoverBand" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>💰 Annual Turnover</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select band" size="large">
                    <Select.Option value="under_20l">&lt; 20 Lakhs</Select.Option>
                    <Select.Option value="20l_2cr">20 Lakhs - 2 Cr</Select.Option>
                    <Select.Option value="2cr_10cr">2 Cr - 10 Cr</Select.Option>
                    <Select.Option value="over_10cr">10 Cr +</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="incomeSources" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>💵 Income Sources</span>} rules={[{ required: true }]}>
                  <Select mode="multiple" placeholder="Select all that apply" size="large">
                    <Select.Option value="salary">Salary</Select.Option>
                    <Select.Option value="business">Business / Prof</Select.Option>
                    <Select.Option value="capital_gains">Capital Gains</Select.Option>
                    <Select.Option value="rental">Rental / IFOS</Select.Option>
                    <Select.Option value="foreign">Foreign Income</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="accountingMethod" label={<span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>📖 Accounting Method</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select method" size="large">
                    <Select.Option value="cash">Cash Basis</Select.Option>
                    <Select.Option value="accrual">Accrual Basis</Select.Option>
                    <Select.Option value="unknown">Don't Know</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </FormSection>
          </div>

          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <FormSection>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <Form.Item name="hasPastNotices" label={<span style={{ color: 'white' }}>📜 Past Notices?</span>} valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
                <Form.Item name="hasPendingFilings" label={<span style={{ color: 'white' }}>📅 Pending Filings?</span>} valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
                <Form.Item name="hasLoans" label={<span style={{ color: 'white' }}>🏦 Existing Loans?</span>} valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
                <Form.Item name="hasCryptoForeignAssets" label={<span style={{ color: 'white' }}>₿ Crypto/Foreign?</span>} valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
                <Form.Item name="isCashHeavy" label={<span style={{ color: 'white' }}>💸 Cash-Heavy?</span>} valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
              </div>
            </FormSection>
          </div>

          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <FormSection>
              {renderChecklist()}
              <Form.Item label={<span style={{ fontWeight: '600', color: 'white' }}>📁 Upload Documents</span>}>
                <Upload {...props} style={{ width: '100%' }}>
                  <Button icon={<UploadOutlined />} size="large" block>Select Documents</Button>
                </Upload>
              </Form.Item>
            </FormSection>
          </div>

          <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
            <FormSection>
              <CAInfoCard>
                <Title level={3} style={{ color: 'var(--primary-color)' }}>💰 Fee: ₹{selectedCA?.consultationFee}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{selectedCA?.specializations?.join(', ')}</Text>
              </CAInfoCard>
              <AuthGuard>
                <PaymentButton type="primary" onClick={handleConsultationSubmit} loading={uploading} block>
                  {uploading ? '⏳ Processing...' : `💳 Pay ₹${selectedCA?.consultationFee} & Start`}
                </PaymentButton>
              </AuthGuard>
            </FormSection>
          </div>
        </Form>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
          <Button size="large" onClick={prev} disabled={currentStep === 0 || uploading}>← Previous</Button>
          {currentStep < 4 && <Button type="primary" size="large" onClick={next}>Next →</Button>}
        </div>
      </Modal>
    </ModalContainer>
  );
};

export default ConsultationModal;