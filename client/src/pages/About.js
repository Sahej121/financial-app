import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const About = () => {
  return (
    <div style={{ padding: '40px 20px' }}>
      <Title level={2}>About Us</Title>
      <Paragraph>
        We are a financial services platform dedicated to helping individuals make informed decisions
        about their financial needs. Our team of experts provides guidance on credit cards,
        chartered accountant services, and various financial solutions.
      </Paragraph>
      <Paragraph>
        Our mission is to simplify financial decisions by providing transparent, unbiased
        recommendations and connecting users with the right financial professionals.
      </Paragraph>
    </div>
  );
};

export default About; 