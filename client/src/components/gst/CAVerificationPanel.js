import React, { useState, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Divider, Input, message, Tag, Space, Typography, Alert } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import moment from 'moment';
import gstApi from '../../services/gstApi';
import styled from 'styled-components';

const { Text, Title } = Typography;
const { TextArea } = Input;

const SignatureWrapper = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const CAVerificationPanel = ({ filing, onComplete }) => {
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const sigPad = useRef(null);

    const handleApprove = async () => {
        if (sigPad.current.isEmpty()) {
            message.warning('Please provide your professional signature to authorize this filing');
            return;
        }

        try {
            setLoading(true);
            const signature = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            await gstApi.caApproveFiling(filing.id, true, comments, signature);
            message.success('Filing verified and signed successfully');
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Approval error:', error);
            message.error(error.response?.data?.error || 'Failed to verify filing');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!comments) {
            message.warning('Please provide comments explaining the required changes');
            return;
        }

        try {
            setLoading(true);
            await gstApi.caApproveFiling(filing.id, false, comments);
            message.info('Filing sent back for manual corrections');
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Rejection error:', error);
            message.error('Failed to process rejection');
        } finally {
            setLoading(false);
        }
    };

    const clearSignature = () => {
        sigPad.current.clear();
    };

    // Calculate tax summary from summary object or jsonData
    const summary = filing.summary || {};
    const taxLiability = filing.taxLiability || { cgst: 0, sgst: 0, igst: 0, total: 0 };
    const itcClaimed = filing.itcClaimed || { cgst: 0, sgst: 0, igst: 0, total: 0 };

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={24}>
                <Col span={16}>
                    <Title level={4} style={{ color: 'white', marginBottom: 24 }}>
                        Review Summary: {filing.returnType} - {filing.period}
                    </Title>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Statistic
                                    title={<Text type="secondary">Total Outward Supplies</Text>}
                                    value={filing.totalInvoiceValue}
                                    prefix="₹"
                                    valueStyle={{ color: '#00B0F0' }}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Statistic
                                    title={<Text type="secondary">Net Tax Payable</Text>}
                                    value={filing.netPayable}
                                    prefix="₹"
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Liability Breakdown</Divider>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>CGST</Text>} value={taxLiability.cgst} precision={2} valueStyle={{ fontSize: '16px', color: 'white' }} />
                        </Col>
                        <Col span={6}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>SGST</Text>} value={taxLiability.sgst} precision={2} valueStyle={{ fontSize: '16px', color: 'white' }} />
                        </Col>
                        <Col span={6}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>IGST</Text>} value={taxLiability.igst} precision={2} valueStyle={{ fontSize: '16px', color: 'white' }} />
                        </Col>
                        <Col span={6}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>Total Tax</Text>} value={taxLiability.total} precision={2} valueStyle={{ fontSize: '16px', color: 'white' }} />
                        </Col>
                    </Row>

                    {filing.returnType === 'GSTR3B' && (
                        <>
                            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }}>ITC Claimed</Divider>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>CGST</Text>} value={itcClaimed.cgst} precision={2} valueStyle={{ fontSize: '16px', color: '#52c41a' }} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>SGST</Text>} value={itcClaimed.sgst} precision={2} valueStyle={{ fontSize: '16px', color: '#52c41a' }} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>IGST</Text>} value={itcClaimed.igst} precision={2} valueStyle={{ fontSize: '16px', color: '#52c41a' }} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title={<Text type="secondary" style={{ fontSize: '11px' }}>Total ITC</Text>} value={itcClaimed.total} precision={2} valueStyle={{ fontSize: '16px', color: '#52c41a' }} />
                                </Col>
                            </Row>
                        </>
                    )}

                    <div style={{ marginTop: 32 }}>
                        <Title level={5} style={{ color: 'white' }}>Audit Comments</Title>
                        <TextArea
                            rows={4}
                            placeholder="Add your professional observations, missing data notices, or compliance notes here..."
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.02)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                    </div>
                </Col>

                <Col span={8} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                    <div style={{ background: 'rgba(0,176,240,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                        <Title level={5} style={{ color: '#00B0F0', marginTop: 0 }}>CA Authorization</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>
                            By signing below, you verify that the tax liability and ITC claims have been reviewed against the provided records and are compliant with GST regulations.
                        </Text>
                    </div>

                    <SignatureWrapper>
                        <SignatureCanvas
                            ref={sigPad}
                            penColor="black"
                            canvasProps={{ width: 280, height: 150, className: 'sigCanvas' }}
                        />
                    </SignatureWrapper>

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button block onClick={clearSignature} size="small">Clear Signature</Button>
                        <Button
                            type="primary"
                            block
                            icon={<SafetyCertificateOutlined />}
                            loading={loading}
                            onClick={handleApprove}
                            style={{ height: '45px', background: '#52c41a', border: 'none', marginTop: '12px' }}
                        >
                            Verify & E-Sign
                        </Button>
                        <Button
                            block
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={loading}
                            onClick={handleReject}
                            style={{ marginTop: '8px' }}
                        >
                            Request Corrections
                        </Button>
                    </Space>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Verified at: {moment().format('DD MMM YYYY, HH:mm')}
                        </Text>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CAVerificationPanel;
