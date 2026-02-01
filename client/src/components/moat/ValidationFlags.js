import React from 'react';
import { Alert, List, Tag, Collapse, Empty } from 'antd';
import {
    ExclamationCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import './ValidationFlags.css';

const { Panel } = Collapse;

/**
 * Validation Flags Component - Displays red flags and warnings from truth validation
 */
const ValidationFlags = ({ validation, showDetails = true }) => {
    if (!validation || !validation.flags || validation.flags.length === 0) {
        return (
            <div className="validation-flags validation-passed">
                <CheckCircleOutlined />
                <span>All validation checks passed</span>
            </div>
        );
    }

    const { flags } = validation;
    const highFlags = flags.filter(f => f.severity === 'high');
    const mediumFlags = flags.filter(f => f.severity === 'medium');
    const lowFlags = flags.filter(f => f.severity === 'low');

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'high': return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
            case 'medium': return <WarningOutlined style={{ color: '#faad14' }} />;
            default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        }
    };

    const getSeverityTag = (severity) => {
        const colors = { high: 'error', medium: 'warning', low: 'processing' };
        return <Tag color={colors[severity]}>{severity.toUpperCase()}</Tag>;
    };

    return (
        <div className="validation-flags">
            {/* Summary Banner */}
            {highFlags.length > 0 && (
                <Alert
                    message={`${highFlags.length} Critical Issue${highFlags.length > 1 ? 's' : ''} Found`}
                    description="These require attention before proceeding with recommendations."
                    type="error"
                    showIcon
                    className="validation-banner"
                />
            )}

            {highFlags.length === 0 && mediumFlags.length > 0 && (
                <Alert
                    message={`${mediumFlags.length} Warning${mediumFlags.length > 1 ? 's' : ''} Detected`}
                    description="Review these items during the consultation."
                    type="warning"
                    showIcon
                    className="validation-banner"
                />
            )}

            {showDetails && flags.length > 0 && (
                <Collapse className="flags-collapse" defaultActiveKey={highFlags.length > 0 ? ['high'] : []}>
                    {highFlags.length > 0 && (
                        <Panel
                            header={
                                <span className="panel-header">
                                    <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                                    Critical Issues ({highFlags.length})
                                </span>
                            }
                            key="high"
                        >
                            <List
                                dataSource={highFlags}
                                renderItem={(flag) => (
                                    <List.Item className="flag-item flag-high">
                                        <div className="flag-content">
                                            <div className="flag-type">{flag.type.replace(/_/g, ' ')}</div>
                                            <div className="flag-message">{flag.message}</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Panel>
                    )}

                    {mediumFlags.length > 0 && (
                        <Panel
                            header={
                                <span className="panel-header">
                                    <WarningOutlined style={{ color: '#faad14' }} />
                                    Warnings ({mediumFlags.length})
                                </span>
                            }
                            key="medium"
                        >
                            <List
                                dataSource={mediumFlags}
                                renderItem={(flag) => (
                                    <List.Item className="flag-item flag-medium">
                                        <div className="flag-content">
                                            <div className="flag-type">{flag.type.replace(/_/g, ' ')}</div>
                                            <div className="flag-message">{flag.message}</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Panel>
                    )}

                    {lowFlags.length > 0 && (
                        <Panel
                            header={
                                <span className="panel-header">
                                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                    Notes ({lowFlags.length})
                                </span>
                            }
                            key="low"
                        >
                            <List
                                dataSource={lowFlags}
                                renderItem={(flag) => (
                                    <List.Item className="flag-item flag-low">
                                        <div className="flag-content">
                                            <div className="flag-type">{flag.type.replace(/_/g, ' ')}</div>
                                            <div className="flag-message">{flag.message}</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Panel>
                    )}
                </Collapse>
            )}
        </div>
    );
};

export default ValidationFlags;
