import React, { useState } from 'react';
import { Card, Row, Col, Tag, Button, Progress, Alert, Modal, Form, Input, message, Tooltip, Divider, Space, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  LinkOutlined,
  StarOutlined,
  TrophyOutlined,
  SafetyOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CarOutlined,
  ShoppingOutlined,
  RiseOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CreditCardRecommendations = ({ recommendations, userPreferences }) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();

  const handleApplyNow = (card) => {
    if (card.application_url) {
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
    if (rating >= 8) return '#52c41a';
    if (rating >= 6) return '#faad14';
    return '#ff4d4f';
  };

  const getMatchBadge = (index) => {
    if (index === 0) return { text: 'Best Match', color: '#FFD700', icon: <TrophyOutlined /> };
    if (index === 1) return { text: 'Great Match', color: '#C0C0C0', icon: <StarOutlined /> };
    if (index === 2) return { text: 'Good Match', color: '#CD7F32', icon: <CheckCircleOutlined /> };
    return { text: `Top ${index + 1}`, color: '#1890ff', icon: <RiseOutlined /> };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      shopping: <ShoppingOutlined />,
      travel: <CarOutlined />,
      dining_entertainment: <GiftOutlined />,
      fuel: <ThunderboltOutlined />,
      rewards: <StarOutlined />,
      charges: <DollarOutlined />
    };
    return icons[category] || <CheckCircleOutlined />;
  };

  const getWhyRecommended = (card, index) => {
    const reasons = [];

    if (index === 0) {
      reasons.push('Highest match based on your preferences');
    }

    if (userPreferences?.primaryBank &&
      card.bank?.toLowerCase().includes(userPreferences.primaryBank.toLowerCase())) {
      reasons.push(`You have existing relationship with ${card.bank}`);
    }

    if (card.approvalChance >= 85) {
      reasons.push('Very high approval probability');
    }

    if (userPreferences?.rewardPreference === 'cashback' && card.card_type === 'Cashback') {
      reasons.push('Matches your cashback preference');
    } else if (userPreferences?.rewardPreference === 'travel' && card.card_type === 'Travel') {
      reasons.push('Perfect for your travel needs');
    }

    const monthlySpend = parseFloat(userPreferences?.monthlySpend || 0);
    const cardFee = parseInt(card.annual_charges?.replace(/[^0-9]/g, '') || '0');

    if (cardFee === 0 && monthlySpend < 30000) {
      reasons.push('No annual fee - great for moderate spending');
    } else if (monthlySpend > 50000 && cardFee > 0) {
      reasons.push('Premium benefits worth the annual fee');
    }

    return reasons;
  };

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ color: 'white', fontWeight: 800, marginBottom: 8 }}>
          Your Personalized Recommendations
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
          Based on your profile, we found {recommendations.length} credit cards perfect for you
        </Text>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {Math.round(recommendations.reduce((sum, c) => sum + c.matchPercentage, 0) / recommendations.length)}%
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Average Match Score</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {Math.round(recommendations.reduce((sum, c) => sum + c.approvalChance, 0) / recommendations.length)}%
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Avg Approval Chance</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {recommendations.filter(c => c.eligibilityMet).length}/{recommendations.length}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Eligible Cards</Text>
          </Card>
        </Col>
      </Row>

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
        {recommendations.map((card, index) => {
          const badge = getMatchBadge(index);
          const reasons = getWhyRecommended(card, index);

          return (
            <Col xs={24} md={12} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  background: index === 0
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: index === 0
                    ? '2px solid rgba(255,215,0,0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Ranking Badge */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: badge.color,
                  color: index < 3 ? '#000' : '#fff',
                  padding: '8px 20px',
                  borderBottomLeftRadius: '16px',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {badge.icon}
                  {badge.text}
                </div>

                <div style={{ marginTop: 32 }}>
                  {/* Card Header */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <CreditCardOutlined style={{ fontSize: 32, color: '#00B0F0' }} />
                      <div>
                        <Title level={4} style={{ margin: 0, color: 'white' }}>
                          {card.name}
                        </Title>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Tag
                            color="blue"
                            style={{
                              background: 'rgba(24, 144, 255, 0.2)',
                              border: '1px solid #1890ff',
                              color: '#40a9ff'
                            }}
                          >
                            {card.bank}
                          </Tag>
                          <Tag
                            color="green"
                            style={{
                              background: 'rgba(82, 196, 26, 0.2)',
                              border: '1px solid #52c41a',
                              color: '#73d13d'
                            }}
                          >
                            {card.card_type}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why Recommended */}
                  {reasons.length > 0 && (
                    <Alert
                      message="Why we recommend this"
                      description={
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                          {reasons.map((reason, idx) => (
                            <li key={idx} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      }
                      type="info"
                      showIcon
                      icon={<SafetyOutlined />}
                      style={{
                        marginBottom: 20,
                        background: 'rgba(24, 144, 255, 0.1)',
                        border: '1px solid rgba(24, 144, 255, 0.3)',
                        color: '#91d5ff'
                      }}
                    />
                  )}

                  {/* Match and Approval Scores */}
                  <div style={{
                    marginBottom: 20,
                    padding: '20px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                          <Progress
                            type="circle"
                            percent={card.matchPercentage || 85}
                            width={80}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                            format={(percent) => (
                              <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
                                {percent}%
                              </span>
                            )}
                          />
                          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                            Match Score
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                          <Progress
                            type="circle"
                            percent={card.approvalChance || 78}
                            width={80}
                            strokeColor={{
                              '0%': '#faad14',
                              '100%': '#52c41a',
                            }}
                            format={(percent) => (
                              <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
                                {percent}%
                              </span>
                            )}
                          />
                          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                            Approval Chance
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Eligibility Status */}
                  {card.eligibility && (
                    <Alert
                      message={card.eligibilityMet ? "✓ You meet eligibility criteria" : "⚠ Check eligibility requirements"}
                      type={card.eligibilityMet ? "success" : "warning"}
                      showIcon={false}
                      style={{
                        marginBottom: 16,
                        fontSize: 13,
                        fontWeight: 600,
                        background: card.eligibilityMet ? 'rgba(82, 196, 26, 0.15)' : 'rgba(250, 173, 20, 0.15)',
                        border: '1px solid',
                        borderColor: card.eligibilityMet ? 'rgba(82, 196, 26, 0.4)' : 'rgba(250, 173, 20, 0.4)',
                        color: card.eligibilityMet ? '#95de64' : '#ffc53d'
                      }}
                    />
                  )}

                  {/* Card Details */}
                  <div style={{ marginBottom: 16 }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div>
                        <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                          Annual Charges:
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 8 }}>
                          {card.annual_charges}
                        </Text>
                      </div>
                      <div>
                        <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                          Key Benefits:
                        </Text>
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                          style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, marginBottom: 0 }}
                        >
                          {card.key_benefits}
                        </Paragraph>
                      </div>
                    </Space>
                  </div>

                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

                  {/* Category Ratings */}
                  <div>
                    <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 12, display: 'block' }}>
                      Category Ratings
                    </Text>
                    <Row gutter={[12, 12]}>
                      {Object.entries(card.ratings).map(([category, rating]) => (
                        <Col span={8} key={category}>
                          <Tooltip title={`${category.replace('_', ' ')} rating`}>
                            <div style={{
                              textAlign: 'center',
                              padding: '12px 8px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              <div style={{ fontSize: 20, marginBottom: 4, color: 'rgba(255,255,255,0.7)' }}>
                                {getCategoryIcon(category)}
                              </div>
                              <Text strong style={{
                                color: getRatingColor(rating),
                                fontSize: 16,
                                display: 'block'
                              }}>
                                {rating}/10
                              </Text>
                              <Text style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 11,
                                textTransform: 'capitalize'
                              }}>
                                {category.replace('_', ' ')}
                              </Text>
                            </div>
                          </Tooltip>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* Eligibility Details */}
                  {card.eligibility && (
                    <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                      <Text strong style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 8 }}>
                        Eligibility Requirements:
                      </Text>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            • Age: {card.eligibility.min_age}-{card.eligibility.max_age} years
                          </Col>
                          <Col span={12}>
                            • Income: ₹{(card.eligibility.min_income / 100000).toFixed(1)}L+/year
                          </Col>
                          <Col span={12}>
                            • Credit Score: {card.eligibility.credit_score_min}+
                          </Col>
                          <Col span={12}>
                            • {card.eligibility.employment_type.join(', ')}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}

                  {/* Hidden Charges */}
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      Hidden Charges: {card.hidden_charges}
                    </Text>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 20 }}>
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<LinkOutlined />}
                      onClick={() => handleApplyNow(card)}
                      style={{
                        background: index === 0
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                          : 'white',
                        color: 'black',
                        border: 'none',
                        fontWeight: 700,
                        borderRadius: '12px',
                        height: 52,
                        fontSize: 16
                      }}
                    >
                      Apply on Bank Website
                    </Button>
                    <Button
                      block
                      size="large"
                      onClick={() => {
                        setSelectedCard(card);
                        setCompareModalVisible(true);
                      }}
                      style={{
                        marginTop: 12,
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontWeight: 600,
                        borderRadius: '12px',
                        height: 48
                      }}
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
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
            <Button type="primary" htmlType="submit" block size="large">
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Card Details Modal */}
      <Modal
        title="Card Details"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={() => {
              if (selectedCard) {
                handleApplyNow(selectedCard);
                setCompareModalVisible(false);
              }
            }}
          >
            Apply Now
          </Button>
        ]}
        width={700}
      >
        {selectedCard && (
          <div>
            <Title level={4}>{selectedCard.name}</Title>
            <Paragraph>{selectedCard.key_benefits}</Paragraph>
            <Divider />
            <Text strong>Special Remarks:</Text>
            <Paragraph>{selectedCard.special_remarks}</Paragraph>
            <Text strong>Hidden Charges:</Text>
            <Paragraph type="secondary">{selectedCard.hidden_charges}</Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreditCardRecommendations;