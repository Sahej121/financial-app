import React, { useState } from 'react';
import { Typography } from 'antd';
import CASelectionList from './CASelectionList';
import ConsultationModal from './ConsultationModal';
import styled from 'styled-components';

const { Title } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const CAConsultation = () => {
  const [selectedCA, setSelectedCA] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleStartConsultation = (ca) => {
    setSelectedCA(ca);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Container>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', color: 'white' }}>
        CA Consultation Service
      </Title>

      <CASelectionList onStartConsultation={handleStartConsultation} />

      <ConsultationModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        selectedCA={selectedCA}
      />
    </Container>
  );
};

export default CAConsultation; 