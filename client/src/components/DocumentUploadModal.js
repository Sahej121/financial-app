import React, { useState } from 'react';
import { Modal, Upload, Button, message, Form, Select, Typography } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;
const { Text } = Typography;

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
        // fileList[0] is the raw File object from beforeUpload
        formData.append('file', fileList[0]);
        formData.append('category', values.category);
        formData.append('description', values.description || '');

        try {
            setLoading(true);
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
            // Validate file type
            const isValidType =
                file.type === 'application/pdf' ||
                file.type === 'image/jpeg' ||
                file.type === 'image/png';

            if (!isValidType) {
                message.error('You can only upload PDF, JPG, or PNG files!');
                return Upload.LIST_IGNORE;
            }

            // Validate file size (e.g., max 5MB)
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]); // Only allow single file for now
            return false; // Prevent auto-upload
        },
        fileList,
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span>Upload Document</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
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
                    <Select placeholder="Select document type">
                        <Option value="tax_documents">Tax returns / PAN / GST</Option>
                        <Option value="financial_statements">Investment Proofs / P&L</Option>
                        <Option value="bank_statements">Bank Statements</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="File"
                    extra={<Text type="secondary">PDF, JPG, or PNG (Max 5MB)</Text>}
                >
                    <Upload {...uploadProps} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={fileList.length === 0}
                    >
                        Upload
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default DocumentUploadModal;
