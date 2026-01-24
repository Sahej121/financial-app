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
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40, color: 'white', fontWeight: 800 }}>
        Personalized Credit Card Recommendations
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
              style={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}
              actions={[
                <Button
                  type="primary"
                  block
                  icon={<LinkOutlined />}
                  onClick={() => handleApplyNow(card)}
                  size="large"
                  style={{
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    margin: '0 16px 16px 16px',
                    width: 'calc(100% - 32px)'
                  }}
                >
                  Apply on Bank Website
                </Button>
              ]}
            >
              <div className="card-header" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CreditCardOutlined style={{ fontSize: 24, color: '#00B0F0' }} />
                  <Tag color="gold" icon={<StarOutlined />} style={{ color: '#000', fontWeight: 600 }}>#{index + 1} Match</Tag>
                </div>
                <Title level={4} style={{ margin: 0, color: 'white' }}>{card.name}</Title>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Tag color="blue" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1890ff' }}>{card.bank}</Tag>
                  <Tag color="green" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #52c41a' }}>{card.card_type}</Tag>
                </div>
              </div>

              {/* Match and Approval Scores */}
              <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Match Score</Text>
                    <Text style={{ color: '#00B0F0', fontWeight: 600 }}>{card.matchPercentage || 85}%</Text>
                  </div>
                  <Progress
                    percent={card.matchPercentage || 85}
                    size="small"
                    strokeColor="#00B0F0"
                    trailColor="rgba(255,255,255,0.1)"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Approval Chance</Text>
                    <Text style={{ color: '#52c41a', fontWeight: 600 }}>{card.approvalChance || 78}%</Text>
                  </div>
                  <Progress
                    percent={card.approvalChance || 78}
                    size="small"
                    strokeColor="#52c41a"
                    trailColor="rgba(255,255,255,0.1)"
                    showInfo={false}
                  />
                </div>
              </div>

              {/* Eligibility Status */}
              {card.eligibility && (
                <Alert
                  message={card.eligibilityMet ? "You meet the eligibility criteria" : "Check eligibility requirements"}
                  type={card.eligibilityMet ? "success" : "warning"}
                  showIcon={false}
                  style={{
                    marginBottom: 16,
                    fontSize: 12,
                    background: card.eligibilityMet ? 'rgba(82, 196, 26, 0.1)' : 'rgba(250, 173, 20, 0.1)',
                    border: '1px solid',
                    borderColor: card.eligibilityMet ? 'rgba(82, 196, 26, 0.2)' : 'rgba(250, 173, 20, 0.2)',
                    color: card.eligibilityMet ? '#52c41a' : '#faad14'
                  }}
                />
              )}

              <Paragraph className="card-highlights" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Text strong style={{ color: 'white' }}>Annual Charges:</Text> {card.annual_charges}
                <br />
                <Text strong style={{ color: 'white' }}>Key Benefits:</Text>
                <br />
                {card.key_benefits}
              </Paragraph>

              {/* Eligibility Requirements */}
              {card.eligibility && (
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Eligibility:</Text>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Shopping</Text>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Travel</Text>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Dining</Text>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Fuel</Text>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Rewards</Text>
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
                        <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>Charges</Text>
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
                <Text type="secondary" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  Hidden Charges: {card.hidden_charges}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Missing Card Feedback Modal */}
      <Modal
        title="Request a Credit Card"
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