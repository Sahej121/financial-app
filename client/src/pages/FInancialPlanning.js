import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ClockCircleOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import moment from 'moment';

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
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState([]);

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

      // Generate time slots for each planner (next 3 business days)
      const slots = planners.flatMap((p) => [
        { id: `${p.id}-1`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '10:00 AM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-2`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '2:00 PM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-3`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '11:00 AM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-4`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '4:00 PM', analyst: p.name, plannerId: p.id }
      ]);

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching planners:', err);
      setError('Unable to load available analysts. Please try again later.');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysts();
  }, [fetchAnalysts]);

  const steps = [
    {
      title: 'Goal',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 1: Goal Identification</h2>
            <p style={{ color: 'var(--text-secondary)' }}>What is your primary financial goal?</p>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item name="targetAmount" label={<span style={{ color: 'white' }}>Target Amount (Optional)</span>}>
                <StyledInput prefix="₹" placeholder="e.g. 1 Cr" type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="targetTimeline" label={<span style={{ color: 'white' }}>Target Timeline</span>}>
                <StyledInput placeholder="e.g. By age 50" />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Horizon',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 2: Time Horizon & Urgency</h2>
            <p style={{ color: 'var(--text-secondary)' }}>When do you want to achieve this goal?</p>
          </div>
          <Form.Item name="achievementTimeline" rules={[{ required: true }]}>
            <Radio.Group style={{ width: '100%', display: 'flex', gap: 10 }}>
              {['< 1 year', '1–3 years', '3–7 years', '7+ years'].map(val => (
                <Radio.Button key={val} value={val.toLowerCase().replace(/\s/g, '_')} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', color: 'white' }}>
                  {val}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="timelineFlexibility" label={<span style={{ color: 'white' }}>Is this deadline fixed or flexible?</span>}>
            <Radio.Group>
              <Radio value="fixed" style={{ color: 'white' }}>Fixed</Radio>
              <Radio value="flexible" style={{ color: 'white' }}>Flexible</Radio>
            </Radio.Group>
          </Form.Item>
        </FormSection>
      )
    },
    {
      title: 'Risk',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 3: Risk Profile</h2>
            <p style={{ color: 'var(--text-secondary)' }}>How would you react if your investments dropped 15% in a year?</p>
          </div>
          <Form.Item name="riskReaction" rules={[{ required: true }]}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Radio value="panic" style={{ color: 'white' }}>Panic and exit</Radio>
              <Radio value="uncomfortable" style={{ color: 'white' }}>Feel uncomfortable but stay invested</Radio>
              <Radio value="calm" style={{ color: 'white' }}>Stay calm and invest more</Radio>
            </Radio.Group>
          </Form.Item>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="investmentExperience" label={<span style={{ color: 'white' }}>Past Experience</span>}>
                <Select dropdownStyle={{ background: '#1f1f1f' }}>
                  <Option value="none">None</Option>
                  <Option value="beginner">Beginner</Option>
                  <Option value="experienced">Experienced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="riskPreference" label={<span style={{ color: 'white' }}>Preference</span>}>
                <Select dropdownStyle={{ background: '#1f1f1f' }}>
                  <Option value="stability">Stability</Option>
                  <Option value="balanced">Balanced</Option>
                  <Option value="aggressive">Aggressive Growth</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Income',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 4: Income & Cash Flow</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Understand capacity to invest and consistency.</p>
          </div>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="incomeType" label={<span style={{ color: 'white' }}>Income Type</span>}>
                <Select>
                  <Option value="salaried">Salaried</Option>
                  <Option value="self_employed">Self-employed</Option>
                  <Option value="business_owner">Business Owner</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="incomeStability" label={<span style={{ color: 'white' }}>Stability</span>}>
                <Select>
                  <Option value="very_stable">Very Stable</Option>
                  <Option value="stable">Stable</Option>
                  <Option value="variable">Variable</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyIncome" label={<span style={{ color: 'white' }}>Monthly Income Range</span>}>
                <StyledInput placeholder="e.g. 1L - 2L" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlySavings" label={<span style={{ color: 'white' }}>Monthly Savings Est.</span>}>
                <StyledInput type="number" prefix="₹" />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Assets',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 5: Assets Overview</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Net-worth context without overwhelming.</p>
          </div>
          <Form.Item name={['assets', 'cash']} label={<span style={{ color: 'white' }}>Cash & Bank Balance</span>}>
            <Slider min={0} max={5000000} step={100000} tooltip={{ formatter: value => `₹${(value / 100000).toFixed(1)}L` }} />
          </Form.Item>
          <Card size="small" title="Investments & Real Assets" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }} headStyle={{ color: 'white' }}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name={['assets', 'mutual_funds']} valuePropName="checked">
                  <Checkbox style={{ color: 'white' }}>Mutual Funds / Stocks</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['assets', 'fixed_income']} valuePropName="checked">
                  <Checkbox style={{ color: 'white' }}>Fixed Income (FD/PPF)</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['assets', 'real_estate']} valuePropName="checked">
                  <Checkbox style={{ color: 'white' }}>Property</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['assets', 'gold']} valuePropName="checked">
                  <Checkbox style={{ color: 'white' }}>Gold</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </FormSection>
      )
    },
    {
      title: 'Liability',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 6: Liabilities & Obligations</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Net return matters more than gross return.</p>
          </div>
          <Form.Item label={<span style={{ color: 'white' }}>Active Loans</span>}>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={8}><Checkbox value="home" style={{ color: 'white' }}>Home</Checkbox></Col>
                <Col span={8}><Checkbox value="education" style={{ color: 'white' }}>Education</Checkbox></Col>
                <Col span={8}><Checkbox value="personal" style={{ color: 'white' }}>Personal/CC</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="totalLiabilityAmount" label={<span style={{ color: 'white' }}>Approx Total Outstanding</span>}>
                <StyledInput prefix="₹" type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dependents" label={<span style={{ color: 'white' }}>Number of Dependents</span>}>
                <StyledInput type="number" />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Protection',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 7: Protection Check</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Prevent financial derailment.</p>
          </div>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="hasHealthInsurance" label={<span style={{ color: 'white' }}>Health Insurance?</span>} valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasLifeInsurance" label={<span style={{ color: 'white' }}>Life Insurance?</span>} valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="medicalConditions" label={<span style={{ color: 'white' }}>Any known medical conditions? (Optional)</span>}>
                <TextArea rows={2} placeholder="Briefly describe if any..." />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Tax',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 8: Tax & Location Context</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Optimise post-tax returns.</p>
          </div>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="taxResidency" label={<span style={{ color: 'white' }}>Tax Residency</span>}>
                <Select>
                  <Option value="resident">Resident</Option>
                  <Option value="nri">NRI</Option>
                  <Option value="rnor">RNOR</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxBracket" label={<span style={{ color: 'white' }}>Tax Bracket</span>}>
                <Select>
                  <Option value="0-5">0-5%</Option>
                  <Option value="5-20">5-20%</Option>
                  <Option value="20-30">20-30%</Option>
                  <Option value="30+">30%+</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="upcomingTaxEvents" label={<span style={{ color: 'white' }}>Upcoming Taxable Events (e.g. Property Sale, ESOPs)</span>}>
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Preferences',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 9: Preferences & Constraints</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Personalisation and trust.</p>
          </div>
          <Form.Item label={<span style={{ color: 'white' }}>Avoid Investment Types</span>}>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={8}><Checkbox value="crypto" style={{ color: 'white' }}>Crypto</Checkbox></Col>
                <Col span={8}><Checkbox value="stocks" style={{ color: 'white' }}>Direct Stocks</Checkbox></Col>
                <Col span={8}><Checkbox value="real_estate" style={{ color: 'white' }}>Real Estate</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="liquidityNeeds" valuePropName="checked">
            <Checkbox style={{ color: 'white' }}>High Liquidity Needed (Emergency Access)</Checkbox>
          </Form.Item>
          <Form.Item name="exposurePreference" label={<span style={{ color: 'white' }}>Exposure Preference</span>}>
            <Radio.Group>
              <Radio value="domestic" style={{ color: 'white' }}>Domestic</Radio>
              <Radio value="global" style={{ color: 'white' }}>Global</Radio>
              <Radio value="mixed" style={{ color: 'white' }}>Mixed</Radio>
            </Radio.Group>
          </Form.Item>
        </FormSection>
      )
    },
    {
      title: 'Documents',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 10: Document Upload (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Upload documents to get more accurate recommendations.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <Button type="dashed" icon={<FilePdfOutlined />} ghost style={{ borderRadius: 12 }}>Bank Statements</Button>
              <Button type="dashed" icon={<FileExcelOutlined />} ghost style={{ borderRadius: 12 }}>Investment Proofs</Button>
            </div>
            <Upload.Dragger
              name="file"
              multiple={true}
              customRequest={async (options) => {
                const { onSuccess, onError, file } = options;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', 'financial_statements');

                try {
                  const response = await api.post('/documents/upload', formData);
                  const documentId = response.data.document?.id;
                  if (documentId) {
                    setUploadedDocumentIds(prev => [...prev, documentId]);
                    onSuccess(response.data);
                    message.success(`${file.name} uploaded successfully`);
                  } else {
                    throw new Error('No document ID returned');
                  }
                } catch (err) {
                  console.error('Upload error:', err);
                  onError(err);
                  message.error(`${file.name} upload failed`);
                } finally {
                }
              }}
              style={{ background: 'transparent', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: 'var(--primary-color)', fontSize: 32 }} />
              </p>
              <p className="ant-upload-text" style={{ color: 'var(--text-secondary)' }}>Click or drag file to this area to upload</p>
              {uploadedDocumentIds.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Tag color="green">{uploadedDocumentIds.length} file(s) attached</Tag>
                </div>
              )}
            </Upload.Dragger>
          </div>
        </FormSection>
      )
    },
    {
      title: 'Success',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 11: Success Definition</h2>
            <p style={{ color: 'var(--text-secondary)' }}>What matters most to you?</p>
          </div>
          <Form.Item name="successPriority" label={<span style={{ color: 'white' }}>Priority</span>}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Radio value="peace_of_mind" style={{ color: 'white' }}>Peace of Mind</Radio>
              <Radio value="maximizing_returns" style={{ color: 'white' }}>Maximising Returns</Radio>
              <Radio value="predictable_income" style={{ color: 'white' }}>Predictable Income</Radio>
              <Radio value="early_freedom" style={{ color: 'white' }}>Early Financial Freedom</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="reviewFrequency" label={<span style={{ color: 'white' }}>Review Frequency</span>}>
            <Radio.Group>
              <Radio value="monthly" style={{ color: 'white' }}>Monthly</Radio>
              <Radio value="quarterly" style={{ color: 'white' }}>Quarterly</Radio>
              <Radio value="annually" style={{ color: 'white' }}>Annually</Radio>
            </Radio.Group>
          </Form.Item>
        </FormSection>
      )
    },
    {
      title: 'Preview',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Step 12: Review & Book</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Review your profile and book a session to generate your plan.</p>
          </div>

          <Alert
            message="Profile Complete"
            description="Your risk profile and financial snapshot are ready. Book a session to get your personalized plan."
            type="success"
            showIcon
            style={{ marginBottom: 24, background: 'rgba(82, 196, 26, 0.1)', border: '1px solid #52c41a' }}
          />

          <h3 style={{ color: 'white', marginBottom: 16 }}>Select a Consultant</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>Loading available experts...</p>
            </div>
          ) : error ? (
            <Alert message={error} type="error" showIcon />
          ) : availableSlots.length === 0 ? (
            <Empty description={<span style={{ color: 'white' }}>No experts available</span>} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {availableSlots.map(slot => (
                <TimeSlotCard
                  key={slot.id}
                  selected={selectedSlot?.id === slot.id}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="icon"><ClockCircleOutlined /></div>
                  <h4>{moment(slot.date).format('MMM DD')} • {slot.time}</h4>
                  <p>with {slot.analyst}</p>
                </TimeSlotCard>
              ))}
            </div>
          )}
        </FormSection>
      )
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();

      if (currentStep === steps.length - 1 && !selectedSlot) {
        message.warning('Please select a time slot');
        return;
      }

      // On final step - submit booking
      if (currentStep === steps.length - 1) {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          // Save form data to sessionStorage for after login
          const formData = form.getFieldsValue();
          sessionStorage.setItem('pendingBooking', JSON.stringify({
            formData,
            selectedSlot
          }));

          Modal.confirm({
            title: 'Sign In Required',
            content: 'Please sign in or create an account to confirm your booking. Your selection will be saved.',
            okText: 'Sign In',
            cancelText: 'Cancel',
            centered: true,
            okButtonProps: { style: { background: 'var(--primary-color)', border: 'none', borderRadius: 20 } },
            onOk: () => navigate('/login', { state: { from: '/financial-planning', returnAfterLogin: true } })
          });
          return;
        }

        // User is authenticated - submit the booking
        setSubmitting(true);
        try {
          const formData = form.getFieldsValue();

          const payload = {
            ...formData, // Spread all form values
            consultationSlot: {
              date: selectedSlot.date,
              time: selectedSlot.time,
              plannerId: selectedSlot.plannerId // Pass the selected analyst ID
            },
            preferredMeetingType: 'video',
            documentIds: uploadedDocumentIds
          };

          const response = await api.post('/financial-planning/submit', payload);

          if (response.data.success) {
            Modal.success({
              title: 'Booking Confirmed! 🎉',
              content: (
                <div>
                  <p>Your consultation with <strong>{selectedSlot.analyst}</strong> has been scheduled.</p>
                  <p style={{ marginTop: 12, color: '#666' }}>
                    📅 {selectedSlot.date} at {selectedSlot.time}
                  </p>
                  <p style={{ marginTop: 8, color: '#888', fontSize: '0.9em' }}>
                    You will receive a confirmation email shortly.
                  </p>
                </div>
              ),
              centered: true,
              okText: 'View My Bookings',
              okButtonProps: { style: { background: '#52c41a', border: 'none', borderRadius: 20 } },
              onOk: () => navigate('/dashboard')
            });

            // Clear form
            form.resetFields();
            setSelectedSlot(null);
            setCurrentStep(0);
          }
        } catch (err) {
          console.error('Booking submission error:', err);
          message.error(err.response?.data?.error || 'Failed to submit booking. Please try again.');
        } finally {
          setSubmitting(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

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
              {submitting ? 'Submitting...' : (currentStep === steps.length - 1 ? 'Confirm Booking' : 'Continue')}
            </NextButton>
          </div>
        </Form>
      </WizardCard>
    </PageContainer>
  );
};

export default FinancialPlanning;
