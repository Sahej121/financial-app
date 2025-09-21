import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, Row, Col, message, Rate } from 'antd';
import { SendOutlined, MessageOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FeedbackContainer = styled.div`
  padding: 80px 20px;
  background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%);
  min-height: 60vh;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
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
    font-size: 2.2rem !important;
    font-weight: 700 !important;
    margin-bottom: 16px !important;
  }
`;

const FeedbackCard = styled(Card)`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(24, 144, 255, 0.1);
  overflow: hidden;
  
  .ant-card-body {
    padding: 40px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 600;
    color: #2d3748;
    font-size: 15px;
  }
  
  .ant-input, .ant-select-selector, .ant-input-affix-wrapper {
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    transition: all 0.3s ease;
    
    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
  
  .ant-select-selector {
    padding: 8px 16px !important;
    height: auto !important;
  }
  
  .ant-input-affix-wrapper {
    padding: 0;
    
    .ant-input {
      border: none;
      padding: 12px 16px;
    }
  }
`;

const SubmitButton = styled(Button)`
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(24, 144, 255, 0.4);
    background: linear-gradient(135deg, #40a9ff 0%, #9254de 100%);
  }
  
  &:focus {
    background: linear-gradient(135deg, #40a9ff 0%, #9254de 100%);
  }
`;

const ContactInfo = styled.div`
  background: linear-gradient(135deg, #f8fbff 0%, #e6f7ff 100%);
  padding: 30px;
  border-radius: 16px;
  margin-top: 40px;
  border: 1px solid rgba(24, 144, 255, 0.1);
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #4a5568;
  
  .anticon {
    color: #1890ff;
    margin-right: 12px;
    font-size: 18px;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FeedbackForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/feedback', {
        ...values,
        timestamp: new Date().toISOString(),
        source: 'FAQ Page'
      });

      if (response.data.success) {
        message.success('Thank you for your feedback! We\'ll get back to you soon.');
        form.resetFields();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      message.error('Sorry, there was an error submitting your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeedbackContainer>
      <ContentWrapper>
        <HeaderSection>
          <StyledTitle level={1}>
            <MessageOutlined style={{ marginRight: '12px' }} />
            Send Us Your Feedback
          </StyledTitle>
          <Paragraph style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            We value your opinion! Help us improve our services by sharing your thoughts, 
            suggestions, or reporting any issues you've encountered.
          </Paragraph>
        </HeaderSection>

        <FeedbackCard>
          <StyledForm
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Your Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input 
                    prefix={<UserOutlined />}
                    placeholder="Enter your full name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />}
                    placeholder="Enter your email address"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number (Optional)"
                >
                  <Input 
                    prefix={<PhoneOutlined />}
                    placeholder="Enter your phone number"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="feedbackType"
                  label="Feedback Type"
                  rules={[{ required: true, message: 'Please select feedback type' }]}
                >
                  <Select placeholder="Select feedback type" size="large">
                    <Option value="suggestion">💡 Suggestion</Option>
                    <Option value="complaint">⚠️ Complaint</Option>
                    <Option value="compliment">👍 Compliment</Option>
                    <Option value="bug-report">🐛 Bug Report</Option>
                    <Option value="feature-request">🚀 Feature Request</Option>
                    <Option value="general">💬 General Inquiry</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="service"
              label="Related Service (Optional)"
            >
              <Select placeholder="Select the service this feedback relates to" size="large" allowClear>
                <Option value="credit-cards">Credit Card Recommendations</Option>
                <Option value="ca-consultation">CA Consultation</Option>
                <Option value="financial-planning">Financial Planning</Option>
                <Option value="website">Website Experience</Option>
                <Option value="customer-support">Customer Support</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="rating"
              label="Overall Experience Rating"
            >
              <Rate 
                style={{ fontSize: '24px' }}
                tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Your Feedback"
              rules={[
                { required: true, message: 'Please enter your feedback' },
                { min: 10, message: 'Please provide at least 10 characters' }
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Please share your detailed feedback, suggestions, or describe any issues you've experienced..."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center', marginTop: '30px' }}>
              <SubmitButton
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SendOutlined />}
                block
              >
                {loading ? 'Sending Feedback...' : 'Send Feedback'}
              </SubmitButton>
            </Form.Item>
          </StyledForm>
        </FeedbackCard>

        <ContactInfo>
          <Title level={4} style={{ textAlign: 'center', marginBottom: '24px', color: '#2d3748' }}>
            Other Ways to Reach Us
          </Title>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <ContactItem>
                <MailOutlined />
                <span>support@creditleliya.com</span>
              </ContactItem>
            </Col>
            <Col xs={24} md={8}>
              <ContactItem>
                <PhoneOutlined />
                <span>+91 98765 43210</span>
              </ContactItem>
            </Col>
            <Col xs={24} md={8}>
              <ContactItem>
                <MessageOutlined />
                <span>Live Chat (9 AM - 6 PM)</span>
              </ContactItem>
            </Col>
          </Row>
        </ContactInfo>
      </ContentWrapper>
    </FeedbackContainer>
  );
};

export default FeedbackForm; 