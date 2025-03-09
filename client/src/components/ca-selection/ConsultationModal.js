import React, { useState } from 'react';
import { Modal, Form, Upload, Button, message, Space, Typography, Alert, Input } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const DocumentList = styled.div`
  margin: 16px 0;
`;

const ConsultationModal = ({ visible, onCancel, selectedCA }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const handleUpload = async () => {
    try {
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

  return (
    <Modal
      title={`Start Consultation with ${selectedCA?.name}`}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="Demo Mode"
        description="This is a demonstration. Document upload and consultation features are simulated."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div>
        <Title level={5} style={{ color: '#1890ff' }}>Consultation Fee: ₹{selectedCA?.consultationFee}</Title>
        <Paragraph>
          <Text strong>Expertise: </Text> 
          {selectedCA?.specializations.join(', ')}
        </Paragraph>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Your Name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
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
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <Input placeholder="Enter your phone number" />
        </Form.Item>

        <DocumentList>
          <Title level={5}>Required Documents:</Title>
          <Space direction="vertical">
            <Text><FilePdfOutlined /> PAN Card or Aadhar Card</Text>
            <Text><FileExcelOutlined /> Bank Statements / Income Statements</Text>
            <Text><FileImageOutlined /> Any Additional Supporting Documents</Text>
          </Space>
        </DocumentList>

        <Form.Item
          label="Upload Documents"
          required
          tooltip="Upload any relevant documents for the consultation"
        >
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Select Documents</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            block
            size="large"
          >
            {uploading ? 'Processing...' : 'Start Consultation Now'}
          </Button>
        </Form.Item>
      </Form>

      <Paragraph type="secondary" style={{ marginTop: '16px' }}>
        Note: After uploading documents, you will be connected with {selectedCA?.name} for the consultation.
        Please ensure you have a stable internet connection.
      </Paragraph>
    </Modal>
  );
};

export default ConsultationModal; 