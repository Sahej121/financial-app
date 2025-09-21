import React from 'react';
import { Collapse, Typography, Card } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { faqItems } from '../../data/faqData';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2ff 100%);
  min-height: 50vh;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const StyledTitle = styled(Title)`
  &.ant-typography {
    background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem !important;
    font-weight: 700 !important;
    margin-bottom: 16px !important;
  }
`;

const StyledCollapse = styled(Collapse)`
  background: transparent;
  border: none;
  
  .ant-collapse-item {
    background: white;
    border: 1px solid rgba(24, 144, 255, 0.1);
    border-radius: 16px !important;
    margin-bottom: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
      transform: translateY(-2px);
    }
    
    &.ant-collapse-item-active {
      border-color: #1890ff;
      box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
    }
  }
  
  .ant-collapse-header {
    padding: 20px 24px !important;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: none !important;
    border-radius: 16px 16px 0 0 !important;
    
    .ant-collapse-header-text {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .ant-collapse-expand-icon {
      color: #1890ff !important;
      font-size: 16px;
      
      .anticon {
        transition: transform 0.3s ease;
      }
    }
  }
  
  .ant-collapse-content {
    border: none !important;
    background: white;
    
    .ant-collapse-content-box {
      padding: 0 24px 24px 24px;
      color: #6b7280;
      font-size: 15px;
      line-height: 1.7;
    }
  }
`;

const StatsCard = styled(Card)`
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  border-radius: 16px;
  margin-bottom: 40px;
  
  .ant-card-body {
    padding: 30px;
    text-align: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
  color: white;
`;

const StatItem = styled.div`
  text-align: center;
  
  .number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 8px;
    display: block;
  }
  
  .label {
    font-size: 14px;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const FAQSection = () => {
  const expandIcon = ({ isActive }) => (
    isActive ? <MinusOutlined /> : <PlusOutlined />
  );

  return (
    <FAQContainer>
      <HeaderSection>
        <StyledTitle level={1}>
          <QuestionCircleOutlined style={{ marginRight: '12px' }} />
          Frequently Asked Questions
        </StyledTitle>
        <Paragraph style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
          Got questions about our financial services? We've got answers. 
          Find everything you need to know about our platform and services.
        </Paragraph>
      </HeaderSection>

      <StatsCard>
        <StatsGrid>
          <StatItem>
            <span className="number">500+</span>
            <span className="label">Happy Clients</span>
          </StatItem>
          <StatItem>
            <span className="number">50+</span>
            <span className="label">Expert CAs</span>
          </StatItem>
          <StatItem>
            <span className="number">1000+</span>
            <span className="label">Consultations</span>
          </StatItem>
          <StatItem>
            <span className="number">98%</span>
            <span className="label">Satisfaction Rate</span>
          </StatItem>
        </StatsGrid>
      </StatsCard>

      <StyledCollapse
        accordion
        expandIcon={expandIcon}
        size="large"
      >
        {faqItems.map((item, index) => (
          <Panel 
            header={
              <span>
                <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                {item.question}
              </span>
            }
            key={index}
          >
            <p>{item.answer}</p>
          </Panel>
        ))}
      </StyledCollapse>
    </FAQContainer>
  );
};

export default FAQSection; 