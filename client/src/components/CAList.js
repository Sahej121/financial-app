import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Rate, Button, Select, InputNumber, Space, Tag, Spin } from 'antd';
import { UserOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { fetchCAs, setFilters } from '../redux/slices/caSlice';

const { Option } = Select;

const CAList = () => {
  const dispatch = useDispatch();
  const { cas, loading, error, filters } = useSelector((state) => state.ca);
  const { priceRange, experience, specialization } = filters;

  const specializations = [
    'Tax Planning',
    'Audit',
    'Financial Advisory',
    'Business Consulting',
    'GST',
    'Startup Advisory'
  ];

  useEffect(() => {
    dispatch(fetchCAs({ experience, priceRange, specialization }));
  }, [dispatch, experience, priceRange, specialization]);

  const handleExperienceChange = (value) => {
    dispatch(setFilters({ experience: value }));
  };

  const handlePriceRangeChange = (index, value) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = value;
    dispatch(setFilters({ priceRange: newPriceRange }));
  };

  const handleSpecializationChange = (value) => {
    dispatch(setFilters({ specialization: value }));
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="ca-list-section">
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Card title="Filter CAs">
            <Space size="large" wrap>
              <div>
                <label>Experience</label>
                <Select
                  value={experience}
                  style={{ width: 200, marginLeft: 8 }}
                  onChange={handleExperienceChange}
                >
                  <Option value="all">All Experience Levels</Option>
                  <Option value="0-5">0-5 years</Option>
                  <Option value="5-10">5-10 years</Option>
                  <Option value="10+">10+ years</Option>
                </Select>
              </div>

              <div>
                <label>Price Range</label>
                <Space size="small" style={{ marginLeft: 8 }}>
                  <InputNumber
                    style={{ width: 100 }}
                    value={priceRange[0]}
                    onChange={(value) => handlePriceRangeChange(0, value)}
                    prefix="₹"
                  />
                  <span>to</span>
                  <InputNumber
                    style={{ width: 100 }}
                    value={priceRange[1]}
                    onChange={(value) => handlePriceRangeChange(1, value)}
                    prefix="₹"
                  />
                </Space>
              </div>

              <div>
                <label>Specialization</label>
                <Select
                  value={specialization}
                  style={{ width: 200, marginLeft: 8 }}
                  onChange={handleSpecializationChange}
                >
                  <Option value="all">All Specializations</Option>
                  {specializations.map(spec => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {loading ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Spin size="large" />
          </Col>
        ) : (
          cas.map(ca => (
            <Col xs={24} sm={12} md={8} lg={6} key={ca.id}>
              <Card
                hoverable
                className="ca-card"
                actions={[
                  <Button type="primary" block>
                    Book Consultation
                  </Button>
                ]}
              >
                <div className="ca-avatar">
                  <UserOutlined style={{ fontSize: 48 }} />
                </div>
                <h3>{ca.name}</h3>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <TrophyOutlined /> Experience: {ca.experience} years
                  </div>
                  <div>
                    <DollarOutlined /> Fee: ₹{ca.fee}
                  </div>
                  <Rate disabled defaultValue={ca.rating} />
                  <div>
                    {ca.specializations.map(spec => (
                      <Tag key={spec} color="blue">{spec}</Tag>
                    ))}
                  </div>
                </Space>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default CAList; 