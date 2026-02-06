
import React from 'react';
import { Gauge } from '@ant-design/plots';
import { Card, Typography, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WealthHealthWidget = ({ score = 50, metrics }) => {
    // Fix score label logic
    const getScoreLabel = (score) => {
        if (score >= 80) return { text: 'Excellent', color: '#10b981', className: 'excellent' };
        if (score >= 60) return { text: 'Good', color: '#3b82f6', className: 'good' };
        if (score >= 40) return { text: 'Fair', color: '#f59e0b', className: 'fair' };
        return { text: 'Needs Improvement', color: '#ef4444', className: 'poor' };
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
                    color: '#fff',
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
                style: { fill: '#64748b', fontSize: 11 }
            },
            subTickLine: { count: 3, style: { stroke: '#475569' } }
        }
    };

    const defaultMetrics = metrics || [
        { label: 'Savings Rate', value: '0%', status: 'error' },
        { label: 'Debt Ratio', value: '0%', status: 'success' },
        { label: 'Liquidity', value: '0 Mo', status: 'error' },
    ];

    return (
        <Card className="widget-card" bordered={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={5} style={{ color: 'white', margin: 0, fontSize: 18, fontWeight: 600 }}>
                    <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 8 }} />
                    Wealth Health
                </Title>
                <Tooltip title="A composite score of your financial wellbeing based on savings, debt, liquidity, and insurance coverage.">
                    <InfoCircleOutlined style={{ color: '#64748b', cursor: 'pointer' }} />
                </Tooltip>
            </div>

            <Row gutter={32} align="middle">
                <Col xs={24} md={12}>
                    <div className="wealth-gauge-container">
                        <Gauge {...config} />
                        <div className={`gauge-label ${scoreLabel.className}`} style={{ marginTop: 8 }}>
                            {scoreLabel.text}
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <div className="health-metrics">
                        {defaultMetrics.map((item, idx) => (
                            <div key={idx} className="metric-item">
                                <div className="metric-label">{item.label}</div>
                                <div className={`metric-value ${item.status}`}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default WealthHealthWidget;
