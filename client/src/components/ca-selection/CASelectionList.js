import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Avatar, Tag, Rate, Typography, message, Input, Select, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CACard = styled(Card)`
  margin-bottom: 24px;
  background: rgba(30, 30, 30, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border-radius: 20px !important;
  overflow: hidden;
  height: 100%;
  
  .ant-card-body {
    padding: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    transform: translateY(-8px);
    border-color: var(--primary-color) !important;
    background: rgba(30, 30, 30, 0.8) !important;
  }
  
  &.selected {
    border: 2px solid var(--primary-color) !important;
    background: rgba(0, 176, 240, 0.05) !important;
    box-shadow: 0 0 30px rgba(0, 176, 240, 0.15);
  }

  h4.ant-typography {
    color: white !important;
    font-size: 1.4rem;
    margin-bottom: 8px;
  }

  .ant-typography {
    color: var(--text-secondary);
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 90px;
  height: 90px;
  margin-bottom: 20px;
  border: 4px solid rgba(255, 255, 255, 0.05);
  background: #111;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
`;

const FilterContainer = styled.div`
  margin-bottom: 48px;
  padding: 32px;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);

  .ant-select-selector {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    height: 50px !important;
    display: flex;
    align-items: center;
    border-radius: 12px !important;
  }

  .ant-select-arrow {
    color: rgba(255, 255, 255, 0.5);
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    height: 50px;
    border-radius: 12px !important;
    padding-left: 16px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const PrimaryButton = styled(Button)`
  height: 48px;
  border-radius: 24px;
  font-weight: 600;
  border: none;
  background: var(--primary-color);
  color: black;
  box-shadow: 0 4px 15px rgba(0, 176, 240, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 176, 240, 0.3);
    background: white !important;
    color: black !important;
  }
  
  &.selected-btn {
    background: var(--success-color) !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  }
`;

// Mock data - Replace with actual API data later
const mockCAs = [
  {
    id: 1,
    name: "CA Rahul Sharma",
    experience: 8,
    rating: 4.8,
    specializations: ["Tax Planning", "Business Advisory"],
    consultationFee: 1500,
    availability: "Available Now",
    description: "Experienced CA with expertise in tax planning and business advisory services. Specializes in startups and SMEs.",
    qualifications: ["FCA", "DISA"],
    languages: ["English", "Hindi"],
  },
  {
    id: 2,
    name: "CA Priya Patel",
    experience: 12,
    rating: 4.9,
    specializations: ["Corporate Finance", "Audit"],
    consultationFee: 2000,
    availability: "Available in 1 hour",
    description: "Senior CA with focus on corporate finance and statutory audits. Expert in IFRS and Ind AS.",
    qualifications: ["FCA", "CPA"],
    languages: ["English", "Hindi", "Gujarati"],
  },
  {
    id: 3,
    name: "CA Amit Kumar",
    experience: 15,
    rating: 4.7,
    specializations: ["GST", "International Taxation"],
    consultationFee: 2500,
    availability: "Available Now",
    description: "GST expert with extensive experience in international taxation and cross-border transactions.",
    qualifications: ["FCA", "LLB"],
    languages: ["English", "Hindi", "Bengali"],
  },
  {
    id: 4,
    name: "CA Sneha Reddy",
    experience: 10,
    rating: 4.9,
    specializations: ["Personal Finance", "Investment Planning"],
    consultationFee: 1800,
    availability: "Available Now",
    description: "Specializes in personal financial planning and investment advisory. Expert in mutual funds and equity markets.",
    qualifications: ["FCA", "CFP"],
    languages: ["English", "Telugu", "Hindi"],
  },
  {
    id: 5,
    name: "CA Rajesh Gupta",
    experience: 20,
    rating: 4.9,
    specializations: ["Corporate Restructuring", "Mergers & Acquisitions"],
    consultationFee: 3000,
    availability: "Available in 2 hours",
    description: "Senior consultant specializing in corporate restructuring and M&A. Former Big 4 partner.",
    qualifications: ["FCA", "ICWA"],
    languages: ["English", "Hindi"],
  },
  {
    id: 6,
    name: "CA Meera Iyer",
    experience: 7,
    rating: 4.6,
    specializations: ["Startup Advisory", "Compliance"],
    consultationFee: 1200,
    availability: "Available Now",
    description: "Startup specialist helping new businesses with compliance and growth strategy.",
    qualifications: ["ACA", "CS"],
    languages: ["English", "Tamil", "Hindi"],
  }
];

const CASelectionList = ({ onStartConsultation }) => {
  const [selectedCA, setSelectedCA] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [cas, setCAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCAs();
  }, [sortBy, filterSpecialization]);

  const fetchCAs = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCAs(mockCAs);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching CAs:', err);
      setError('Failed to load CAs. Please try again.');
      setCAs(mockCAs);
      setLoading(false);
    }
  };

  const handleCASelect = (ca) => {
    setSelectedCA(ca);
  };

  const handleStartConsultation = () => {
    if (!selectedCA) {
      message.warning('Please select a CA first');
      return;
    }
    onStartConsultation(selectedCA);
  };

  const filteredCAs = cas.filter(ca => {
    const matchesSearch = ca.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Additional filtering logic for specializations would go here
    if (filterSpecialization && !ca.specializations.includes(filterSpecialization)) {
      return false;
    }

    return matchesSearch;
  });

  const allSpecializations = [...new Set(cas.flatMap(ca => ca.specializations || []))];

  return (
    <div style={{ padding: '0 24px' }}>
      <FilterContainer>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name or expertise..."
              prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
              onChange={e => setSearchTerm(e.target.value)}
              size="large"
              bordered={false}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Filter by specialization"
              style={{ width: '100%' }}
              onChange={value => setFilterSpecialization(value)}
              allowClear
              size="large"
              dropdownStyle={{ background: '#1f1f1f', color: 'white' }}
            >
              {allSpecializations.map(spec => (
                <Option key={spec} value={spec} style={{ color: 'white' }}>{spec}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              value={sortBy}
              onChange={value => setSortBy(value)}
              size="large"
              dropdownStyle={{ background: '#1f1f1f', color: 'white' }}
            >
              <Option value="rating" style={{ color: 'white' }}>Rating (Highest)</Option>
              <Option value="experience" style={{ color: 'white' }}>Experience (Most)</Option>
              <Option value="fee-low" style={{ color: 'white' }}>Fee (Lowest)</Option>
            </Select>
          </Col>
        </Row>
      </FilterContainer>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: 'white' }}>Loading CAs...</div>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredCAs.map((ca) => (
            <Col xs={24} md={12} lg={8} key={ca.id}>
              <CACard
                className={selectedCA?.id === ca.id ? 'selected' : ''}
                onClick={() => handleCASelect(ca)}
                hoverable
              >
                <div style={{ textAlign: 'center' }}>
                  <StyledAvatar icon={<UserOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }} />} />
                  <Title level={4} style={{ margin: '8px 0', fontSize: '1.25rem' }}>{ca.name}</Title>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Rate disabled defaultValue={ca.rating} style={{ fontSize: '14px', color: '#F2C811' }} />
                    <Text type="secondary" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>({ca.rating})</Text>
                  </div>
                </div>

                <div style={{ margin: '16px 0', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {ca.specializations.slice(0, 2).map((spec, index) => (
                    <Tag color="cyan" key={index} style={{ background: 'rgba(19, 194, 194, 0.1)', border: '1px solid rgba(19, 194, 194, 0.3)', color: '#13c2c2', margin: 0 }}>
                      {spec}
                    </Tag>
                  ))}
                </div>

                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textAlign: 'center', marginBottom: 20 }}>
                  {ca.description}
                </Paragraph>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>FEE</Text>
                    <Text strong style={{ color: 'white', fontSize: '16px' }}>₹{ca.consultationFee}</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>EXP</Text>
                    <Text strong style={{ color: 'white', fontSize: '16px' }}>{ca.experience} yrs</Text>
                  </div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <PrimaryButton
                    type="primary"
                    block
                    className={selectedCA?.id === ca.id ? 'selected-btn' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartConsultation(ca);
                    }}
                  >
                    {selectedCA?.id === ca.id ? 'Selected' : 'Book Now'}
                  </PrimaryButton>
                </div>
              </CACard>
            </Col>
          ))}
        </Row>
      )}

      {!loading && !error && selectedCA && (
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '40px', position: 'sticky', bottom: 20, zIndex: 10 }}>
          <PrimaryButton
            size="large"
            style={{ height: '56px', padding: '0 48px', fontSize: '18px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            onClick={handleStartConsultation}
          >
            Start Session with {selectedCA.name}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default CASelectionList; 