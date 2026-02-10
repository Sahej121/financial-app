
import React from 'react';
import { Gauge } from '@ant-design/plots';
import { Card, Typography, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WealthHealthWidget = ({ score = 50, metrics }) => {
    // Fix score label logic
    const getScoreLabel = (score) => {
        if (score >= 80) return { text: 'Excellent', color: 'var(--success-color)', className: 'excellent' };
        if (score >= 60) return { text: 'Good', color: 'var(--primary-color)', className: 'good' };
        if (score >= 40) return { text: 'Fair', color: 'var(--warning-color)', className: 'fair' };
        return { text: 'Needs Improvement', color: 'var(--error-color)', className: 'poor' };
    };

    const scoreLabel = getScoreLabel(score);

    const config = {
        percent: score / 100,
        range: {
            color: 'l(0) 0:#ef4444 0.4:#f59e0b 0.6:#3b82f6 1:#10b981',
        },
        startAngle: Math.PI,
        endAngle: 2 * Math.PI,
        indicator: null,
        statistic: {
            content: {
                style: {
                    fontSize: '48px',
                    lineHeight: '48px',
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                },
                formatter: () => `${score}`,
            },
        },
        height: 180,
        padding: [0, 0, 0, 0],
        axis: {
            label: {
                formatter: (v) => Number(v) * 100,
                style: { fill: 'var(--text-secondary)', fontSize: 11 }
            },
            subTickLine: { count: 3, style: { stroke: 'var(--border-secondary)' } }
        }
    };

    const defaultMetrics = metrics || [
        { label: 'Savings Rate', value: '0%', status: 'error' },
        { label: 'Debt Ratio', value: '0%', status: 'success' },
        { label: 'Liquidity', value: '0 Mo', status: 'error' },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                <Title level={5} style={{ color: 'var(--text-primary)', margin: 0, fontSize: 16, fontWeight: 600 }}>
                    <SafetyCertificateOutlined style={{ color: 'var(--success-color)', marginRight: 8 }} />
                    Wealth Health
                </Title>
                <Tooltip title="A composite score of your financial wellbeing based on savings, debt, liquidity, and insurance coverage.">
                    <InfoCircleOutlined style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                </Tooltip>
            </div>

            <Row gutter={[16, 16]} align="middle" style={{ flex: 1 }}>
                <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="wealth-gauge-container" style={{ width: '100%', maxWidth: 180 }}>
                        <Gauge {...config} />
                        <div className={`gauge-label ${scoreLabel.className}`} style={{ marginTop: -20, textAlign: 'center', fontWeight: 'bold' }}>
                            {scoreLabel.text}
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="health-metrics" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {defaultMetrics.map((item, idx) => (
                            <div key={idx} className="metric-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-secondary)', paddingBottom: 4 }}>
                                <div className="metric-label" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.label}</div>
                                <div className={`metric-value ${item.status}`} style={{ fontWeight: 600 }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default WealthHealthWidget;
