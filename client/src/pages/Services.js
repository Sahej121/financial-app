import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { BankOutlined, TeamOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Services = () => {
  const services = [
    {
      title: 'CA Services',
      icon: <TeamOutlined style={{ fontSize: '32px' }} />,
      description: 'Connect with experienced Chartered Accountants for tax planning and financial advice.'
    },
    {
      title: 'Credit Card Recommendations',
      icon: <CreditCardOutlined style={{ fontSize: '32px' }} />,
      description: 'Get personalized credit card recommendations based on your spending habits and preferences.'
    },
    {
      title: 'Financial Planning',
      icon: <BankOutlined style={{ fontSize: '32px' }} />,
      description: 'Comprehensive financial planning services to help you achieve your financial goals.'
    }
  ];

  return (
    <div style={{ padding: '40px 20px' }}>
      <Title level={2}>Our Services</Title>
      <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
        {services.map((service, index) => (
          <Col xs={24} md={8} key={index}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                {service.icon}
                <Title level={4} style={{ marginTop: '16px' }}>{service.title}</Title>
                <Paragraph>{service.description}</Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Services; 