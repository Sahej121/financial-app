import React from 'react';
import { Typography } from 'antd';
import CAList from '../components/CAList';

const { Title, Paragraph } = Typography;

const CASelection = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f0f2f5' }}>
        <Title level={2}>Find Your Perfect CA Match</Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: 800, margin: '0 auto' }}>
          Browse through our curated list of experienced Chartered Accountants. 
          Filter by experience, specialization, and budget to find the perfect match for your needs.
        </Paragraph>
      </div>
      <CAList />
    </div>
  );
};

export default CASelection; 