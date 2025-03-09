import React from 'react';
import { Layout, Typography } from 'antd';
import CAConsultation from '../components/ca-selection/CAConsultation';
import styled from 'styled-components';

const { Content } = Layout;
const { Title } = Typography;

const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #f0f2f5;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const HeaderSection = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const CASelectionPage = () => {
  return (
    <PageContainer>
      <HeaderSection>
        <Title level={1}>Find Your Expert CA</Title>
        <Typography.Paragraph>
          Connect with experienced Chartered Accountants for personalized consultation
        </Typography.Paragraph>
      </HeaderSection>
      
      <ContentWrapper>
        <CAConsultation />
      </ContentWrapper>
    </PageContainer>
  );
};

export default CASelectionPage; 