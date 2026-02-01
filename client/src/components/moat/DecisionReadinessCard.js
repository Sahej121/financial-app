import React from 'react';
import { Progress, Card, Tag, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
    RocketOutlined,
    SafetyOutlined,
    DollarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import './DecisionReadinessCard.css';

/**
 * Decision Readiness Score Card - Shows MOAT scores
 */
const DecisionReadinessCard = ({
    scores,
    purpose,
    onGeneratePack,
    loading = false
}) => {
    // Get primary score based on purpose
    const getPrimaryScore = () => {
        if (!scores) return null;
        switch (purpose) {
            case 'business_expansion':
                return { value: scores.expansionReadinessScore, label: 'Expansion Readiness', icon: <RocketOutlined /> };
            case 'loan_settlement':
                return { value: scores.loanSafetyScore, label: 'Loan Safety', icon: <SafetyOutlined /> };
            case 'investment':
            default:
                return { value: scores.investmentCapacityScore, label: 'Investment Capacity', icon: <DollarOutlined /> };
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#52c41a'; // Green
        if (score >= 60) return '#1890ff'; // Blue
        if (score >= 40) return '#faad14'; // Yellow
        return '#f5222d'; // Red
    };

    const getScoreStatus = (score) => {
        if (score >= 80) return { text: 'Excellent', color: 'success' };
        if (score >= 60) return { text: 'Good', color: 'processing' };
        if (score >= 40) return { text: 'Needs Attention', color: 'warning' };
        return { text: 'Action Required', color: 'error' };
    };

    const primaryScore = getPrimaryScore();
    const completenessScore = scores?.dataCompletenessScore || 0;

    return (
        <Card
            className="decision-readiness-card"
            loading={loading}
        >
            <div className="score-header">
                <h3>Decision Readiness</h3>
                <Tag color={purpose === 'business_expansion' ? 'purple' : purpose === 'loan_settlement' ? 'orange' : 'blue'}>
                    {purpose?.replace('_', ' ').toUpperCase() || 'INVESTMENT'}
                </Tag>
            </div>

            {primaryScore && (
                <div className="primary-score-section">
                    <Progress
                        type="dashboard"
                        percent={primaryScore.value || 0}
                        strokeColor={getScoreColor(primaryScore.value || 0)}
                        format={(percent) => (
                            <div className="score-format">
                                {primaryScore.icon}
                                <span className="score-value">{percent}</span>
                            </div>
                        )}
                        width={180}
                    />
                    <div className="score-label">{primaryScore.label}</div>
                    <Tag color={getScoreStatus(primaryScore.value || 0).color}>
                        {getScoreStatus(primaryScore.value || 0).text}
                    </Tag>
                </div>
            )}

            <div className="secondary-scores">
                <div className="score-item">
                    <Tooltip title="How complete is your financial profile">
                        <div className="score-item-header">
                            <FileTextOutlined />
                            <span>Data Completeness</span>
                        </div>
                    </Tooltip>
                    <Progress
                        percent={completenessScore}
                        size="small"
                        strokeColor={getScoreColor(completenessScore)}
                    />
                </div>
            </div>

            {completenessScore < 70 && (
                <div className="completeness-warning">
                    <WarningOutlined /> Complete your profile for better recommendations
                </div>
            )}

            {onGeneratePack && (
                <button
                    className="generate-pack-btn"
                    onClick={onGeneratePack}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Decision Pack'}
                </button>
            )}
        </Card>
    );
};

export default DecisionReadinessCard;
