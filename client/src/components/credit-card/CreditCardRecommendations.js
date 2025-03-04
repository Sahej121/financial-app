import React, { useState } from 'react';
import { Card, Row, Col, Tag, Button, Rate, List, Typography } from 'antd';
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

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
        Recommended Credit Cards for You
      </Title>

      <Row gutter={[24, 24]}>
        {recommendations.map((card) => (
          <Col xs={24} md={12} key={card.id}>
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
                <Tag color="blue">{card.type}</Tag>
              </div>

              <div className="card-rating">
                <Rate disabled defaultValue={card.rating} />
                <Text type="secondary">({card.reviewCount} reviews)</Text>
              </div>

              <Paragraph className="card-highlights">
                <Text strong>Key Benefits:</Text>
                <List
                  size="small"
                  dataSource={card.benefits}
                  renderItem={benefit => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {benefit}
                    </List.Item>
                  )}
                />
              </Paragraph>

              <div className="card-details">
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Annual Fee</Text>
                    <br />
                    <Text strong>{card.annualFee === 0 ? 'Free' : `₹${card.annualFee}`}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Reward Rate</Text>
                    <br />
                    <Text strong>{card.rewardRate}</Text>
                  </Col>
                </Row>
              </div>

              {card.welcomeOffer && (
                <div className="welcome-offer">
                  <Tag color="gold">Welcome Offer</Tag>
                  <Text>{card.welcomeOffer}</Text>
                </div>
              )}
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