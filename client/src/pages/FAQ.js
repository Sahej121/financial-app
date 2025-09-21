import React from 'react';
import { Layout } from 'antd';
import FAQSection from '../components/FAQ/FAQSection';
import TestimonialsSection from '../components/Testimonials/TestimonialsSection';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import styled from 'styled-components';

const { Content } = Layout;

const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #f0f2f5;
`;

const FAQ = () => {
  return (
    <PageContainer>
      <FAQSection />
      <TestimonialsSection />
      <FeedbackForm />
    </PageContainer>
  );
};

export default FAQ; 