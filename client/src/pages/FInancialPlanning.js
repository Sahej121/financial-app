import React from 'react';
import { Typography, Layout, Row, Col, Card } from 'antd';
import { BankOutlined, SafetyOutlined, LineChartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import FinancialPlanningFlow from '../components/financial-planning/FinancialPlanningFlow';
import Logo from '../components/common/Logo';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PageContainer = styled(Content)`
  min-height: calc(100vh - 64px);
  background: #f0f2f5;
  padding-bottom: 48px;
`;

const HeaderSection = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  margin-bottom: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  color: white;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 36px;
  margin-bottom: 16px;
  color: #1890ff;
`;

const HeaderContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FinancialPlanning = () => {
  const features = [
    {
      icon: <BankOutlined />,
      title: 'Business Growth',
      description: 'Plan your business expansion with detailed financial projections and investment strategies'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Loan Protection',
      description: 'Manage your loans effectively with EMI calculations and risk assessment'
    },
    {
      icon: <LineChartOutlined />,
      title: 'Visual Analytics',
      description: 'Track your financial progress with interactive charts and detailed metrics'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Smart Recommendations',
      description: 'Get personalized financial advice based on your specific situation'
    }
  ];

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent>
          <Logo />
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            Financial Planning Assistant
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', margin: '0 auto' }}>
            Make informed financial decisions with our intelligent planning tools.
            Get personalized recommendations for business expansion or loan management.
          </Paragraph>
        </HeaderContent>
      </HeaderSection>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <FeatureCard>
                <IconWrapper>{feature.icon}</IconWrapper>
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </FeatureCard>
            </Col>
          ))}
        </Row>

        <FinancialPlanningFlow />
      </div>
    </PageContainer>
  );
};

export default FinancialPlanning;
