import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Upload, 
  Select, 
  DatePicker, 
  Card, 
  message, 
  Steps, 
  Typography,
  Alert,
  Modal
} from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import { loadScript } from '../utils/loadScript';
import ZoomMeeting from '../components/consultation/ZoomMeeting';
import AuthGuard from '../components/auth/AuthGuard';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const PageContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 40px;
  }
`;

const RequiredDocs = styled.div`
  margin: 20px 0;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 16px;
  border-left: 4px solid #1890ff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, rgba(24, 144, 255, 0.1), transparent);
    border-radius: 50%;
    transform: translate(30px, -30px);
  }

  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin: 12px 0;
      font-weight: 500;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        color: #1890ff;
        transform: translateX(5px);
      }
    }
  }
`;

const AnalystSchedule = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const TimeSlot = styled(Button)`
  text-align: center;
  padding: 20px 16px;
  border: 2px solid ${props => props.selected ? '#1890ff' : '#e8f2ff'};
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 16px;
  height: auto;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(24, 144, 255, 0.3);
    border-color: #1890ff;
    background: ${props => props.selected 
      ? 'linear-gradient(135deg, #096dd9 0%, #1890ff 100%)' 
      : 'linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)'};
  }

  div {
    font-weight: 500;
    
    &:first-child {
      font-size: 16px;
      font-weight: 600;
    }
    
    &:last-child {
      font-size: 12px;
      opacity: 0.8;
    }
  }
`;

const PaymentButton = styled(Button)`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  border-radius: 12px;
  height: 60px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(24, 144, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const FormSection = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 32px;
  margin: 24px 0;
  border: 1px solid rgba(24, 144, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1890ff, #096dd9, #1890ff);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  
  .ant-steps {
    .ant-steps-item {
      .ant-steps-item-icon {
        background: linear-gradient(135deg, #1890ff, #096dd9);
        border: none;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
      }
      
      .ant-steps-item-title {
        font-weight: 600;
        color: #333;
      }
      
      &.ant-steps-item-active {
        .ant-steps-item-icon {
          background: linear-gradient(135deg, #52c41a, #389e0d);
          animation: pulse 2s infinite;
        }
      }
      
      &.ant-steps-item-finish {
        .ant-steps-item-icon {
          background: linear-gradient(135deg, #52c41a, #389e0d);
        }
      }
    }
  }

  @keyframes pulse {
    0% { box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3); }
    50% { box-shadow: 0 4px 25px rgba(82, 196, 26, 0.5); }
    100% { box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3); }
  }
`;

const FinancialPlanning = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [consultationData, setConsultationData] = useState(null);

  // Mock analyst schedule - Replace with API call
  const availableSlots = [
    { id: 1, date: '2024-03-15', time: '10:00 AM', analyst: 'John Doe' },
    { id: 2, date: '2024-03-15', time: '2:00 PM', analyst: 'Jane Smith' },
    { id: 3, date: '2024-03-16', time: '11:00 AM', analyst: 'John Doe' },
    { id: 4, date: '2024-03-16', time: '3:00 PM', analyst: 'Jane Smith' },
  ];

  const steps = [
    {
      title: 'Basic Information',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>Full Name</span>}
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input 
              placeholder="Enter your full name" 
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid #e8f2ff',
                padding: '12px 16px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>Email Address</span>}
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              placeholder="Enter your email address" 
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid #e8f2ff',
                padding: '12px 16px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>Phone Number</span>}
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
            ]}
          >
            <Input 
              placeholder="Enter your phone number" 
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid #e8f2ff',
                padding: '12px 16px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="planningType"
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>Planning Type</span>}
            rules={[{ required: true, message: 'Please select planning type' }]}
          >
            <Select 
              placeholder="Select planning type"
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid #e8f2ff',
                fontSize: '16px'
              }}
            >
              <Option value="business">🏢 Business Expansion</Option>
              <Option value="loan">🛡️ Loan Protection</Option>
              <Option value="investment">📈 Investment Planning</Option>
            </Select>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Document Upload',
      content: (
        <>
          <RequiredDocs>
            <Title level={5} style={{ color: '#1890ff', marginBottom: '20px' }}>📋 Required Documents:</Title>
            <ul>
              <li>
                <FilePdfOutlined style={{ color: '#ff4d4f' }} /> Bank Statements (Last 1 Month)
              </li>
              <li>
                <FileExcelOutlined style={{ color: '#52c41a' }} /> Transaction History
              </li>
              <li>
                <FilePdfOutlined style={{ color: '#ff4d4f' }} /> Income Proof (If applicable)
              </li>
            </ul>
          </RequiredDocs>

          <Form.Item
            name="documents"
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>📁 Upload Documents</span>}
            rules={[{ required: true, message: 'Please upload required documents' }]}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                transition: 'all 0.3s ease'
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                size="large"
                style={{
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 24px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  border: 'none',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                }}
              >
                📤 Select Files to Upload
              </Button>
            </Upload>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Schedule Consultation',
      content: (
        <>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={4} style={{ color: '#333', marginBottom: '8px' }}>
              📅 Select Your Preferred Time Slot
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Choose a convenient time to meet with our financial analyst
            </Paragraph>
          </div>
          
          <AnalystSchedule>
            {availableSlots.map(slot => (
              <TimeSlot
                key={slot.id}
                selected={selectedSlot?.id === slot.id}
                onClick={() => setSelectedSlot(slot)}
              >
                <div>📅 {moment(slot.date).format('MMM DD, YYYY')}</div>
                <div>🕐 {slot.time}</div>
                <div>👨‍💼 {slot.analyst}</div>
              </TimeSlot>
            ))}
          </AnalystSchedule>

          {selectedSlot && (
            <Alert
              style={{ 
                marginTop: '24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                borderLeft: '4px solid #52c41a'
              }}
              message={
                <span style={{ fontWeight: '600', color: '#52c41a' }}>
                  ✅ Time Slot Selected
                </span>
              }
              description={
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>
                    📅 {moment(selectedSlot.date).format('MMMM DD, YYYY')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    🕐 {selectedSlot.time} with {selectedSlot.analyst}
                  </div>
                </div>
              }
              type="success"
              showIcon={false}
            />
          )}
        </>
      )
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values) => {
    if (!selectedSlot) {
      message.error('Please select a consultation slot');
      return;
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append('documents', file.originFileObj);
      });

      // Add other form values
      Object.keys(values).forEach(key => {
        if (key !== 'documents') {
          formData.append(key, values[key]);
        }
      });

      // Add selected slot
      formData.append('consultationSlot', JSON.stringify(selectedSlot));

      // TODO: Replace with your API endpoint
      // await axios.post('/api/financial-planning', formData);

      message.success('Your consultation has been scheduled successfully!');
      
      // Show confirmation
      Modal.success({
        title: 'Consultation Scheduled',
        content: (
          <div>
            <p>Your consultation has been scheduled for:</p>
            <p><strong>{moment(selectedSlot.date).format('MMMM DD, YYYY')}</strong></p>
            <p><strong>Time: {selectedSlot.time}</strong></p>
            <p><strong>Analyst: {selectedSlot.analyst}</strong></p>
            <p>You will receive a confirmation email with further details.</p>
          </div>
        ),
        onOk: () => {
          form.resetFields();
          setFileList([]);
          setSelectedSlot(null);
          setCurrentStep(0);
        }
      });
    } catch (error) {
      message.error('Failed to schedule consultation. Please try again.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handleConsultationBooking = async (paymentId) => {
    try {
      const formData = form.getFieldsValue();
      const consultationData = {
        ...formData,
        paymentId,
        // Add other necessary consultation data
      };

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      message.success('Consultation booked successfully!');
      // Handle successful booking (e.g., redirect to confirmation page)
    } catch (error) {
      console.error('Error booking consultation:', error);
      message.error('Failed to book consultation. Please contact support.');
    }
  };

  const handlePaymentSuccess = async (response, consultationData) => {
    try {
      // Verify payment
      const verificationResult = await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        consultationData // Add consultation data for receipt generation
      });

      // Book consultation
      await handleConsultationBooking(response.razorpay_payment_id);

      // Show success modal with receipt download
      Modal.success({
        title: 'Payment Successful',
        content: (
          <div>
            <p>Your consultation has been booked successfully!</p>
            <p>Receipt Number: {verificationResult.receipt.number}</p>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => window.open(`/api/payments/receipt/${verificationResult.receipt.url}`, '_blank')}
              style={{ marginTop: '16px' }}
            >
              Download Receipt
            </Button>
          </div>
        ),
        onOk: () => {
          form.resetFields();
          setCurrentStep(0);
        }
      });
    } catch (error) {
      message.error('Payment verification failed. Please contact support.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const initializePayment = async () => {
    try {
      setPaymentProcessing(true);

      // Validate form first
      await form.validateFields();

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const order = await createOrder();

      // Get form data for prefill
      const formData = form.getFieldsValue();

      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Credit Leliya",
        description: "Financial Consultation Booking",
        order_id: order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#1890ff"
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
          }
        },
        handler: async function(response) {
          const formData = form.getFieldsValue();
          await handlePaymentSuccess(response, formData);
        }
      };

      // Initialize Razorpay
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      message.error(error.message || 'Failed to initialize payment');
      setPaymentProcessing(false);
    }
  };

  if (showMeeting) {
    return (
      <ZoomMeeting
        consultationId={consultationData?.id}
        onMeetingEnd={() => setShowMeeting(false)}
      />
    );
  }

  return (
    <PageContainer>
      <StyledCard>
        <Title level={2} style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #1890ff, #096dd9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          Financial Planning Consultation
        </Title>

        <StepIndicator>
          <Steps current={currentStep}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </StepIndicator>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <FormSection>
            {steps[currentStep].content}
          </FormSection>

          <div style={{ 
            marginTop: '32px', 
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              {currentStep > 0 && (
                <Button 
                  size="large"
                  onClick={prev}
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    padding: '0 24px',
                    fontWeight: '600',
                    border: '2px solid #d9d9d9',
                    background: 'white'
                  }}
                >
                  ← Previous
                </Button>
              )}
            </div>
            
            <div>
              {currentStep < steps.length - 1 && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={next}
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    padding: '0 32px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  Next →
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <AuthGuard>
                  <PaymentButton
                    type="primary"
                    onClick={initializePayment}
                    loading={paymentProcessing}
                    block
                    size="large"
                  >
                    💳 Pay ₹499 & Schedule Consultation
                  </PaymentButton>
                </AuthGuard>
              )}
            </div>
          </div>
        </Form>
      </StyledCard>
    </PageContainer>
  );
};

export default FinancialPlanning;
