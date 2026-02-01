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
  CheckCircleOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import moment from 'moment';
import { DecisionReadinessCard, DecisionPackViewer } from '../components/moat';

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
  background: rgba(20, 20, 20, 0.5);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  padding: 60px;
  
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  animation: ${slideUp} 0.8s ease-out;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fff 0%, #aaa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
`;

const CustomSteps = styled(Steps)`
  margin-bottom: 60px;
  
  .ant-steps-item-process .ant-steps-item-icon {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background: transparent;
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  .ant-steps-item-title {
    color: rgba(255, 255, 255, 0.6) !important;
    font-weight: 500;
  }
  
  .ant-steps-item-active .ant-steps-item-title {
    color: white !important;
    font-weight: 700;
  }
`;

const FormSection = styled.div`
  animation: ${slideUp} 0.6s ease-out;
`;

const StyledInput = styled(Input)`
  height: 60px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  padding: 0 24px;
  transition: all 0.3s;

  &:hover, &:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--primary-color);
  }
`;


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
  height: 60px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0 48px;
  background: var(--primary-color);
  border: none;
  color: black;
  box-shadow: 0 8px 25px rgba(0, 176, 240, 0.3);
  margin-top: 40px;
  
  &:hover {
    transform: translateY(-2px);
    background: white;
    color: black;
    box-shadow: 0 12px 30px rgba(255, 255, 255, 0.3);
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

  // Restore state logic
  useEffect(() => {
    // Check if we have saved state
    const savedState = sessionStorage.getItem('pendingFinancialPlan');
    const token = localStorage.getItem('token');

    // Check if returning from login (state param)
    const justLoggedIn = location.state?.from === '/financial-planning' || location.search.includes('restored');

    if (savedState && token) {
      try {
        const { formData, purpose, step } = JSON.parse(savedState);

        // Restore
        form.setFieldsValue(formData);
        if (purpose) setPlanningPurpose(purpose);
        if (step) setCurrentStep(step);

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
        { id: `${p.id}-1`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '10:00 AM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-2`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '2:00 PM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-3`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '11:00 AM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-4`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '4:00 PM', analyst: p.name, plannerId: p.id }
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
      title: 'Documents',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Upload Documents (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Our AI will analyze your documents to provide better insights.</p>
          </div>
          <Upload.Dragger
            multiple
            name="file"
            action="/api/documents/upload"
            data={{
              category: planningPurpose === 'business_expansion' ? 'financial_statements' : 'bank_statements'
            }}
            headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
            onChange={(info) => {
              if (info.file.status === 'done') {
                message.success(`${info.file.name} uploaded successfully`);
                setUploadedDocumentIds(prev => [...prev, info.file.response.document.id]);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} upload failed.`);
              }
            }}
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: 'var(--primary-color)' }} /></p>
            <p className="ant-upload-text" style={{ color: 'white' }}>Click or drag PDF/Excel files to this area to upload</p>
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="monthlyIncome" label={<span style={{ color: 'white' }}>Monthly Income</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 1,00,00,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlySavings" label={<span style={{ color: 'white' }}>Monthly Savings</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 30,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="incomeStability" label={<span style={{ color: 'white' }}>Income Stability</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="very_stable">Very Stable</Option>
                  <Option value="stable">Stable</Option>
                  <Option value="variable">Variable</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="riskPreference" label={<span style={{ color: 'white' }}>Risk Tolerance</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="stability">Conservative (Stability)</Option>
                  <Option value="balanced">Balanced</Option>
                  <Option value="aggressive">Aggressive (High Risk)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="investmentExperience" label={<span style={{ color: 'white' }}>Experience</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="none">No Experience</Option>
                  <Option value="beginner">Beginner</Option>
                  <Option value="experienced">Experienced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="achievementTimeline" label={<span style={{ color: 'white' }}>Time Horizon</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="1_3_years">1-3 Years</Option>
                  <Option value="3_7_years">3-7 Years</Option>
                  <Option value="over_7_years">7+ Years</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasHealthInsurance" label={<span style={{ color: 'white' }}>Health Insurance?</span>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasLifeInsurance" label={<span style={{ color: 'white' }}>Life Insurance?</span>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="successPriority" label={<span style={{ color: 'white' }}>What is most important?</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="peace_of_mind">Capital Protection (Peace of Mind)</Option>
                  <Option value="maximizing_returns">High Growth (Max Returns)</Option>
                  <Option value="predictable_income">Regular Income</Option>
                </Select>
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="businessType" label={<span style={{ color: 'white' }}>Business Structure</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="sole_proprietor">Sole Proprietorship</Option>
                  <Option value="partnership">Partnership</Option>
                  <Option value="pvt_ltd">Private Ltd</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industryType" label={<span style={{ color: 'white' }}>Industry</span>} rules={[{ required: true }]}>
                <StyledInput placeholder="e.g. Retail, Tech, Mfg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annualRevenue" label={<span style={{ color: 'white' }}>Annual Revenue</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 50,00,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="profitMargin" label={<span style={{ color: 'white' }}>Profit Margin (%)</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="30+">30% +</Option>
                  <Option value="15-30">15-30%</Option>
                  <Option value="5-15">5-15%</Option>
                  <Option value="0-5">0-5%</Option>
                  <Option value="negative">Negative</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cashReserves" label={<span style={{ color: 'white' }}>Cash Reserves (Months)</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="6+">6 Months +</Option>
                  <Option value="3-6">3-6 Months</Option>
                  <Option value="1-3">1-3 Months</Option>
                  <Option value="<1">Less than 1 Month</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employeeCount" label={<span style={{ color: 'white' }}>Employee Count</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="1-10">1-10</Option>
                  <Option value="11-50">11-50</Option>
                  <Option value="51-200">51-200</Option>
                  <Option value="200+">200+</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expansionType" label={<span style={{ color: 'white' }}>Expansion Goal</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="new_location">New Location</Option>
                  <Option value="new_product">New Product Line</Option>
                  <Option value="market_expansion">Market Expansion</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fundingRequired" label={<span style={{ color: 'white' }}>Funding Required</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 25,00,000" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="expansionTimeline" label={<span style={{ color: 'white' }}>Expansion Timeline</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="immediate">Immediate (0-3 Months)</Option>
                  <Option value="short_term">Short Term (3-6 Months)</Option>
                  <Option value="planned">Planned (6+ Months)</Option>
                </Select>
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="totalDebtAmount" label={<span style={{ color: 'white' }}>Total Debt</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 10,00,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyEMI" label={<span style={{ color: 'white' }}>Current Monthly EMI</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 50,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyIncome" label={<span style={{ color: 'white' }}>Monthly Income</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 1,00,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyExpenses" label={<span style={{ color: 'white' }}>Monthly Expenses</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 40,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="incomeStability" label={<span style={{ color: 'white' }}>Income Stability</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="very_stable">Very Stable (Govt/MNC)</Option>
                  <Option value="stable">Stable (Pvt)</Option>
                  <Option value="variable">Variable (Business/Freelance)</Option>
                  <Option value="unstable">Unstable</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="debtTypes" label={<span style={{ color: 'white' }}>Types of Debt</span>} rules={[{ required: true }]}>
                <Select mode="multiple" size="large" placeholder="Select all that apply">
                  <Option value="personal_loan">Personal Loan</Option>
                  <Option value="credit_card">Credit Card</Option>
                  <Option value="business_loan">Business Loan</Option>
                  <Option value="home_loan">Home Loan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="settlementGoal" label={<span style={{ color: 'white' }}>Primary Goal</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="reduce_emi">Reduce Monthly EMI</Option>
                  <Option value="debt_free">Become Debt Free Faster</Option>
                  <Option value="consolidate">Consolidate Loans</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: 0 }}>
            Here is a summary of the data we'll use for your analysis.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 32, borderRadius: 24, marginBottom: 24 }}>
          <Row gutter={[32, 32]}>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Purpose</div>
              <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {planningPurpose?.replace('_', ' ')}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Monthly Income</div>
              <div style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 600 }}>
                {form.getFieldValue('monthlyIncome') || 'Not provided'}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Documents</div>
              <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>
                {uploadedDocumentIds.length} file(s) attached
              </div>
            </Col>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
              <Tag color={form.getFieldsValue(true).monthlyIncome ? 'success' : 'warning'}>
                {form.getFieldsValue(true).monthlyIncome ? 'Data Ready' : 'Incomplete'}
              </Tag>
            </Col>
          </Row>
        </div>

        <Alert
          message="Final Step: Get AI Insights"
          description="Clicking 'Get Insights' will calculate your MOAT scores and generate a strategic plan based on the data above."
          type="info"
          showIcon
          style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid #1890ff' }}
        />
      </FormSection>
    )
  };

  const getStepsForPurpose = () => {
    if (!planningPurpose) return [purposeSelectionStep];
    const specificSteps = planningPurpose === 'business_expansion' ? businessExpansionSteps
      : planningPurpose === 'loan_settlement' ? loanSettlementSteps
        : investmentSteps;
    return [purposeSelectionStep, ...specificSteps, previewStep];
  };

  const steps = getStepsForPurpose();

  const handleBookConsultation = async () => {
    if (!selectedSlot) {
      message.error('Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      await api.post('/financial-planning/book-consultation', {
        submissionId: submissionData.id,
        consultationSlot: {
          date: selectedSlot.date,
          time: selectedSlot.time,
          plannerId: selectedSlot.plannerId
        }
      });

      message.success('Consultation booked successfully!');
      setBookingModalVisible(false);
      // Maybe navigate to dashboard?
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeepInsights = async () => {
    if (!submissionData?.id) return;

    try {
      setFetchingPack(true);
      const response = await api.get(`/decision-packs/${submissionData.id}`);
      setPackData(response.data.data);
      setPackModalVisible(true);
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await api.post(`/decision-packs/${submissionData.id}/generate`);
          const retryRes = await api.get(`/decision-packs/${submissionData.id}`);
          setPackData(retryRes.data.data);
          setPackModalVisible(true);
          return;
        } catch (e) {
          console.error('Retry generation failed', e);
        }
      }
      message.error(err.response?.data?.error || 'Failed to fetch deep insights');
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
            step: currentStep
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
              // Generate scores
              await api.post(`/decision-packs/${response.data.submission.id}/generate`);
              const scoresRes = await api.get(`/decision-packs/${response.data.submission.id}/scores`);
              setScores(scoresRes.data.data);
            } catch (e) {
              console.error('Insights gen error', e);
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
                          Unlock comprehensive AI-generated strategic roadmaps and stress-testing reports. A small processing fee applies for full insights.
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
                            Get AI insights
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

        <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ color: 'white', margin: 0 }}>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</h3>
          <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

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
