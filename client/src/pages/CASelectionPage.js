import React from 'react';
import { Layout, Typography } from 'antd';
import CAConsultation from '../components/ca-selection/CAConsultation';
import styled from 'styled-components';

const { Content } = Layout;
const { Title } = Typography;

const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
  padding-bottom: 80px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 176, 240, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(242, 200, 17, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  padding: 100px 20px 60px;
  
  h1 {
    color: white !important;
    font-size: clamp(2.5rem, 5vw, 4rem) !important;
    font-weight: 800 !important;
    margin-bottom: 24px !important;
    background: linear-gradient(180deg, #FFFFFF 0%, #A0A0A0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  }
  
  div {
    color: var(--text-secondary) !important;
    font-size: 1.25rem !important;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const CASelectionPage = () => {
  return (
    <PageContainer>
      <HeaderSection>
        <Title level={1}>Find Your Financial Partner</Title>
        <Typography.Paragraph>
          Connect with elite Chartered Accountants for personalized wealth strategy
        </Typography.Paragraph>
      </HeaderSection>

      <ContentWrapper>
        <CAConsultation />
      </ContentWrapper>
    </PageContainer>
  );
};

export default CASelectionPage; 