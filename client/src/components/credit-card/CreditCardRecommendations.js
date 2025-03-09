import React, { useState } from 'react';
import { Card, Row, Col, Tag, Button, Rate, List, Typography, Tooltip } from 'antd';
import { CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import CreditCardApplicationModal from './CreditCardApplicationModal';

const { Title, Text, Paragraph } = Typography;

const CreditCardRecommendations = ({ recommendations }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleApplyNow = (card) => {
    setSelectedCard(card);
  };

  const handleModalClose = () => {
    setSelectedCard(null);
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#52c41a'; // Green for high ratings
    if (rating >= 6) return '#faad14'; // Yellow for medium ratings
    return '#ff4d4f'; // Red for low ratings
  };

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
        Recommended Credit Cards for You
      </Title>

      <Row gutter={[24, 24]}>
        {recommendations.map((card, index) => (
          <Col xs={24} md={12} key={index}>
            <Card 
              hoverable
              className="credit-card-recommendation"
              actions={[
                <Button type="primary" block onClick={() => handleApplyNow(card)}>
                  Apply Now
                </Button>
              ]}
            >
              <div className="card-header">
                <CreditCardOutlined style={{ fontSize: 24 }} />
                <Title level={4}>{card.name}</Title>
                <Tag color="blue">{card.special_remarks}</Tag>
              </div>

              <Paragraph className="card-highlights">
                <Text strong>Annual Charges:</Text> {card.annual_charges}
                <br />
                <Text strong>Key Benefits:</Text>
                <br />
                {card.key_benefits}
              </Paragraph>

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

      <CreditCardApplicationModal
        visible={!!selectedCard}
        onCancel={handleModalClose}
        card={selectedCard}
      />
    </div>
  );
};

export default CreditCardRecommendations; 