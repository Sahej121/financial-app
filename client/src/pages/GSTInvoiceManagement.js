import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Card, Table, Button, Tag, Space, Input, Select, DatePicker,
    Modal, Form, InputNumber, message, Tooltip, Popconfirm, Empty,
    Row, Col, Typography, Upload, Tabs, Badge, Dropdown
} from 'antd';
import {
    PlusOutlined, SearchOutlined, FilterOutlined, UploadOutlined,
    DeleteOutlined, EditOutlined, CheckOutlined, EyeOutlined,
    FileTextOutlined, DownOutlined, ExportOutlined, SyncOutlined
} from '@ant-design/icons';
import gstApi from '../services/gstApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #00B0F0 0%, #00D4AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  
  .ant-card-body {
    padding: 0;
  }
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-thead > tr > th {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
  }
  
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  .ant-table-tbody > tr:hover > td {
    background: rgba(0, 176, 240, 0.05);
  }
`;

const InvoiceModal = styled(Modal)`
  .ant-modal-content {
    background: #141414;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .ant-modal-header {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const statusColors = {
    draft: 'default',
    extracted: 'processing',
    verified: 'warning',
    finalized: 'success',
    cancelled: 'error'
};

const categoryColors = {
    B2B: 'blue',
    B2CS: 'green',
    B2CL: 'purple',
    CDNR: 'orange',
    EXP: 'cyan'
};

const GSTInvoiceManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState({ type: null, status: null, period: null });
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };
            const response = await gstApi.getInvoices(params);
            setInvoices(response.invoices || []);
            setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }));
        } catch (error) {
            message.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, filters]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleCreateInvoice = async (values) => {
        try {
            setSubmitting(true);
            const invoiceData = {
                ...values,
                invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
                items: values.items || []
            };

            if (editingInvoice) {
                await gstApi.updateInvoice(editingInvoice.id, invoiceData);
                message.success('Invoice updated successfully');
            } else {
                await gstApi.createInvoice(invoiceData);
                message.success('Invoice created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingInvoice(null);
            loadInvoices();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to save invoice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteInvoice = async (id) => {
        try {
            await gstApi.deleteInvoice(id);
            message.success('Invoice deleted');
            loadInvoices();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to delete invoice');
        }
    };

    const handleVerifyInvoice = async (id) => {
        try {
            await gstApi.verifyInvoice(id);
            message.success('Invoice verified');
            loadInvoices();
        } catch (error) {
            message.error('Failed to verify invoice');
        }
    };

    const handleFinalizeInvoice = async (id) => {
        try {
            await gstApi.finalizeInvoice(id);
            message.success('Invoice finalized');
            loadInvoices();
        } catch (error) {
            message.error('Failed to finalize invoice');
        }
    };

    const openEditModal = (invoice) => {
        setEditingInvoice(invoice);
        form.setFieldsValue({
            ...invoice,
            invoiceDate: dayjs(invoice.invoiceDate)
        });
        setModalVisible(true);
    };

    const columns = [
        {
            title: 'Invoice #',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (text, record) => (
                <Space>
                    <FileTextOutlined style={{ color: '#00B0F0' }} />
                    <Text style={{ color: '#fff', fontWeight: 500 }}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Date',
            dataIndex: 'invoiceDate',
            key: 'invoiceDate',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
            sorter: true
        },
        {
            title: 'Party',
            dataIndex: 'counterpartyName',
            key: 'counterpartyName',
            ellipsis: true,
            render: (name, record) => (
                <div>
                    <Text style={{ color: '#fff' }}>{name}</Text>
                    {record.counterpartyGstin && (
                        <div>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                                {record.counterpartyGstin}
                            </Text>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'invoiceType',
            key: 'invoiceType',
            render: (type) => (
                <Tag color={type === 'sales' ? 'green' : 'blue'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Category',
            dataIndex: 'gstrCategory',
            key: 'gstrCategory',
            render: (cat) => (
                <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>
            )
        },
        {
            title: 'Taxable Value',
            dataIndex: 'totalTaxableValue',
            key: 'totalTaxableValue',
            align: 'right',
            render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`
        },
        {
            title: 'GST',
            key: 'gst',
            align: 'right',
            render: (_, record) => {
                const gst = (record.totalCgst || 0) + (record.totalSgst || 0) + (record.totalIgst || 0);
                return `₹${gst.toLocaleString('en-IN')}`;
            }
        },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right',
            render: (val) => (
                <Text strong style={{ color: '#00B0F0' }}>
                    ₹{(val || 0).toLocaleString('en-IN')}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status]}>{status?.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => navigate(`/gst/invoices/${record.id}`)}
                        />
                    </Tooltip>
                    {(record.status === 'draft' || record.status === 'extracted') && (
                        <>
                            <Tooltip title="Edit">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => openEditModal(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Verify">
                                <Button
                                    type="text"
                                    icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                                    size="small"
                                    onClick={() => handleVerifyInvoice(record.id)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Delete this invoice?"
                                onConfirm={() => handleDeleteInvoice(record.id)}
                            >
                                <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} size="small" />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 'verified' && (
                        <Tooltip title="Finalize">
                            <Button
                                type="text"
                                icon={<CheckOutlined style={{ color: '#1890ff' }} />}
                                size="small"
                                onClick={() => handleFinalizeInvoice(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1>Invoice Management</h1>
                </HeaderTitle>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={loadInvoices}>Refresh</Button>
                    <Button icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                        Upload Invoices
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                        Create Invoice
                    </Button>
                </Space>
            </PageHeader>

            {/* Filters */}
            <FilterBar>
                <Input
                    placeholder="Search invoices..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                    placeholder="Type"
                    style={{ width: 120 }}
                    allowClear
                    value={filters.type}
                    onChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                >
                    <Option value="sales">Sales</Option>
                    <Option value="purchase">Purchase</Option>
                </Select>
                <Select
                    placeholder="Status"
                    style={{ width: 140 }}
                    allowClear
                    value={filters.status}
                    onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                >
                    <Option value="draft">Draft</Option>
                    <Option value="extracted">Extracted</Option>
                    <Option value="verified">Verified</Option>
                    <Option value="finalized">Finalized</Option>
                </Select>
                <Input
                    placeholder="Period (MMYYYY)"
                    style={{ width: 140 }}
                    value={filters.period}
                    onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                />
            </FilterBar>

            {/* Table */}
            <StyledCard>
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    locale={{ emptyText: <Empty description="No invoices found" /> }}
                />
            </StyledCard>

            {/* Create/Edit Modal */}
            <InvoiceModal
                title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingInvoice(null);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateInvoice}
                    initialValues={{ invoiceType: 'sales' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="invoiceType"
                                label="Invoice Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="sales">Sales</Option>
                                    <Option value="purchase">Purchase</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="invoiceNumber"
                                label="Invoice Number"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="INV-001" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="invoiceDate"
                                label="Invoice Date"
                                rules={[{ required: true }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="placeOfSupply"
                                label="Place of Supply (State Code)"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="27" maxLength={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="counterpartyGstin"
                                label="Party GSTIN"
                            >
                                <Input placeholder="27AABCU9603R1ZM" maxLength={15} style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="counterpartyName"
                                label="Party Name"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Business Name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text strong style={{ color: '#fff' }}>Line Items</Text>
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                                        Add Item
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <Row gutter={8} key={field.key} style={{ marginBottom: 8 }}>
                                        <Col span={8}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'description']}
                                                noStyle
                                            >
                                                <Input placeholder="Description" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'hsnSac']}
                                                noStyle
                                            >
                                                <Input placeholder="HSN" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'quantity']}
                                                noStyle
                                            >
                                                <InputNumber placeholder="Qty" style={{ width: '100%' }} min={1} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'rate']}
                                                noStyle
                                            >
                                                <InputNumber placeholder="Rate" style={{ width: '100%' }} min={0} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'gstRate']}
                                                noStyle
                                                initialValue={18}
                                            >
                                                <Select placeholder="GST%">
                                                    <Option value={0}>0%</Option>
                                                    <Option value={5}>5%</Option>
                                                    <Option value={12}>12%</Option>
                                                    <Option value={18}>18%</Option>
                                                    <Option value={28}>28%</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Col>
                                    </Row>
                                ))}
                            </div>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                            {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                        </Button>
                    </Form.Item>
                </Form>
            </InvoiceModal>

            {/* Upload Modal */}
            <Modal
                title="Upload Invoice Documents"
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={null}
                width={500}
            >
                <Text style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 16 }}>
                    Upload invoice images or PDFs. Our AI will extract the invoice details automatically.
                </Text>
                <Dragger
                    name="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    beforeUpload={() => false}
                    style={{ marginBottom: 16 }}
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 48, color: '#00B0F0' }} />
                    </p>
                    <p className="ant-upload-text">Click or drag files to upload</p>
                    <p className="ant-upload-hint">Supports PDF, PNG, JPG formats</p>
                </Dragger>
                <Button type="primary" block>
                    Extract Invoices
                </Button>
            </Modal>
        </PageContainer>
    );
};

export default GSTInvoiceManagement;
