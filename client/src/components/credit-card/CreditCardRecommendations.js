import React, { useState } from 'react';
import { Card, Row, Col, Tag, Button, Rate, List, Typography, Tooltip, Progress, Alert, Modal, Form, Input, message } from 'antd';
import { CheckCircleOutlined, CreditCardOutlined, LinkOutlined, InfoCircleOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CreditCardRecommendations = ({ recommendations }) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();

  const handleApplyNow = (card) => {
    if (card.application_url) {
      // Open the bank's official application page
      window.open(card.application_url, '_blank', 'noopener,noreferrer');
    } else {
      message.info('Application link not available. Please visit the bank\'s website directly.');
    }
  };

  const handleSubmitFeedback = async (values) => {
    try {
      const response = await fetch('/api/creditCard/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Thank you! We\'ll add this card to our database and our team will contact you soon.');
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
      } else {
        message.error(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      message.error('Failed to submit feedback. Please try again.');
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#52c41a'; // Green for high ratings
    if (rating >= 6) return '#faad14'; // Yellow for medium ratings
    return '#ff4d4f'; // Red for low ratings
  };

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
        🎯 Personalized Credit Card Recommendations
      </Title>

      {/* Missing Card Alert */}
      <Alert
        message="Can't find the credit card you're looking for?"
        description={
          <div>
            If you know about a specific credit card that's not in our recommendations, 
            <Button 
              type="link" 
              onClick={() => setFeedbackModalVisible(true)}
              style={{ padding: '0 4px' }}
            >
              let us know
            </Button>
            and our team will help you!
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        {recommendations.map((card, index) => (
          <Col xs={24} md={12} key={index}>
            <Card 
              hoverable
              className="credit-card-recommendation"
              style={{ height: '100%' }}
              actions={[
                <Button 
                  type="primary" 
                  block 
                  icon={<LinkOutlined />}
                  onClick={() => handleApplyNow(card)}
                  size="large"
                >
                  Apply on Bank Website
                </Button>
              ]}
            >
              <div className="card-header" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <Tag color="gold" icon={<StarOutlined />}>#{index + 1} Match</Tag>
                </div>
                <Title level={4} style={{ margin: 0 }}>{card.name}</Title>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Tag color="blue">{card.bank}</Tag>
                  <Tag color="green">{card.card_type}</Tag>
                </div>
              </div>

              {/* Match and Approval Scores */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Match Score: </Text>
                  <Progress 
                    percent={card.matchPercentage || 85} 
                    size="small" 
                    status={card.matchPercentage > 80 ? 'success' : card.matchPercentage > 60 ? 'normal' : 'exception'}
                    showInfo={false}
                  />
                  <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                    {card.matchPercentage || 85}% match
                  </Text>
                </div>
                <div>
                  <Text strong>Approval Chances: </Text>
                  <Progress 
                    percent={card.approvalChance || 78} 
                    size="small" 
                    status={card.approvalChance > 70 ? 'success' : card.approvalChance > 50 ? 'normal' : 'exception'}
                    showInfo={false}
                  />
                  <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                    {card.approvalChance || 78}% likely
                  </Text>
                </div>
              </div>

              {/* Eligibility Status */}
              {card.eligibility && (
                <Alert
                  message={card.eligibilityMet ? "✅ You meet the eligibility criteria" : "⚠️ Check eligibility requirements"}
                  type={card.eligibilityMet ? "success" : "warning"}
                  showIcon={false}
                  style={{ marginBottom: 16, fontSize: 12 }}
                />
              )}

              <Paragraph className="card-highlights">
                <Text strong>Annual Charges:</Text> {card.annual_charges}
                <br />
                <Text strong>Key Benefits:</Text>
                <br />
                {card.key_benefits}
              </Paragraph>

              {/* Eligibility Requirements */}
              {card.eligibility && (
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ fontSize: 12 }}>Eligibility:</Text>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                    • Age: {card.eligibility.min_age}-{card.eligibility.max_age} years<br />
                    • Min Income: ₹{(card.eligibility.min_income / 100000).toFixed(1)}L/year<br />
                    • Credit Score: {card.eligibility.credit_score_min}+<br />
                    • Employment: {card.eligibility.employment_type.join(', ')}
                  </div>
                </div>
              )}

              <div className="card-ratings" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Tooltip title="Shopping Rating">
                      <div>
                        <Text type="secondary">Shopping</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.shopping) }}>
                          {card.ratings.shopping}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={8}>
                    <Tooltip title="Travel Rating">
                      <div>
                        <Text type="secondary">Travel</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.travel) }}>
                          {card.ratings.travel}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={8}>
                    <Tooltip title="Dining & Entertainment Rating">
                      <div>
                        <Text type="secondary">Dining</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.dining_entertainment) }}>
                          {card.ratings.dining_entertainment}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={8}>
                    <Tooltip title="Fuel Rating">
                      <div>
                        <Text type="secondary">Fuel</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.fuel) }}>
                          {card.ratings.fuel}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={8}>
                    <Tooltip title="Rewards Rating">
                      <div>
                        <Text type="secondary">Rewards</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.rewards) }}>
                          {card.ratings.rewards}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={8}>
                    <Tooltip title="Charges Rating">
                      <div>
                        <Text type="secondary">Charges</Text>
                        <br />
                        <Text strong style={{ color: getRatingColor(card.ratings.charges) }}>
                          {card.ratings.charges}/10
                        </Text>
                      </div>
                    </Tooltip>
                  </Col>
                </Row>
              </div>

              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Hidden Charges: {card.hidden_charges}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Missing Card Feedback Modal */}
      <Modal
        title="🔍 Request a Credit Card"
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="Our team will research and add it to our database!"
          description="We're constantly expanding our credit card database. Share the card details and we'll help you find the best application process."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleSubmitFeedback}
        >
          <Form.Item
            name="cardName"
            label="Credit Card Name"
            rules={[{ required: true, message: 'Please enter the credit card name' }]}
          >
            <Input placeholder="e.g., SBI SimplyCLICK Credit Card" />
          </Form.Item>

          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter the bank name' }]}
          >
            <Input placeholder="e.g., State Bank of India" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Why are you interested in this card?"
          >
            <Input.TextArea 
              rows={3}
              placeholder="e.g., Great cashback on online shopping, Low annual fees, etc."
            />
          </Form.Item>

          <Form.Item
            name="contactInfo"
            label="Your Contact (Optional)"
          >
            <Input placeholder="Email or Phone (so our team can reach you)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreditCardRecommendations; 