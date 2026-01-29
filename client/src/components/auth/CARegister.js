import React from 'react';
import { Form, Input, Button, Card, Alert, Select, InputNumber, Steps, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../redux/slices/userSlice';
import styled, { keyframes } from 'styled-components';
import { UserOutlined, MailOutlined, BankOutlined, PhoneOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  padding: 40px 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(0, 176, 240, 0.08) 0%, rgba(0,0,0,1) 70%);
    top: -50%;
    left: -50%;
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 800px;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;

  .ant-card-body {
    padding: 40px;
  }
`;

const StyledInput = styled(Input)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  height: 56px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder { color: rgba(255, 255, 255, 0.3); }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: #00B0F0 !important;
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2) !important;
  }
`;

const StyledInputPassword = styled(Input.Password)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
  height: 56px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  input { background: transparent !important; color: white !important; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: #00B0F0 !important;
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2) !important;
  }
`;

const StyledButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;

  &.ant-btn-primary {
    background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
    border: none;
    box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
    }
  }

  &.ant-btn-default {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const StyledSteps = styled(Steps)`
  margin-bottom: 48px;
  
  .ant-steps-item-process .ant-steps-item-icon { 
    background: #00B0F0 !important; 
    border-color: #00B0F0 !important; 
  }
  
  .ant-steps-item-finish .ant-steps-item-icon { 
    border-color: #00B0F0 !important; 
    color: #00B0F0 !important; 
  }
  
  .ant-steps-item-finish .ant-steps-item-tail::after { 
    background-color: #00B0F0 !important; 
  }
  
  .ant-steps-item-title { 
    color: rgba(255, 255, 255, 0.6) !important; 
    font-weight: 600 !important;
  }
  
  .ant-steps-item-active .ant-steps-item-title {
    color: white !important;
  }
`;

const CARegister = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = React.useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const specializations = [
    'Tax Planning', 'Business Advisory', 'Corporate Finance', 'Audit',
    'GST', 'International Taxation', 'Personal Finance', 'Investment Planning',
    'Corporate Restructuring', 'Mergers & Acquisitions', 'Startup Advisory',
    'Compliance', 'Real Estate', 'Property Tax', 'NRI Taxation',
    'FEMA Compliance', 'Risk Advisory', 'Internal Audit'
  ];

  const qualifications = ['FCA', 'ACA', 'ICWA', 'CMA', 'CPA', 'DISA', 'CFP', 'LLB', 'CS', 'CIA'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Marathi', 'Urdu'];

  const next = async () => {
    try {
      let fieldsToValidate = [];
      if (currentStep === 0) {
        fieldsToValidate = ['name', 'email', 'caNumber', 'phone', 'password', 'confirmPassword'];
      } else if (currentStep === 1) {
        fieldsToValidate = ['experience', 'consultationFee', 'description', 'qualifications', 'languages'];
      }

      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...userData } = values;

      // 1. Create User Account
      const result = await dispatch(register({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        caNumber: userData.caNumber,
        role: 'ca'
      })).unwrap();

      // 2. Create CA Profile (linked to User)
      const caProfileData = {
        userId: result.user.id, // Link to User record
        name: userData.name,
        email: userData.email,
        caNumber: userData.caNumber,
        phone: userData.phone,
        experience: userData.experience,
        consultationFee: userData.consultationFee,
        specializations: userData.specializations,
        description: userData.description,
        qualifications: userData.qualifications,
        languages: userData.languages,
        availability: userData.availability
      };

      const response = await api.post('/cas', caProfileData);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      message.success('Registration successful!');
      navigate('/ca-dashboard', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      // Display error to user
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      if (!errorMessage.includes('action')) {
        message.error(errorMessage);
      }
    }
  };

  const steps = [
    { title: 'Basic Info' },
    { title: 'Professional Details' },
    { title: 'Specializations' }
  ];

  const renderSteps = () => {
    return (
      <>
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Form.Item name="name" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Full Name</Text>} rules={[{ required: true }]}>
            <StyledInput prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
          </Form.Item>
          <Form.Item name="email" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Email</Text>} rules={[{ required: true, type: 'email' }]}>
            <StyledInput prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
          </Form.Item>
          <Form.Item name="caNumber" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>CA Registration Number</Text>} rules={[{ required: true, pattern: /^[0-9]{6}$/ }]}>
            <StyledInput prefix={<BankOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} placeholder="6-digit CA Number" />
          </Form.Item>
          <Form.Item name="phone" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Phone Number</Text>} rules={[{ required: true, pattern: /^[0-9]{10}$/ }]}>
            <StyledInput prefix={<PhoneOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} addonBefore={<span style={{ color: 'black' }}>+91</span>} />
          </Form.Item>
          <Form.Item name="password" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Password</Text>} rules={[{ required: true, min: 6 }]}>
            <StyledInputPassword prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
          </Form.Item>
          <Form.Item name="confirmPassword" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Confirm Password</Text>} dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match')); } })]}>
            <StyledInputPassword prefix={<SafetyOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
          </Form.Item>
        </div>

        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Form.Item name="experience" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Years of Experience</Text>} rules={[{ required: true }]}>
            <InputNumber min={0} max={50} style={{ width: '100%', borderRadius: '16px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </Form.Item>
          <Form.Item name="consultationFee" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Consultation Fee (₹)</Text>} rules={[{ required: true }]}>
            <InputNumber min={500} max={10000} style={{ width: '100%', borderRadius: '16px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Professional Description</Text>} rules={[{ required: true, max: 500 }]}>
            <TextArea rows={4} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px' }} />
          </Form.Item>
          <Form.Item name="qualifications" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Qualifications</Text>} rules={[{ required: true }]}>
            <Select mode="multiple" size="large" style={{ width: '100%' }} dropdownStyle={{ background: '#1c1c1c', border: '1px solid #333' }}>
              {qualifications.map(qual => <Option key={qual} value={qual}>{qual}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="languages" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Languages</Text>} rules={[{ required: true }]}>
            <Select mode="multiple" size="large" dropdownStyle={{ background: '#1c1c1c', border: '1px solid #333' }}>
              {languages.map(lang => <Option key={lang} value={lang}>{lang}</Option>)}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Form.Item name="specializations" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Specializations</Text>} rules={[{ required: true }]}>
            <Select mode="multiple" size="large" placeholder="Select your areas of specialization">
              {specializations.map(spec => <Option key={spec} value={spec}>{spec}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="availability" label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Current Availability</Text>} rules={[{ required: true }]}>
            <Select size="large">
              <Option value="Available Now">Available Now</Option>
              <Option value="Available in 30 mins">Available in 30 mins</Option>
              <Option value="Available in 1 hour">Available in 1 hour</Option>
              <Option value="Available in 2 hours">Available in 2 hours</Option>
              <Option value="Available tomorrow">Available tomorrow</Option>
            </Select>
          </Form.Item>
        </div>
      </>
    );
  };

  return (
    <RegisterContainer>
      <StyledCard bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={2} style={{ color: 'white', marginBottom: 8 }}>CA Registration</Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Join our network of elite financial experts</Text>
        </div>

        {error && <Alert message={error} type="error" style={{ marginBottom: 24, borderRadius: '12px' }} />}

        <StyledSteps current={currentStep}>
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </StyledSteps>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {renderSteps()}

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {currentStep > 0 && <StyledButton onClick={prev}>Previous</StyledButton>}
            {currentStep < steps.length - 1 &&
              <StyledButton type="primary" onClick={next}>Next Step</StyledButton>
            }
            {currentStep === steps.length - 1 &&
              <StyledButton type="primary" htmlType="submit" loading={loading}>Complete Registration</StyledButton>
            }
          </div>
        </Form>
      </StyledCard>
    </RegisterContainer>
  );
};

export default CARegister;