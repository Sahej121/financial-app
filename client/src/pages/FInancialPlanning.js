import React, { useState, useEffect, useCallback } from 'react';
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
  Col
} from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

const StyledSelect = styled(Select)`
  height: 60px;
  width: 100%;
  
  .ant-select-selector {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 24px !important;
  }
  
  .ant-select-selection-item {
    color: white !important;
    font-size: 1.1rem;
  }
  
  .ant-select-selection-placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.1rem;
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
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const fetchAnalysts = useCallback(async () => {
    try {
      const response = await api.get('/financial-planners');
      const planners = response.data;

      // Generate slots for each planner
      const slots = planners.flatMap((p, idx) => [
        { id: `${p.id}-1`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '10:00 AM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-2`, date: moment().add(1, 'days').format('YYYY-MM-DD'), time: '2:00 PM', analyst: p.name, plannerId: p.id },
        { id: `${p.id}-3`, date: moment().add(2, 'days').format('YYYY-MM-DD'), time: '11:00 AM', analyst: p.name, plannerId: p.id }
      ]);

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching planners:', error);
      // Fallback with some mock if empty
      setAvailableSlots([
        { id: 1, date: moment().format('YYYY-MM-DD'), time: '10:00 AM', analyst: 'John Doe' },
        { id: 2, date: moment().format('YYYY-MM-DD'), time: '2:00 PM', analyst: 'Jane Smith' },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchAnalysts();
  }, [fetchAnalysts]);

  const steps = [
    {
      title: 'Profile',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Let's get to know you.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>We need some basic details to tailor our financial strategy.</p>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" rules={[{ required: true, message: 'Required' }]}>
                <StyledInput placeholder="Full Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" rules={[{ required: true, message: 'Required' }]}>
                <StyledInput placeholder="Phone Number" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <StyledInput placeholder="Email Address" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="planningType" rules={[{ required: true, message: 'Please select a goal' }]}>
                <StyledSelect placeholder="What is your primary financial goal?">
                  <Option value="business">Business Expansion</Option>
                  <Option value="wealth">Wealth Creation</Option>
                  <Option value="tax">Tax Optimization</Option>
                  <Option value="retirement">Retirement Planning</Option>
                </StyledSelect>
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      )
    },
    {
      title: 'Details',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Deep Dive.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Tell us more about your current situation and upload relevant docs.</p>
          </div>

          <Form.Item name="description">
            <TextArea
              rows={6}
              placeholder="Describe your business or financial situation..."
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: 'white', fontSize: '1.1rem', padding: 24 }}
            />
          </Form.Item>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'white', marginBottom: 16 }}>Required Documents</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <Button type="dashed" icon={<FilePdfOutlined />} ghost style={{ borderRadius: 12 }}>Bank Statements</Button>
              <Button type="dashed" icon={<FileExcelOutlined />} ghost style={{ borderRadius: 12 }}>Transaction History</Button>
            </div>

            <Upload.Dragger style={{ background: 'transparent', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 16 }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: 'var(--primary-color)', fontSize: 32 }} />
              </p>
              <p className="ant-upload-text" style={{ color: 'var(--text-secondary)' }}>Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </div>
        </FormSection>
      )
    },
    {
      title: 'Consultation',
      content: (
        <FormSection>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: 12 }}>Book Your Expert.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Select a time slot for your 1:1 strategy session.</p>
          </div>

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
        </FormSection>
      )
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();
      if (currentStep === 2 && !selectedSlot) {
        message.warning('Please select a time slot');
        return;
      }
      if (currentStep === steps.length - 1) {
        Modal.success({
          title: 'All Set!',
          content: 'Your consultation request has been received. We will contact you shortly.',
          centered: true,
          okButtonProps: { style: { background: '#52c41a', border: 'none', borderRadius: 20, padding: '0 30px' } }
        });
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

        <CustomSteps current={currentStep}>
          {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
        </CustomSteps>

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
            <NextButton onClick={next}>
              {currentStep === steps.length - 1 ? 'Confirm Booking' : 'Continue'}
            </NextButton>
          </div>
        </Form>
      </WizardCard>
    </PageContainer>
  );
};

export default FinancialPlanning;
