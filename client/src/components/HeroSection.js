import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HeroSection = ({ onStartConsultation }) => {
  return (
    <div className="hero-section">
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={12}>
          <Title level={1}>
            Expert Financial Guidance at Your Fingertips
          </Title>
          <Paragraph>
            Connect with experienced Chartered Accountants and get personalized 
            financial advice. Upload your documents and start your consultation today.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            icon={<FileOutlined />}
            onClick={onStartConsultation}
          >
            Start Consultation
          </Button>
        </Col>
        <Col xs={24} md={12}>
          <img 
            src="/images/hero-image.jpg" 
            alt="Financial Consultation" 
            style={{ width: '100%', maxWidth: '500px' }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default HeroSection; 