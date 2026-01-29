import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { submitCardApplication } from '../../redux/slices/creditCardSlice';
import styled from 'styled-components';

const { Option } = Select;

// --- Styled Components for Premium Theme ---
const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: #111;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  }
  .ant-modal-header {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px 24px 0 0;
  }
  .ant-modal-title {
    color: white;
    font-size: 1.5rem;
  }
  .ant-modal-close-x {
    color: rgba(255, 255, 255, 0.5);
  }
  .ant-form-item-label > label {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const StyledInput = styled(Input)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  height: 56px;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover, &:focus {
    border-color: #00B0F0 !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
  &:focus {
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2) !important;
  }
`;

const StyledTextArea = styled(Input.TextArea)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 16px;
  
  &:hover, &:focus {
    border-color: #00B0F0 !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  height: 56px;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;

  .ant-picker-input > input {
    color: white !important;
  }
  .ant-picker-suffix {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:hover, &.ant-picker-focused {
    border-color: #00B0F0 !important;
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2) !important;
  }
`;

const SubmitButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
  border: none;
  box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);
  width: 100%;
  color: white;
  margin-top: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
    color: white;
  }
`;

const CreditCardApplicationModal = ({ visible, onCancel, card }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { applicationLoading } = useSelector((state) => state.creditCard);
  const { user } = useSelector((state) => state.user);

  // Initialize form with empty values if user is not available
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [visible, user, form]);

  const onFinish = async (values) => {
    try {
      await dispatch(submitCardApplication({
        cardId: card?.id,
        ...values
      })).unwrap();

      message.success('Application submitted successfully!');
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <StyledModal
      title={`Apply for ${card?.name || 'Credit Card'}`}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      maskStyle={{ backdropFilter: 'blur(8px)' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <StyledInput placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <StyledInput placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <StyledInput maxLength={10} placeholder="Enter your phone number" />
        </Form.Item>

        <Form.Item
          name="pan"
          label="PAN Number"
          rules={[
            { required: true, message: 'Please enter your PAN number' },
            { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number' }
          ]}
        >
          <StyledInput style={{ textTransform: 'uppercase' }} placeholder="Enter PAN number" />
        </Form.Item>

        <Form.Item
          name="dob"
          label="Date of Birth"
          rules={[{ required: true, message: 'Please select your date of birth' }]}
        >
          <StyledDatePicker placeholder="Select Date of Birth" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Current Address"
          rules={[{ required: true, message: 'Please enter your current address' }]}
        >
          <StyledTextArea rows={3} placeholder="Enter your full address" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter your city' }]}
          >
            <StyledInput placeholder="City" />
          </Form.Item>

          <Form.Item
            name="pincode"
            label="PIN Code"
            rules={[
              { required: true, message: 'Please enter your PIN code' },
              { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit PIN code' }
            ]}
          >
            <StyledInput maxLength={6} placeholder="PIN Code" />
          </Form.Item>
        </div>

        <Form.Item>
          <SubmitButton htmlType="submit" loading={applicationLoading}>
            Submit Application
          </SubmitButton>
        </Form.Item>
      </Form>
    </StyledModal>
  );
};

export default CreditCardApplicationModal;