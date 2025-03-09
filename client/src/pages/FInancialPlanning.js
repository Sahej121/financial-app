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

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const PageContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 24px;
`;

const RequiredDocs = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
`;

const AnalystSchedule = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const TimeSlot = styled(Button)`
  text-align: center;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const PaymentButton = styled(Button)`
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  border: none;
  &:hover {
    background: linear-gradient(90deg, #096dd9 0%, #1890ff 100%);
  }
`;

const FinancialPlanning = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);

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
        <>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your email address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
            ]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            name="planningType"
            label="Planning Type"
            rules={[{ required: true, message: 'Please select planning type' }]}
          >
            <Select placeholder="Select planning type">
              <Option value="business">Business Expansion</Option>
              <Option value="loan">Loan Protection</Option>
              <Option value="investment">Investment Planning</Option>
            </Select>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Document Upload',
      content: (
        <>
          <RequiredDocs>
            <Title level={5}>Required Documents:</Title>
            <ul>
              <li>
                <FilePdfOutlined /> Bank Statements (Last 1 Month)
              </li>
              <li>
                <FileExcelOutlined /> Transaction History
              </li>
              <li>
                <FilePdfOutlined /> Income Proof (If applicable)
              </li>
            </ul>
          </RequiredDocs>

          <Form.Item
            name="documents"
            label="Upload Documents"
            rules={[{ required: true, message: 'Please upload required documents' }]}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>Select Files</Button>
            </Upload>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Schedule Consultation',
      content: (
        <>
          <Paragraph>
            Select your preferred consultation slot with our financial analyst:
          </Paragraph>
          
          <AnalystSchedule>
            {availableSlots.map(slot => (
              <TimeSlot
                key={slot.id}
                selected={selectedSlot?.id === slot.id}
                onClick={() => setSelectedSlot(slot)}
              >
                <div>{moment(slot.date).format('MMM DD, YYYY')}</div>
                <div>{slot.time}</div>
                <div>Analyst: {slot.analyst}</div>
              </TimeSlot>
            ))}
          </AnalystSchedule>

          {selectedSlot && (
            <Alert
              style={{ marginTop: '16px' }}
              message="Selected Slot"
              description={`${moment(selectedSlot.date).format('MMMM DD, YYYY')} at ${selectedSlot.time} with ${selectedSlot.analyst}`}
              type="success"
              showIcon
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
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Financial Planning Consultation
          </Title>

        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {steps[currentStep].content}

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: '8px' }} onClick={prev}>
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <PaymentButton
                type="primary"
                onClick={initializePayment}
                loading={paymentProcessing}
                block
                size="large"
              >
                Pay ₹499 & Schedule Consultation
              </PaymentButton>
            )}
      </div>
        </Form>
      </StyledCard>
    </PageContainer>
  );
};

export default FinancialPlanning;
