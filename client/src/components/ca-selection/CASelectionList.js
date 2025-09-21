import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Avatar, Tag, Rate, Typography, message, Input, Select, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CACard = styled(Card)`
  margin-bottom: 16px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  &.selected {
    border: 2px solid #1890ff;
    background-color: #e6f7ff;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
`;

const FilterContainer = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
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
  },
  {
    id: 7,
    name: "CA Arjun Singh",
    experience: 14,
    rating: 4.8,
    specializations: ["Real Estate", "Property Tax"],
    consultationFee: 2200,
    availability: "Available Now",
    description: "Expert in real estate taxation and property investment advisory.",
    qualifications: ["FCA"],
    languages: ["English", "Hindi", "Punjabi"],
  },
  {
    id: 8,
    name: "CA Sarah Khan",
    experience: 9,
    rating: 4.7,
    specializations: ["NRI Taxation", "FEMA Compliance"],
    consultationFee: 2000,
    availability: "Available in 30 mins",
    description: "Specializes in NRI taxation and foreign exchange regulations.",
    qualifications: ["FCA", "CMA"],
    languages: ["English", "Hindi", "Urdu"],
  },
  {
    id: 9,
    name: "CA Deepak Menon",
    experience: 16,
    rating: 4.9,
    specializations: ["Risk Advisory", "Internal Audit"],
    consultationFee: 2800,
    availability: "Available Now",
    description: "Risk management expert with extensive experience in internal audit and controls.",
    qualifications: ["FCA", "CIA"],
    languages: ["English", "Malayalam", "Hindi"],
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
      const response = await axios.get('/api/cas', {
        params: {
          specialization: filterSpecialization,
          sortBy: sortBy
        }
      });
      setCAs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching CAs:', err);
      setError('Failed to load CAs. Please try again.');
      // Fallback to mock data if API fails
      setCAs(mockCAs);
    } finally {
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
    
    return matchesSearch;
  });

  // Get unique specializations for filter dropdown
  const allSpecializations = [...new Set(cas.flatMap(ca => ca.specializations || []))];

  return (
    <div style={{ padding: '24px' }}>
      <FilterContainer>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name or expertise..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Filter by specialization"
              style={{ width: '100%' }}
              onChange={value => setFilterSpecialization(value)}
              allowClear
              size="large"
              prefix={<FilterOutlined />}
            >
              {allSpecializations.map(spec => (
                <Option key={spec} value={spec}>{spec}</Option>
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
              prefix={<SortAscendingOutlined />}
            >
              <Option value="rating">Rating (Highest)</Option>
              <Option value="experience">Experience (Most)</Option>
              <Option value="fee-low">Fee (Lowest)</Option>
              <Option value="fee-high">Fee (Highest)</Option>
              <Option value="name">Name (A-Z)</Option>
            </Select>
          </Col>
        </Row>
      </FilterContainer>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading CAs...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="danger">{error}</Text>
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
                <StyledAvatar icon={<UserOutlined />} />
                <Title level={4} style={{ margin: '8px 0' }}>{ca.name}</Title>
                <Rate disabled defaultValue={ca.rating} style={{ fontSize: '14px' }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  ({ca.rating}/5)
                </Text>
              </div>

              <Paragraph style={{ margin: '16px 0' }}>
                <Text strong>Experience:</Text> {ca.experience} years
              </Paragraph>

              <div style={{ margin: '8px 0' }}>
                {ca.specializations.map((spec, index) => (
                  <Tag color="blue" key={index} style={{ margin: '4px' }}>
                    {spec}
                  </Tag>
                ))}
              </div>

              <Paragraph>
                <Text strong>Consultation Fee:</Text> ₹{ca.consultationFee}
              </Paragraph>

              <div style={{ margin: '8px 0' }}>
                <Tag 
                  icon={ca.availability.includes('Now') ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  color={ca.availability.includes('Now') ? 'success' : 'warning'}
                >
                  {ca.availability}
                </Tag>
              </div>

              <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                {ca.description}
              </Paragraph>

              <div style={{ marginTop: '8px' }}>
                {ca.qualifications.map((qual, index) => (
                  <Tag color="purple" key={index} style={{ margin: '4px' }}>
                    {qual}
                  </Tag>
                ))}
              </div>

              <div style={{ marginTop: '8px' }}>
                {ca.languages.map((lang, index) => (
                  <Tag color="cyan" key={index} style={{ margin: '4px' }}>
                    {lang}
                  </Tag>
                ))}
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConsultation(ca);
                  }}
                  style={{ 
                    background: selectedCA?.id === ca.id ? '#52c41a' : '#1890ff',
                    borderColor: selectedCA?.id === ca.id ? '#52c41a' : '#1890ff'
                  }}
                >
                  {selectedCA?.id === ca.id ? 'Selected - Start Now' : 'Start Consultation'}
                </Button>
              </div>
            </CACard>
          </Col>
          ))}
        </Row>
      )}

      {!loading && !error && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button 
            type="primary" 
            size="large"
            disabled={!selectedCA}
            onClick={handleStartConsultation}
          >
            Start Consultation with {selectedCA ? selectedCA.name : 'Selected CA'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CASelectionList; 