
import React from 'react';
import { Gauge } from '@ant-design/plots';
import { Card, Typography, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const WidgetCard = styled(Card)`
  background: linear-gradient(145deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #00B0F0, #52c41a);
    opacity: 0.7;
  }
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }

  .label { color: rgba(255, 255, 255, 0.65); }
  .value { font-weight: 600; color: white; }
`;

const WealthHealthWidget = ({ score = 78, metrics }) => {
    const config = {
        percent: score / 100,
        range: {
            color: 'l(0) 0:#ff4d4f 0.5:#faad14 1:#52c41a',
        },
        startAngle: Math.PI,
        endAngle: 2 * Math.PI,
        indicator: null,
        statistic: {
            content: {
                style: {
                    fontSize: '36px',
                    lineHeight: '36px',
                    color: '#fff',
                    fontWeight: 'bold',
                },
                formatter: () => `${score}`,
            },
        },
        height: 160,
        padding: 0,
        axis: {
            label: {
                formatter: (v) => Number(v) * 100,
                style: { fill: 'rgba(255,255,255,0.45)' }
            },
            subTickLine: { count: 3 }
        }
    };

    const defaultMetrics = metrics || [
        { label: 'Savings Rate', value: '25%', status: 'success' },
        { label: 'Debt Ratio', value: '12%', status: 'success' },
        { label: 'Liquidity', value: '4 Mo', status: 'warning' },
    ];

    return (
        <WidgetCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={5} style={{ color: 'white', margin: 0 }}>
                    <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    Wealth Health
                </Title>
                <Tooltip title="A composite score of your financial wellbeing based on savings, debt, and investments.">
                    <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                </Tooltip>
            </div>

            <Row gutter={24} align="middle">
                <Col span={12}>
                    <div style={{ height: 160, position: 'relative', top: -20 }}>
                        {/* Note: In a real app, gauge might need tweaks for dark mode contrast */}
                        <Gauge {...config} />
                        <div style={{ textAlign: 'center', marginTop: -40 }}>
                            <Text style={{ color: '#52c41a', fontSize: '14px' }}>Excellent</Text>
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ paddingRight: 12 }}>
                        {defaultMetrics.map((item, idx) => (
                            <MetricItem key={idx}>
                                <span className="label">{item.label}</span>
                                <span className="value" style={{ color: item.status === 'warning' ? '#faad14' : item.status === 'error' ? '#ff4d4f' : '#52c41a' }}>
                                    {item.value}
                                </span>
                            </MetricItem>
                        ))}
                    </div>
                </Col>
            </Row>
        </WidgetCard>
    );
};

export default WealthHealthWidget;
