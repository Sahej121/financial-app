import React, { useState } from 'react';
import { Typography, Form, Input, Button, Layout, message, Row, Col } from 'antd';
import styled from 'styled-components';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import useScrollReveal from '../hooks/useScrollReveal';

const { Content } = Layout;
const { TextArea } = Input;

const PageContainer = styled(Content)`
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  position: relative;
  
  /* Subtle ambient background */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 80% 20%, rgba(0, 176, 240, 0.05) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const ContactGrid = styled.div`
  max-width: 1200px;
  width: 100%;
  background: rgba(20, 20, 20, 0.5);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  display: grid;
  grid-template-columns: 1fr 1.2fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSide = styled.div`
  padding: 60px;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 900px) {
    padding: 40px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const FormSide = styled.div`
  padding: 60px;
  
  @media (max-width: 900px) {
    padding: 40px;
  }
`;

const ContactInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  
  .icon-box {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--primary-color);
  }

  .text {
    h4 {
      color: white;
      margin: 0 0 4px;
      font-size: 1.1rem;
    }
    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }
`;

const StyledInput = styled(Input)`
  height: 56px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover, &:focus {
    border-color: var(--primary-color);
    background: rgba(0, 0, 0, 0.5);
  }
`;

const StyledTextArea = styled(TextArea)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover, &:focus {
    border-color: var(--primary-color);
    background: rgba(0, 0, 0, 0.5);
  }
`;

const SubmitButton = styled(Button)`
  height: 56px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  background: var(--primary-color);
  border: none;
  color: black;
  width: 100%;
  margin-top: 16px;
  box-shadow: 0 8px 20px rgba(0, 176, 240, 0.2);

  &:hover {
    transform: translateY(-2px);
    background: white;
    color: black;
    box-shadow: 0 12px 30px rgba(0, 176, 240, 0.3);
  }
`;

const Contact = () => {
  const [form] = Form.useForm();
  const [ref, isVisible] = useScrollReveal();

  const onFinish = (values) => {
    // Simulate API call
    setTimeout(() => {
      message.success('Message sent! We will contact you shortly.');
      form.resetFields();
    }, 1000);
  };

  return (
    <PageContainer>
      <div ref={ref} style={{ width: '100%', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease-out' }}>
        <ContactGrid>
          <InfoSide>
            <div>
              <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Get in Touch</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1.1rem' }}>
                Have questions about our premium services? Our team is ready to assist you.
              </p>

              <ContactInfoItem>
                <div className="icon-box"><MailOutlined /></div>
                <div className="text">
                  <h4>Email Us</h4>
                  <p>support@creditleliya.com</p>
                </div>
              </ContactInfoItem>

              <ContactInfoItem>
                <div className="icon-box"><PhoneOutlined /></div>
                <div className="text">
                  <h4>Call Us</h4>
                  <p>+91 98765 43210</p>
                </div>
              </ContactInfoItem>

              <ContactInfoItem>
                <div className="icon-box"><EnvironmentOutlined /></div>
                <div className="text">
                  <h4>Visit Us</h4>
                  <p>Cyber City, Gurugram, India</p>
                </div>
              </ContactInfoItem>
            </div>

            <div style={{ marginTop: 40 }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                © 2024 CreditLeliya Financial Services. <br /> All rights reserved.
              </p>
            </div>
          </InfoSide>

          <FormSide>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Your Name</span>}
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <StyledInput placeholder="John Doe" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="email"
                    label={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Email Address</span>}
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <StyledInput placeholder="john@example.com" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="subject"
                    label={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Subject</span>}
                  >
                    <StyledInput placeholder="How can we help?" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="message"
                    label={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Message</span>}
                    rules={[{ required: true, message: 'Please enter your message' }]}
                  >
                    <StyledTextArea rows={5} placeholder="Tell us about your requirements..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <SubmitButton htmlType="submit" icon={<SendOutlined />}>
                      Send Message
                    </SubmitButton>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </FormSide>
        </ContactGrid>
      </div>
    </PageContainer>
  );
};

export default Contact; 