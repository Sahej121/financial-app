import React, { useState } from 'react';
import { Modal, Form, Upload, Button, message, Space, Typography, Alert, Input, Steps } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import AuthGuard from '../auth/AuthGuard';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const DocumentList = styled.div`
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
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, rgba(24, 144, 255, 0.1), transparent);
    border-radius: 50%;
    transform: translate(20px, -20px);
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

const ModalContainer = styled.div`
  .ant-modal-content {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .ant-modal-header {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    padding: 24px 32px;

    .ant-modal-title {
      color: white;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .ant-modal-body {
    padding: 32px;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  }

  .ant-modal-close {
    color: white;
    font-size: 20px;
    top: 24px;
    right: 32px;

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const StepContainer = styled.div`
  .ant-steps {
    .ant-steps-item {
      .ant-steps-item-icon {
        background: linear-gradient(135deg, #1890ff, #096dd9);
        border: none;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
      }
      
      .ant-steps-item-title {
        font-weight: 600;
        color: #333;
        font-size: 14px;
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

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  border: 1px solid rgba(24, 144, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const CAInfoCard = styled.div`
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(24, 144, 255, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(24, 144, 255, 0.05), transparent);
    border-radius: 50%;
  }
`;

const ConsultationModal = ({ visible, onCancel, selectedCA }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const handleConsultationSubmit = async () => {    try {
      const values = await form.validateFields();
      setUploading(true);

      // Simulating upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('Documents uploaded successfully!');
      
      // Simulating consultation start delay
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(`Starting consultation with ${selectedCA?.name}. We'll contact you at ${values.email}`);
      
      setFileList([]);
      form.resetFields();
      onCancel();
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Upload failed.');
      }
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
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
  };

  const steps = [
    {
      title: 'Personal Info',
      content: (
        <FormSection>
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Form.Item
                name="name"
                label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>👤 Your Name</span>}
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
                label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>📧 Email Address</span>}
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
                label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>📱 Phone Number</span>}
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
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
            </div>
          </Form>
        </FormSection>
      )
    },
    {
      title: 'Documents',
      content: (
        <FormSection>
          <DocumentList>
            <Title level={5} style={{ color: '#1890ff', marginBottom: '16px' }}>📋 Required Documents:</Title>
            <Space direction="vertical" size="middle">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                <Text style={{ fontSize: '16px', fontWeight: '500' }}>PAN Card or Aadhar Card</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileExcelOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text style={{ fontSize: '16px', fontWeight: '500' }}>Bank Statements / Income Statements</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileImageOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                <Text style={{ fontSize: '16px', fontWeight: '500' }}>Any Additional Supporting Documents</Text>
              </div>
            </Space>
          </DocumentList>

          <Form.Item
            label={<span style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>📁 Upload Documents</span>}
            required
            tooltip="Upload any relevant documents for the consultation"
          >
            <Upload 
              {...props}
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
                📤 Select Documents
              </Button>
            </Upload>
          </Form.Item>
        </FormSection>
      )
    },
    {
      title: 'Payment',
      content: (
        <FormSection>
          <CAInfoCard>
            <Title level={3} style={{ 
              color: '#1890ff', 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #1890ff, #096dd9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              💰 Consultation Fee: ₹{selectedCA?.consultationFee}
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>🎯 Expertise:</Text>
              <Text style={{ fontSize: '16px', color: '#666' }}>
                {selectedCA?.specializations?.join(', ') || 'N/A'}
              </Text>            </div>
            <div style={{ 
              background: 'rgba(24, 144, 255, 0.1)', 
              borderRadius: '8px', 
              padding: '12px',
              marginTop: '16px'
            }}>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                ⏰ Consultation will be scheduled within 24 hours of payment
              </Text>
            </div>
          </CAInfoCard>
          
          <AuthGuard>
            <PaymentButton
              type="primary"
              onClick={handleConsultationSubmit}
              disabled={fileList.length === 0}
              loading={uploading}
              block
              size="large"
            >
              {uploading ? '⏳ Processing...' : `💳 Pay ₹${selectedCA?.consultationFee} & Start Consultation`}
            </PaymentButton>
          </AuthGuard>
        </FormSection>
      )
    }
  ];

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'email', 'phone']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <ModalContainer>
      <Modal
        title={`🤝 Start Consultation with ${selectedCA?.name}`}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Alert
          message="🎯 Demo Mode"
          description="This is a demonstration. Document upload and consultation features are simulated."
          type="info"
          showIcon
          style={{ 
            marginBottom: 24,
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)'
          }}
        />

        <StepContainer>
          <Steps current={currentStep} style={{ marginBottom: '32px' }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </StepContainer>

        {steps[currentStep].content}

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
          </div>
        </div>

        <div style={{ 
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(24, 144, 255, 0.1)'
        }}>
          <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            <Text style={{ fontWeight: '600' }}>📝 Note:</Text> After payment, you will be connected with {selectedCA?.name} for the consultation.
            Please ensure you have a stable internet connection.
          </Paragraph>
        </div>
      </Modal>
    </ModalContainer>
  );
};

export default ConsultationModal; 