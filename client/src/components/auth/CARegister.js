import React from 'react';
import { Form, Input, Button, Card, Alert, Select, InputNumber, Checkbox, Steps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../redux/slices/userSlice';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 16px;
`;

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

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
      await form.validateFields();
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
      // Remove confirmPassword from the data sent to server
      const { confirmPassword, ...userData } = values;
      
      // First register the user account
      const result = await dispatch(register({ 
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        caNumber: userData.caNumber,
        role: 'ca' 
      })).unwrap();
      
      // Then create the CA profile with all professional details
      const caProfileData = {
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

      // Save CA profile to the CA endpoint
      const response = await fetch('/api/cas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caProfileData)
      });

      if (!response.ok) {
        throw new Error('Failed to create CA profile');
      }

      // Navigate to CA dashboard after registration
      navigate('/ca-dashboard', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      // Error is handled by Redux for user registration
      // For CA profile creation, we might want to show a specific error
    }
  };

  const steps = [
    {
      title: 'Basic Information',
      content: 'basic-info'
    },
    {
      title: 'Professional Details',
      content: 'professional-details'
    },
    {
      title: 'Specializations',
      content: 'specializations'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
  return (
          <>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
              <Input size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
              <Input size="large" />
          </Form.Item>

          <Form.Item
            name="caNumber"
            label="CA Registration Number"
            rules={[
              { required: true, message: 'Please enter your CA registration number' },
              { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit CA number' }
            ]}
          >
              <Input placeholder="Enter your 6-digit CA registration number" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
              <Input addonBefore="+91" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
              <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
              <Input.Password size="large" />
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <Form.Item
              name="experience"
              label="Years of Experience"
              rules={[{ required: true, message: 'Please enter your experience' }]}
            >
              <InputNumber min={0} max={50} style={{ width: '100%' }} size="large" />
            </Form.Item>

            <Form.Item
              name="consultationFee"
              label="Consultation Fee (₹)"
              rules={[{ required: true, message: 'Please enter your consultation fee' }]}
            >
              <InputNumber min={500} max={10000} style={{ width: '100%' }} size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Professional Description"
              rules={[
                { required: true, message: 'Please enter your professional description' },
                { max: 500, message: 'Description should not exceed 500 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe your expertise and experience..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              name="qualifications"
              label="Qualifications"
              rules={[{ required: true, message: 'Please select your qualifications' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select your qualifications"
                size="large"
              >
                {qualifications.map(qual => (
                  <Option key={qual} value={qual}>{qual}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="languages"
              label="Languages"
              rules={[{ required: true, message: 'Please select languages you speak' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select languages you speak"
                size="large"
              >
                {languages.map(lang => (
                  <Option key={lang} value={lang}>{lang}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case 2:
        return (
          <>
            <Form.Item
              name="specializations"
              label="Specializations"
              rules={[{ required: true, message: 'Please select your specializations' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select your areas of specialization"
                size="large"
              >
                {specializations.map(spec => (
                  <Option key={spec} value={spec}>{spec}</Option>
                ))}
              </Select>
          </Form.Item>

            <Form.Item
              name="availability"
              label="Current Availability"
              rules={[{ required: true, message: 'Please select your availability' }]}
            >
              <Select placeholder="Select your current availability" size="large">
                <Option value="Available Now">Available Now</Option>
                <Option value="Available in 30 mins">Available in 30 mins</Option>
                <Option value="Available in 1 hour">Available in 1 hour</Option>
                <Option value="Available in 2 hours">Available in 2 hours</Option>
                <Option value="Available tomorrow">Available tomorrow</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <RegisterContainer>
      <Card title="CA Registration">
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
        
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {renderStepContent()}

          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={prev}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
                Complete Registration
            </Button>
            )}
          </div>
        </Form>
      </Card>
    </RegisterContainer>
  );
};

export default CARegister; 