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
import { DecisionReadinessCard } from '../components/moat';

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
            action={`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/documents/upload`}
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
      title: 'Goals',
      content: (
        <FormSection>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="targetAmount" label={<span style={{ color: 'white' }}>Target Amount</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 1,00,00,000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="achievementTimeline" label={<span style={{ color: 'white' }}>Time Horizon</span>} rules={[{ required: true }]}>
                <Select size="large" placeholder="Select timeline">
                  <Option value="1_3_years">Short (1-3 Years)</Option>
                  <Option value="3_5_years">Medium (3-5 Years)</Option>
                  <Option value="5_10_years">Long (5-10 Years)</Option>
                  <Option value="10_plus_years">Retirement (10+ Years)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="incomeType" label={<span style={{ color: 'white' }}>Source of Funds</span>} rules={[{ required: true }]}>
                <Select size="large" placeholder="Income Source">
                  <Option value="salary">Salary</Option>
                  <Option value="business">Business Income</Option>
                  <Option value="inheritance">Inheritance</Option>
                  <Option value="savings">Savings</Option>
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
              <Form.Item name="businessType" label={<span style={{ color: 'white' }}>Business Type</span>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="sole_proprietor">Sole Proprietorship</Option>
                  <Option value="partnership">Partnership</Option>
                  <Option value="pvt_ltd">Private Ltd</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annualRevenue" label={<span style={{ color: 'white' }}>Annual Revenue</span>} rules={[{ required: true }]}>
                <StyledInput prefix="₹" placeholder="e.g. 50,00,000" />
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

  // Final confirmation/preview step - REFACTORED to remove slots
  const previewStep = {
    title: 'Review',
    content: (
      <FormSection>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ color: 'white', marginBottom: 16 }}>Ready for your analysis?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: 0 }}>
            Our AI will analyze your profile and generate tailored insights.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Purpose</div>
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {planningPurpose?.replace('_', ' ')}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Documents</div>
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>
                {uploadedDocumentIds.length} Uploaded
              </div>
            </Col>
          </Row>
        </div>

        <Alert
          message="Next Step: Get AI Insights"
          description="We'll generate your Decision Readiness Score immediately. You can choose to consult with an expert afterwards."
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

  const next = async () => {
    try {
      if (currentStep === 0 && !planningPurpose) {
        message.warning('Please select a purpose to continue');
        return;
      }

      await form.validateFields();

      // Submit Logic
      if (currentStep === steps.length - 1) {
        setSubmitting(true);

        // 1. Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
          // Save and Redirect
          const formData = form.getFieldsValue();
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
          const formData = form.getFieldsValue();
          const payload = {
            ...formData,
            planningPurpose,
            documentIds: uploadedDocumentIds,
            // No consultationSlot here
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
                <p style={{ color: 'var(--text-secondary)' }}>Here represents your decision readiness.</p>

                <div style={{ maxWidth: 400, margin: '40px auto' }}>
                  <DecisionReadinessCard
                    scores={scores}
                    purpose={planningPurpose}
                  />
                </div>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30 }}>
                  <h3 style={{ color: 'white' }}>Want expert clarification?</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
                    Schedule a 1-on-1 with a financial analyst to discuss these insights.
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    style={{ height: 50, padding: '0 40px', fontSize: 16 }}
                    onClick={() => setBookingModalVisible(true)}
                  >
                    Book Consultation
                  </Button>
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

        <Form form={form} layout="vertical">
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
