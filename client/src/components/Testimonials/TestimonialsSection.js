import React, { useState, useEffect } from 'react';
import { Card, Rate, Avatar, Typography, Row, Col, Button } from 'antd';
import { UserOutlined, LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { testimonialsData } from '../../data/testimonialsData';

const { Title, Paragraph, Text } = Typography;

const TestimonialsContainer = styled.div`
  padding: 80px 20px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.03"><circle cx="30" cy="30" r="4"/></g></svg>') repeat;
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const StyledTitle = styled(Title)`
  &.ant-typography {
    color: white !important;
    font-size: 2.5rem !important;
    font-weight: 700 !important;
    margin-bottom: 16px !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const StyledSubtitle = styled(Paragraph)`
  &.ant-typography {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 18px !important;
    max-width: 600px;
    margin: 0 auto !important;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

const TestimonialCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
  
  .ant-card-body {
    padding: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

const QuoteIcon = styled.div`
  font-size: 48px;
  color: #1890ff;
  opacity: 0.3;
  margin-bottom: 20px;
  font-family: serif;
  line-height: 1;
`;

const ReviewText = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 24px;
  flex-grow: 1;
  font-style: italic;
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const AuthorInfo = styled.div`
  margin-left: 16px;
  flex-grow: 1;
`;

const ServiceTag = styled.span`
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
`;

const NavButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.1);
  }
  
  &:focus {
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
`;

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonialsData.length / itemsPerPage);

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentIndex * itemsPerPage;
    return testimonialsData.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <TestimonialsContainer
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <ContentWrapper>
        <HeaderSection>
          <StyledTitle level={1}>
            <StarFilled style={{ marginRight: '12px', color: '#ffd700' }} />
            What Our Clients Say
          </StyledTitle>
          <StyledSubtitle>
            Join thousands of satisfied clients who have transformed their financial journey with our expert guidance and personalized solutions.
          </StyledSubtitle>
        </HeaderSection>

        <CarouselContainer>
          <Row gutter={[24, 24]} justify="center">
            {getCurrentTestimonials().map((testimonial) => (
              <Col xs={24} md={8} key={testimonial.id}>
                <TestimonialCard>
                  <QuoteIcon>"</QuoteIcon>
                  <Rate disabled defaultValue={testimonial.rating} style={{ marginBottom: '16px' }} />
                  <ReviewText>{testimonial.review}</ReviewText>
                  <AuthorSection>
                    <Avatar 
                      size={56} 
                      src={testimonial.avatar}
                      icon={<UserOutlined />}
                    />
                    <AuthorInfo>
                      <div style={{ fontWeight: 600, fontSize: '16px', color: '#2d3748' }}>
                        {testimonial.name}
                      </div>
                      <div style={{ color: '#718096', fontSize: '14px' }}>
                        {testimonial.role}
                      </div>
                      <div style={{ color: '#a0aec0', fontSize: '12px' }}>
                        {testimonial.location}
                      </div>
                    </AuthorInfo>
                    <ServiceTag>{testimonial.service}</ServiceTag>
                  </AuthorSection>
                </TestimonialCard>
              </Col>
            ))}
          </Row>
        </CarouselContainer>

        <NavigationButtons>
          <NavButton onClick={prevSlide} icon={<LeftOutlined />} />
          <NavButton onClick={nextSlide} icon={<RightOutlined />} />
        </NavigationButtons>

        <DotsContainer>
          {Array.from({ length: totalPages }).map((_, index) => (
            <Dot
              key={index}
              active={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </DotsContainer>
      </ContentWrapper>
    </TestimonialsContainer>
  );
};

export default TestimonialsSection; 