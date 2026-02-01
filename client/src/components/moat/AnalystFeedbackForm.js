import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Rate, message, Card, Tag, Radio } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    CommentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AnalystFeedbackForm.css';

const { TextArea } = Input;

/**
 * Analyst Feedback Form - For analysts to confirm/reject AI signals
 */
const AnalystFeedbackForm = ({
    submissionId,
    decisionPack,
    onSubmitSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [signalsConfirmed, setSignalsConfirmed] = useState([]);
    const [signalsRejected, setSignalsRejected] = useState([]);

    // Extract signals from decision pack
    const allSignals = [
        ...(decisionPack?.redFlags || []).map(f => ({
            id: `flag_${f.type}`,
            type: 'Red Flag',
            label: f.message,
            severity: f.severity
        })),
        ...(decisionPack?.warnings || []).map(f => ({
            id: `warn_${f.type}`,
            type: 'Warning',
            label: f.message,
            severity: f.severity
        })),
        ...(decisionPack?.riskConcentration || []).map(r => ({
            id: `risk_${r.area}`,
            type: 'Risk',
            label: `${r.area}: ${r.detail}`,
            severity: r.level
        }))
    ];

    const handleSignalToggle = (signalId, confirmed) => {
        if (confirmed) {
            setSignalsConfirmed(prev => [...prev, signalId]);
            setSignalsRejected(prev => prev.filter(id => id !== signalId));
        } else {
            setSignalsRejected(prev => [...prev, signalId]);
            setSignalsConfirmed(prev => prev.filter(id => id !== signalId));
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/decision-packs/${submissionId}/feedback`,
                {
                    signalsConfirmed,
                    signalsRejected,
                    notes: values.notes,
                    outcome: values.outcome
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            message.success('Feedback submitted successfully');
            form.resetFields();
            setSignalsConfirmed([]);
            setSignalsRejected([]);

            if (onSubmitSuccess) onSubmitSuccess();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            message.error('Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="analyst-feedback-form" title={
            <span><CommentOutlined /> Analyst Feedback</span>
        }>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Signal Confirmation */}
                {allSignals.length > 0 && (
                    <div className="signals-section">
                        <h4>Confirm or Reject AI Signals</h4>
                        <p className="signals-instruction">
                            Your feedback helps improve AI accuracy. Mark each signal as accurate or inaccurate.
                        </p>

                        <div className="signals-list">
                            {allSignals.map((signal) => (
                                <div key={signal.id} className="signal-item">
                                    <div className="signal-info">
                                        <Tag color={signal.severity === 'high' ? 'red' : 'orange'}>{signal.type}</Tag>
                                        <span className="signal-label">{signal.label}</span>
                                    </div>
                                    <div className="signal-actions">
                                        <Button
                                            type={signalsConfirmed.includes(signal.id) ? 'primary' : 'default'}
                                            icon={<CheckCircleOutlined />}
                                            size="small"
                                            onClick={() => handleSignalToggle(signal.id, true)}
                                            className="confirm-btn"
                                        >
                                            Accurate
                                        </Button>
                                        <Button
                                            type={signalsRejected.includes(signal.id) ? 'primary' : 'default'}
                                            danger={signalsRejected.includes(signal.id)}
                                            icon={<CloseCircleOutlined />}
                                            size="small"
                                            onClick={() => handleSignalToggle(signal.id, false)}
                                            className="reject-btn"
                                        >
                                            Inaccurate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Outcome */}
                <Form.Item
                    name="outcome"
                    label="Consultation Outcome"
                    rules={[{ required: true, message: 'Please select an outcome' }]}
                >
                    <Radio.Group className="outcome-radio">
                        <Radio.Button value="successful_recommendation">
                            <CheckCircleOutlined /> Successful Recommendation
                        </Radio.Button>
                        <Radio.Button value="needs_more_info">
                            <CommentOutlined /> Needs More Info
                        </Radio.Button>
                        <Radio.Button value="referral">
                            <SendOutlined /> Referred to Specialist
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* Notes */}
                <Form.Item name="notes" label="Additional Notes">
                    <TextArea
                        rows={4}
                        placeholder="Any observations, corrections, or context that could help improve future recommendations..."
                    />
                </Form.Item>

                {/* Submit */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SendOutlined />}
                        block
                    >
                        Submit Feedback
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AnalystFeedbackForm;
