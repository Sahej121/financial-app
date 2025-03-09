import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { submitCardApplication } from '../../redux/slices/creditCardSlice';

const { Option } = Select;

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
    <Modal
      title={`Apply for ${card?.name || 'Credit Card'}`}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
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
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="pan"
          label="PAN Number"
          rules={[
            { required: true, message: 'Please enter your PAN number' },
            { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number' }
          ]}
        >
          <Input style={{ textTransform: 'uppercase' }} />
        </Form.Item>

        <Form.Item
          name="dob"
          label="Date of Birth"
          rules={[{ required: true, message: 'Please select your date of birth' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="address"
          label="Current Address"
          rules={[{ required: true, message: 'Please enter your current address' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: 'Please enter your city' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="pincode"
          label="PIN Code"
          rules={[
            { required: true, message: 'Please enter your PIN code' },
            { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit PIN code' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={applicationLoading} block>
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreditCardApplicationModal; 