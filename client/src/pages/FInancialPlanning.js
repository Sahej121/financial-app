import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  Steps,
  Modal,
  Row,
  Col,
  Spin,
  Empty,
  Alert,
  Slider,
  Radio,
  Checkbox,
  Switch,
  Divider,
  Card,
  Tag
} from 'antd';
import {
  UploadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import moment from 'moment';
import { DecisionReadinessCard, DecisionPackViewer } from '../components/moat';
import { initiatePayment } from '../services/paymentService';

const { Option } = Select;
const { TextArea } = Input;

// --- Animations ---
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 100px 24px;
  background: #000;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;

  /* Mesh Background */
  background: 
    radial-gradient(circle at 10% 20%, rgba(0, 176, 240, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 90% 50%, rgba(242, 200, 17, 0.05) 0%, transparent 40%);
`;

const WizardCard = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
  padding: 60px;
  position: relative;
  overflow: hidden;
  
  /* Glow effect */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(0, 176, 240, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
  animation: ${slideUp} 0.8s ease-out;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
    color: white;
  }

  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.5);
    max-width: 600px;
    margin: 0 auto;
    font-weight: 400;
  }
`;

const CustomSteps = styled(Steps)`
  margin-bottom: 50px;
  
  .ant-steps-item-process .ant-steps-item-icon {
    background: #00B0F0;
    border-color: #00B0F0;
    box-shadow: 0 0 15px rgba(0, 176, 240, 0.4);
  }
  
  .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
    color: black;
  }

  .ant-steps-item-wait .ant-steps-item-icon {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon {
    color: rgba(255, 255, 255, 0.3);
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background: rgba(0, 176, 240, 0.1);
    border-color: #00B0F0;
  }

  .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
    color: #00B0F0;
  }

  .ant-steps-item-title {
    color: rgba(255, 255, 255, 0.4) !important;
    font-size: 14px;
    font-weight: 500;
  }
  
  .ant-steps-item-process .ant-steps-item-title {
    color: white !important;
    font-weight: 600;
  }
  
  .ant-steps-item-finish .ant-steps-item-title {
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .ant-steps-item-tail::after {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
    background-color: #00B0F0 !important;
  }
`;

const FormSection = styled.div`
  animation: ${slideUp} 0.6s ease-out;
`;

const StyledInput = styled(Input)`
  height: var(--input-height);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  color: white;
  font-size: 16px;
  padding: 0 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;

  &:hover {
    background: var(--input-bg-hover);
    border-color: var(--input-border-hover);
  }

  &:focus {
    background: rgba(0, 0, 0, 0.4);
    border-color: var(--input-border-focus);
    box-shadow: var(--input-focus-shadow);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  
  .ant-select-selector {
    height: var(--input-height) !important;
    background: var(--input-bg) !important;
    border: 1px solid var(--input-border) !important;
    border-radius: var(--input-radius) !important;
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
    color: var(--text-muted) !important;
    font-size: 16px;
  }

  .ant-select-arrow {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  &:hover .ant-select-selector {
    background: var(--input-bg-hover) !important;
    border-color: var(--input-border-hover) !important;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: var(--input-border-focus) !important;
    box-shadow: var(--input-focus-shadow) !important;
  }
  
  &.ant-select-multiple .ant-select-selection-item {
    background: rgba(0, 176, 240, 0.2) !important;
    border: 1px solid rgba(0, 176, 240, 0.3) !important;
    border-radius: 6px !important;
  }
  
  &.ant-select-multiple .ant-select-selection-item-content {
    color: #00B0F0 !important;
    font-weight: 500;
  }
  
  &.ant-select-multiple .ant-select-selection-item-remove {
    color: rgba(255, 255, 255, 0.5) !important;
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


const TimeSlotCard = styled.div`
  background: ${props => props.selected ? 'rgba(0, 176, 240, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.selected ? '#00B0F0' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(0, 176, 240, 0.05);
    border-color: #00B0F0;
    transform: translateY(-4px);
  }

  h4 {
    color: white;
    font-size: 1.2rem;
    margin: 0 0 8px;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.95rem;
  }
  
  .icon {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 24px;
    color: ${props => props.selected ? '#00B0F0' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const NextButton = styled(Button)`
  height: var(--input-height);
  border-radius: var(--input-radius);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0 48px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%) !important;
  border: none;
  color: white !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  margin-top: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const StepIndicator = styled.div`
  h2 {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
  }
  
  h3 {
    color: white;
    font-size: 36px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -1px;
    line-height: 1.1;
    font-family: 'Inter', sans-serif;
  }
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
  
  .fill {
    height: 100%;
    background: #00B0F0;
    box-shadow: 0 0 15px rgba(0, 176, 240, 0.6);
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (max-width: 576px) {
    width: 100%;
  }
`;

const FinancialPlanning = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState([]);
  const [planningPurpose, setPlanningPurpose] = useState(null);

  // New States for Insights Flow
  const [showInsights, setShowInsights] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [scores, setScores] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [isProcessingInsights, setIsProcessingInsights] = useState(false);
  const [packData, setPackData] = useState(null);
  const [packModalVisible, setPackModalVisible] = useState(false);
  const [fetchingPack, setFetchingPack] = useState(false);

  // Auto-fill Logic
  const autoFillForm = async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}/insights`);
      if (res.data.insight && res.data.insight.extractedData) {
        const data = res.data.insight.extractedData;
        const updates = {};

        // Map Bank Statement data to Planning fields
        if (data.avgMonthlyBalance) updates.monthlyIncome = Math.round(data.avgMonthlyBalance);
        if (data.totalCredits && !updates.monthlyIncome) updates.monthlyIncome = Math.round(data.totalCredits / 6); // Rough estimate if only total Credits for 6mo

        if (data.loanEmis && data.loanEmis.length > 0) {
          const totalEmi = data.loanEmis.reduce((sum, e) => sum + (e.emiAmount || e.amount || 0), 0);
          updates.monthlyEMI = totalEmi;
          updates.totalDebtAmount = totalEmi * 12; // Placeholder estimate
        }

        if (data.accountHolder) updates.fullName = data.accountHolder; // If we add name field

        if (Object.keys(updates).length > 0) {
          form.setFieldsValue(updates);
          message.success({
            content: 'Magic Ingestion: AI has pre-filled your profile from the document!',
            icon: <RobotOutlined style={{ color: '#00B0F0' }} />,
            duration: 5
          });
        }
      }
    } catch (e) {
      console.log('Auto-fill check failed', e);
    }
  };

  // Restore state logic
  useEffect(() => {
    // Check if we have saved state
    const savedState = sessionStorage.getItem('pendingFinancialPlan');
    const token = localStorage.getItem('token');

    // Check if returning from login (state param)
    const justLoggedIn = location.state?.from === '/financial-planning' || location.search.includes('restored');

    if (savedState && token) {
      try {
        const { formData, purpose, step, docIds } = JSON.parse(savedState);

        // Restore
        if (formData) form.setFieldsValue(formData);
        if (purpose) setPlanningPurpose(purpose);
        if (step) setCurrentStep(step);
        if (docIds) setUploadedDocumentIds(docIds);

        message.success('Welcome back! Your progress has been restored.');

        // Keep storage until successful submission? 
        // Or clear it now? If we clear now and they refresh, it's gone.
        // Better to clear only on success.
      } catch (e) {
        console.error('Failed to restore state', e);
      }
    }
  }, [form, location]);

  const fetchAnalysts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/financial-planners');
      const planners = response.data;

      if (!planners || planners.length === 0) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      // Generate time slots
      const slots = planners.flatMap((p) => [
        { id: `${p.id}-1`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '10:00 AM', analyst: p.name || 'Professional Analyst', plannerId: p.id },
        { id: `${p.id}-2`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '2:00 PM', analyst: p.name || 'Professional Analyst', plannerId: p.id },
        { id: `${p.id}-3`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '11:00 AM', analyst: p.name || 'Professional Analyst', plannerId: p.id },
        { id: `${p.id}-4`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '4:00 PM', analyst: p.name || 'Professional Analyst', plannerId: p.id }
      ]);

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching planners:', err);
      // Don't show error to user immediately, just log
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysts();
  }, [fetchAnalysts]);

  // --- Step Definitions ---

  const purposeSelectionStep = {
    title: 'Purpose',
    content: (
      <FormSection>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h2 style={{ color: 'white', marginBottom: 12 }}>What brings you here today?</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Select your primary purpose to get tailored questions.</p>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <TimeSlotCard
              selected={planningPurpose === 'investment'}
              onClick={() => setPlanningPurpose('investment')}
              style={{ height: '100%', textAlign: 'center', padding: 32 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <h4>Investment</h4>
              <p>Build wealth through strategic investments, retirement planning, or portfolio growth.</p>
            </TimeSlotCard>
          </Col>
          <Col xs={24} md={8}>
            <TimeSlotCard
              selected={planningPurpose === 'business_expansion'}
              onClick={() => setPlanningPurpose('business_expansion')}
              style={{ height: '100%', textAlign: 'center', padding: 32 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h4>Business Expansion</h4>
              <p>Scale your business, secure funding, or optimize operations for growth.</p>
            </TimeSlotCard>
          </Col>
          <Col xs={24} md={8}>
            <TimeSlotCard
              selected={planningPurpose === 'loan_settlement'}
              onClick={() => setPlanningPurpose('loan_settlement')}
              style={{ height: '100%', textAlign: 'center', padding: 32 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
              <h4>Loan Settlement</h4>
              <p>Manage debt, restructure loans, or create a debt-free strategy.</p>
            </TimeSlotCard>
          </Col>
        </Row>
      </FormSection>
    )
  };

  const commonSteps = {
    documents: {
      title: 'Magic Ingestion',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Scan Your Financial Story</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Upload a bank statement or financial report. Our AI will auto-fill your profile to save you time.</p>
          </div>
          <Upload.Dragger
            multiple
            name="file"
            customRequest={async ({ file, onSuccess, onError }) => {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('category', planningPurpose === 'business_expansion' ? 'financial_statements' : 'bank_statements');

              try {
                const response = await api.post('/documents/upload', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
                onSuccess(response.data, file);
              } catch (error) {
                onError(error);
              }
            }}
            onChange={(info) => {
              if (info.file.status === 'done') {
                message.success(`${info.file.name} uploaded successfully`);
                // The response structure might depend on how axios returns it vs how antd expects it in onSuccess
                // api.post returns { data: ... }. In onSuccess(response.data), info.file.response will be response.data.
                const docId = info.file.response?.document?.id || info.file.response?.data?.document?.id;
                if (docId) {
                  setUploadedDocumentIds(prev => {
                    const next = [...prev, docId];
                    // Update session storage if it exists
                    const saved = sessionStorage.getItem('pendingFinancialPlan');
                    if (saved) {
                      const constParsed = JSON.parse(saved);
                      constParsed.docIds = next;
                      sessionStorage.setItem('pendingFinancialPlan', JSON.stringify(constParsed));
                    }
                    return next;
                  });
                  // Trigger Auto-fill
                  autoFillForm(docId);
                }
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} upload failed.`);
                console.error('Upload error:', info.file.error);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: '#00B0F0', fontSize: 32 }} /></p>
            <p className="ant-upload-text" style={{ color: 'white', fontSize: '16px', marginTop: 16 }}>Click or drag files to upload</p>
            <p className="ant-upload-hint" style={{ color: 'rgba(255,255,255,0.4)' }}>Support for PDF, Excel</p>
          </Upload.Dragger>
        </FormSection>
      )
    }
  };

  const investmentSteps = [
    {
      title: 'Goals & Profile',
      content: (
        <FormSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="monthlyIncome" label={<FieldLabel required>Monthly Income</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 1,00,00,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="monthlySavings" label={<FieldLabel required>Monthly Savings</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 30,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="incomeStability" label={<FieldLabel required>Income Stability</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="very_stable">Very Stable</Option>
                  <Option value="stable">Stable</Option>
                  <Option value="variable">Variable</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="riskPreference" label={<FieldLabel required>Risk Tolerance</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="stability">Conservative (Stability)</Option>
                  <Option value="balanced">Balanced</Option>
                  <Option value="aggressive">Aggressive (High Risk)</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="investmentExperience" label={<FieldLabel required>Experience</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="none">No Experience</Option>
                  <Option value="beginner">Beginner</Option>
                  <Option value="experienced">Experienced</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="achievementTimeline" label={<FieldLabel required>Time Horizon</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="1_3_years">1-3 Years</Option>
                  <Option value="3_7_years">3-7 Years</Option>
                  <Option value="over_7_years">7+ Years</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={12} md={12}>
              <Form.Item name="hasHealthInsurance" label={<FieldLabel>Health Insurance?</FieldLabel>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={12}>
              <Form.Item name="hasLifeInsurance" label={<FieldLabel>Life Insurance?</FieldLabel>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="successPriority" label={<FieldLabel required>Primary Goal</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="peace_of_mind">Capital Protection (Peace of Mind)</Option>
                  <Option value="maximizing_returns">High Growth (Max Returns)</Option>
                  <Option value="predictable_income">Regular Income</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    commonSteps.documents
  ];

  const businessExpansionSteps = [
    {
      title: 'Business Profile',
      content: (
        <FormSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="businessType" label={<FieldLabel required>Structure</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="sole_proprietor">Sole Proprietorship</Option>
                  <Option value="partnership">Partnership</Option>
                  <Option value="pvt_ltd">Private Ltd</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="industryType" label={<FieldLabel required>Industry</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput placeholder="e.g. Retail, Tech, Mfg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="annualRevenue" label={<FieldLabel required>Annual Revenue</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 50,00,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="profitMargin" label={<FieldLabel required>Profit Margin (%)</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="30+">30% +</Option>
                  <Option value="15-30">15-30%</Option>
                  <Option value="5-15">5-15%</Option>
                  <Option value="0-5">0-5%</Option>
                  <Option value="negative">Negative</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="cashReserves" label={<FieldLabel required>Cash Reserves</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="6+">6 Months +</Option>
                  <Option value="3-6">3-6 Months</Option>
                  <Option value="1-3">1-3 Months</Option>
                  <Option value="<1">Less than 1 Month</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="employeeCount" label={<FieldLabel required>Employee Count</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="1-10">1-10</Option>
                  <Option value="11-50">11-50</Option>
                  <Option value="51-200">51-200</Option>
                  <Option value="200+">200+</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="expansionType" label={<FieldLabel required>Expansion Goal</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="new_location">New Location</Option>
                  <Option value="new_product">New Product Line</Option>
                  <Option value="market_expansion">Market Expansion</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fundingRequired" label={<FieldLabel required>Funding Required</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 25,00,000" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="expansionTimeline" label={<FieldLabel required>Expansion Timeline</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="immediate">Immediate (0-3 Months)</Option>
                  <Option value="short_term">Short Term (3-6 Months)</Option>
                  <Option value="planned">Planned (6+ Months)</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    commonSteps.documents
  ];

  const loanSettlementSteps = [
    {
      title: 'Debt Profile',
      content: (
        <FormSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="totalDebtAmount" label={<FieldLabel required>Total Debt</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 10,00,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="monthlyEMI" label={<FieldLabel required>Current EMI</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 50,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="monthlyIncome" label={<FieldLabel required>Monthly Income</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 1,00,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="monthlyExpenses" label={<FieldLabel required>Monthly Expenses</FieldLabel>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 40,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="incomeStability" label={<FieldLabel required>Income Stability</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="very_stable">Very Stable (Govt/MNC)</Option>
                  <Option value="stable">Stable (Pvt)</Option>
                  <Option value="variable">Variable (Business/Freelance)</Option>
                  <Option value="unstable">Unstable</Option>

                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="debtTypes" label={<FieldLabel required>Types of Debt</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect mode="multiple" size="large" placeholder="Select all that apply">
                  <Option value="personal_loan">Personal Loan</Option>
                  <Option value="credit_card">Credit Card</Option>
                  <Option value="business_loan">Business Loan</Option>
                  <Option value="home_loan">Home Loan</Option>
                  <Option value="car_loan">Car Loan</Option>
                  <Option value="education_loan">Education Loan</Option>
                  <Option value="other">Other</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="settlementGoal" label={<FieldLabel required>Primary Goal</FieldLabel>} rules={[{ required: true }]}>
                <StyledSelect size="large">
                  <Option value="reduce_emi">Reduce Monthly EMI</Option>
                  <Option value="debt_free">Become Debt Free Faster</Option>
                  <Option value="consolidate">Consolidate Loans</Option>
                  <Option value="lower_interest">Lower Interest Rates</Option>
                  <Option value="improve_credit">Improve Credit Score</Option>
                  <Option value="other">Other</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
          </Row >
        </FormSection >
      )
    },
    commonSteps.documents
  ];

  // Final confirmation/preview step - REFACTORED to show actual data summary
  const previewStep = {
    title: 'Review',
    content: (
      <FormSection>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ color: 'white', marginBottom: 16 }}>Ready for your analysis?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 0 }}>
            Here is a summary of the data we'll use for your analysis.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 24, marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={12} md={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.8rem' }}>Purpose</div>
              <div style={{ color: 'white', fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {planningPurpose?.replace('_', ' ')}
              </div>
            </Col>
            <Col xs={12} md={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.8rem' }}>Income</div>
              <div style={{ color: 'var(--primary-color)', fontSize: '1rem', fontWeight: 600 }}>
                {form.getFieldValue('monthlyIncome') || 'N/A'}
              </div>
            </Col>
            <Col xs={12} md={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.8rem' }}>Documents</div>
              <div style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>
                {uploadedDocumentIds.length} attached
              </div>
            </Col>
            <Col xs={12} md={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.8rem' }}>Status</div>
              <Tag color={form.getFieldsValue(true).monthlyIncome ? 'success' : 'warning'} style={{ margin: 0 }}>
                {form.getFieldsValue(true).monthlyIncome ? 'Ready' : 'Incomplete'}
              </Tag>
            </Col>
          </Row>
        </div>

        <Alert
          message="Final Step: Get AI Insights"
          description="We'll calculate your MOAT scores instantly."
          type="info"
          showIcon
          style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid #1890ff' }}
        />
      </FormSection>
    )
  };

  const getStepsForPurpose = () => {
    if (!planningPurpose) return [purposeSelectionStep];

    // Core Refactor: Documents (Magic Ingestion) is ALWAYS the first step after purpose
    const baseSteps = [purposeSelectionStep, commonSteps.documents];

    const specificSteps = planningPurpose === 'business_expansion' ? businessExpansionSteps
      : planningPurpose === 'loan_settlement' ? loanSettlementSteps
        : investmentSteps;

    // Filter out the document step from specificSteps as it's now global Step 2
    const filteredSpecific = specificSteps.filter(s => s.title !== 'Documents' && s.title !== 'Magic Ingestion');

    return [...baseSteps, ...filteredSpecific, previewStep];
  };

  const steps = getStepsForPurpose();

  const handleBookConsultation = async () => {
    if (!selectedSlot) {
      message.error('Please select a time slot');
      return;
    }

    try {
      setLoading(true);

      // 1. Initiate Payment
      await initiatePayment({
        amount: 499, // Consultation Fee
        purpose: 'consultation_booking',
        referenceId: 0, // No specific ref ID yet
        metadata: {
          meetingDetails: {
            professionalId: 1, // Placeholder Analyst ID
            professionalRole: 'financial_planner',
            title: `Portfolio Review with Analyst`,
            startsAt: selectedSlot.date,
            endsAt: moment(selectedSlot.date).add(1, 'hour').toISOString(),
            clientNotes: 'Booked via Financial Planning Wizard',
            intakeFields: {
              submissionId: submissionData?.id
            }
          }
        }
      }, (paymentRes) => {
        // On Success
        message.success('Consultation booked successfully!');
        setBookingModalVisible(false);
        navigate('/dashboard');
      }, (error) => {
        // On Error
        message.error(error);
      });

    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeepInsights = async () => {
    if (!submissionData?.id) return;

    try {
      setFetchingPack(true);

      // 1. Initiate Payment for Deep Insights
      await initiatePayment({
        amount: 999,
        purpose: 'financial_planning_insights',
        referenceId: submissionData.id,
      }, async (paymentRes) => {
        // On Success: Refresh submission data to get updated isPaid status
        try {
          const subRes = await api.get(`/financial-planning/submission/${submissionData.id}`);
          if (subRes.data.success) {
            setSubmissionData(subRes.data.submission);
          }

          const response = await api.get(`/decision-packs/${submissionData.id}`);
          setPackData(response.data.data);
          setPackModalVisible(true);
        } catch (err) {
          if (err.response?.status === 404) {
            await api.post(`/decision-packs/${submissionData.id}/generate`);
            const retryRes = await api.get(`/decision-packs/${submissionData.id}`);
            setPackData(retryRes.data.data);
            setPackModalVisible(true);
          } else {
            message.error('Failed to fetch insights even after payment. Please contact support.');
          }
        }
      }, (error) => {
        message.error(error);
      });

    } catch (err) {
      console.error('Payment flow failed:', err);
    } finally {
      setFetchingPack(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0 && !planningPurpose) {
        message.warning('Please select a purpose to continue');
        return;
      }

      // If we are on the Review step, we don't need to validate current fields
      if (currentStep < steps.length - 1) {
        await form.validateFields();
      }

      // Submit Logic
      if (currentStep === steps.length - 1) {
        setSubmitting(true);

        // 1. Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
          // Save and Redirect
          const formData = form.getFieldsValue(true);
          const stateToSave = {
            formData,
            purpose: planningPurpose,
            step: currentStep,
            docIds: uploadedDocumentIds
          };
          sessionStorage.setItem('pendingFinancialPlan', JSON.stringify(stateToSave));

          Modal.confirm({
            title: 'Sign In to View Insights',
            content: 'Please sign in to securely access your AI-generated financial analysis.',
            okText: 'Sign In',
            cancelText: 'Cancel',
            centered: true,
            onOk: () => navigate('/login', { state: { from: '/financial-planning' } })
          });
          setSubmitting(false);
          return;
        }

        // 2. Submit Data
        try {
          const formData = form.getFieldsValue(true);
          const payload = {
            ...formData,
            planningPurpose,
            documentIds: uploadedDocumentIds,
          };

          const response = await api.post('/financial-planning/submit', payload);

          if (response.data.success) {
            setSubmissionData(response.data.submission);
            sessionStorage.removeItem('pendingFinancialPlan');

            // 3. Trigger Insights Generation
            setIsProcessingInsights(true);
            try {
              // Fetch scores (backend already generates them during submission)
              const scoresRes = await api.get(`/decision-packs/${response.data.submission.id}/scores`);
              setScores(scoresRes.data.data);
            } catch (e) {
              console.error('Insights fetch error', e);
              // Fallback to fetch them anyway after showInsights is true?
            }

            // Show Insights View
            setShowInsights(true);
            window.scrollTo(0, 0);
          }
        } catch (err) {
          console.error('Submission error:', err);
          message.error(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
          setSubmitting(false);
          setIsProcessingInsights(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

  // --- Render Views ---

  if (showInsights) {
    return (
      <PageContainer>
        <WizardCard>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            {isProcessingInsights ? (
              <div style={{ padding: 40 }}>
                <Spin size="large" />
                <h2 style={{ color: 'white', marginTop: 20 }}>Analyzing your financial profile...</h2>
              </div>
            ) : (
              <>
                <h1 style={{ color: 'white', marginBottom: 8 }}>Analysis Complete</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Here represents your decision readiness.</p>

                <div style={{ maxWidth: 450, margin: '0 auto 40px' }}>
                  <DecisionReadinessCard
                    scores={scores}
                    purpose={planningPurpose}
                  />

                  {scores?.primaryScore !== undefined && (
                    <div style={{
                      marginTop: 24,
                      padding: '20px 24px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'left'
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                        AI Assessment Summary
                      </div>
                      <p style={{ color: 'white', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                        {scores.primaryScore >= 80 ? "Your financial foundation is robust, showing strong discipline and readiness for growth. Minor optimizations can further shield your assets." :
                          scores.primaryScore >= 60 ? "You are on the right track with a healthy balance. Some moderate risks were identified that could be mitigated for better stability." :
                            scores.primaryScore >= 40 ? "Your profile shows significant gaps or high liabilities that need attention to ensure your long-term financial security." :
                              "Significant financial stressors detected. Immediate restructuring is recommended to protect your capital and reduce liability."}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 40 }}>
                  <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} md={11}>
                      <div style={{ background: 'rgba(0, 176, 240, 0.05)', padding: 32, borderRadius: 24, border: '1px solid rgba(0, 176, 240, 0.1)', height: '100%' }}>
                        <h3 style={{ color: 'white', marginBottom: 12 }}>Expert Clarification</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: '0.95rem' }}>
                          Schedule a 1-on-1 with a professional analyst to deep-dive into these results and receive personalized advice.
                        </p>
                        <Button
                          type="primary"
                          size="large"
                          shape="round"
                          style={{ height: 50, padding: '0 40px', fontSize: 16 }}
                          onClick={() => setBookingModalVisible(true)}
                        >
                          Book consultation
                        </Button>
                      </div>
                    </Col>
                    <Col xs={24} md={11}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 32, borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
                        <h3 style={{ color: 'white', marginBottom: 12 }}>Deep AI Insights</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: '0.95rem' }}>
                          {submissionData?.isPaid
                            ? "Your strategic roadmap and stress-testing reports are now ready for review."
                            : "Unlock comprehensive AI-generated strategic roadmaps and stress-testing reports. A small processing fee applies."}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                          <Button
                            type="default"
                            size="large"
                            shape="round"
                            loading={fetchingPack}
                            style={{ height: 50, padding: '0 30px', fontSize: 16, background: 'var(--primary-color)', color: 'black', border: 'none' }}
                            onClick={handleGetDeepInsights}
                          >
                            {submissionData?.isPaid ? 'View Full Insights' : 'Unlock AI Insights'}
                          </Button>
                          <Button
                            type="text"
                            size="large"
                            shape="round"
                            style={{ height: 50, color: 'rgba(255,255,255,0.5)', fontSize: 15 }}
                            onClick={() => {
                              setShowInsights(false);
                              setCurrentStep(1);
                            }}
                          >
                            Refine Profile
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        </WizardCard>

        {/* Booking Modal */}
        <Modal
          visible={bookingModalVisible}
          onCancel={() => setBookingModalVisible(false)}
          title="Select a Time Slot"
          footer={[
            <Button key="cancel" onClick={() => setBookingModalVisible(false)}>Cancel</Button>,
            <Button key="confirm" type="primary" onClick={handleBookConsultation} disabled={!selectedSlot} loading={loading}>
              Confirm Booking
            </Button>
          ]}
          width={800}
        >
          <p>Choose a time to speak with our analysts.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {availableSlots.map(slot => (
              <TimeSlotCard
                key={slot.id}
                selected={selectedSlot?.id === slot.id}
                onClick={() => setSelectedSlot(slot)}
                style={{ border: selectedSlot?.id === slot.id ? '1px solid #1890ff' : '1px solid #444' }}
              >
                <div style={{ fontWeight: 'bold', color: 'white' }}>{moment(slot.date).format('MMM DD')}</div>
                <div style={{ color: '#ccc' }}>{slot.time}</div>
                <div style={{ fontSize: 12, color: '#888' }}>with {slot.analyst}</div>
              </TimeSlotCard>
            ))}
          </div>
        </Modal>

        {/* Deep AI Insights Modal */}
        <Modal
          title={null}
          visible={packModalVisible}
          onCancel={() => setPackModalVisible(false)}
          footer={null}
          width={1000}
          centered
          bodyStyle={{
            background: '#111',
            padding: '40px',
            maxHeight: '85vh',
            overflowY: 'auto',
            borderRadius: '24px'
          }}
          closeIcon={<span style={{ color: 'white', fontSize: '20px' }}>×</span>}
        >
          <DecisionPackViewer pack={packData} />
        </Modal>
      </PageContainer>
    );
  }

  // --- Default Form Wizard Render ---
  return (
    <PageContainer>
      <WizardCard>
        <Header>
          <h1>Financial Blueprint</h1>
          <p>Architect your wealth with our guided strategic planning tool.</p>
        </Header>

        <CustomSteps current={currentStep} style={{ display: 'none' }}>
          {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
        </CustomSteps>

        <StepHeader>
          <StepIndicator>
            <h2>Step {currentStep + 1} of {steps.length}</h2>
            <h3>{steps[currentStep].title}</h3>
          </StepIndicator>
          <ProgressBar>
            <div className="fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </ProgressBar>
        </StepHeader>

        <Form form={form} layout="vertical" preserve={true}>
          {steps[currentStep].content}

          <div style={{ textAlign: 'center' }}>
            {currentStep > 0 && (
              <Button
                size="large"
                type="text"
                style={{ color: 'rgba(255,255,255,0.5)', marginRight: 24, borderRadius: 30, height: 60, fontWeight: 600 }}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <NextButton onClick={next} loading={submitting} disabled={submitting}>
              {submitting ? 'Processing...' : (currentStep === steps.length - 1 ? 'Get Insights' : 'Continue')}
            </NextButton>
          </div>
        </Form>
      </WizardCard>
    </PageContainer>
  );
};

export default FinancialPlanning;
