import React, { useState } from 'react';
import { Modal, Upload, Button, message, Form, Select, Typography } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../services/api';
import styled from 'styled-components';

const { Option } = Select;
const { Text } = Typography;

// --- Premium Styled Components ---
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

const StyledSelect = styled(Select)`
  .ant-select-selector {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    height: 56px !important;
    color: white !important;
    display: flex;
    align-items: center;

    &:hover, &:focus {
      border-color: #00B0F0 !important;
      background: rgba(255, 255, 255, 0.05) !important;
    }
  }
  .ant-select-arrow {
    color: white;
  }
`;

const StyledUploadButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: white;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #00B0F0;
    color: #00B0F0;
    background: rgba(0, 176, 240, 0.05);
  }
`;

const PrimaryButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
  border: none;
  box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);
  color: white;
  padding: 0 32px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
    color: white;
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  height: 56px;
  border-radius: 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0 32px;

  &:hover {
    border-color: white;
    color: white;
  }
`;

const DocumentUploadModal = ({ visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const onFinish = async (values) => {
        if (fileList.length === 0) {
            message.error('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);
        formData.append('category', values.category);
        formData.append('description', values.description || '');

        try {
            setLoading(true);
            await api.post('/documents/upload', formData);
            message.success('Document uploaded successfully');
            form.resetFields();
            setFileList([]);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Upload error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            const errorMsg = error.response?.data?.error || 'Failed to upload document';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isValidType =
                file.type === 'application/pdf' ||
                file.type === 'image/jpeg' ||
                file.type === 'image/png';

            if (!isValidType) {
                message.error('You can only upload PDF, JPG, or PNG files!');
                return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            return false;
        },
        fileList,
    };

    return (
        <StyledModal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined style={{ color: '#00B0F0' }} />
                    <span>Upload Document</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            maskStyle={{ backdropFilter: 'blur(8px)' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="category"
                    label="Document Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                >
                    <StyledSelect placeholder="Select document type">
                        <Option value="tax_documents">Tax returns / PAN / GST</Option>
                        <Option value="financial_statements">Investment Proofs / P&L</Option>
                        <Option value="bank_statements">Bank Statements</Option>
                        <Option value="other">Other</Option>
                    </StyledSelect>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="File"
                    extra={<div style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Supported: PDF, JPG, PNG (Max 5MB)</div>}
                >
                    <Upload {...uploadProps} maxCount={1}>
                        <StyledUploadButton icon={<UploadOutlined />}>
                            {fileList.length > 0 ? 'Change File' : 'Select Document'}
                        </StyledUploadButton>
                    </Upload>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        htmlType="submit"
                        loading={loading}
                        disabled={fileList.length === 0}
                    >
                        Upload Now
                    </PrimaryButton>
                </div>
            </Form>
        </StyledModal>
    );
};

export default DocumentUploadModal;
