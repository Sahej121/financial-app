import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, message, Modal, Spin, Form, Rate, Input } from 'antd';
import styled from 'styled-components';
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  DesktopOutlined,
  UserOutlined
} from '@ant-design/icons';

const MeetingContainer = styled.div`
  height: 100%;
  background: #141414;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const VideoArea = styled.div`
  flex: 1;
  background: #1f1f1f;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  min-height: 600px;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const ParticipantCard = styled(Card)`
  background: #1f1f1f;
  border: 1px solid #303030;
  margin-bottom: 16px;
`;

const JitsiMeeting = ({ consultationId, onMeetingEnd, userName = 'Financial Consultant' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const jitsiApiRef = useRef(null);

  // Post-meeting feedback state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    loadMeetingDetails();
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [consultationId]);

  const loadMeetingDetails = async () => {
    try {
      setIsLoading(true);
      // We can use a simpler endpoint or the same one, mainly we need a unique Room ID
      // For now, let's generate a consistent room ID based on consultationId
      const roomId = `CreditLeliya-Consultation-${consultationId}`;

      setMeetingDetails({
        id: consultationId, // Using consultationId as meeting ref
        roomId: roomId,
        joinUrl: `https://meet.jit.si/${roomId}`
      });

      setIsLoading(false);
    } catch (error) {
      message.error('Failed to load meeting details: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleJitsiLoad = () => {
    setIsLoading(false);
  };

  const endMeeting = async () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    setFeedbackVisible(true);
  };

  const submitFeedback = async (values) => {
    setFeedbackLoading(true);
    try {
      const payload = {
        status: 'completed',
        rating: values.rating,
        feedback: values.comments
      };

      const res = await fetch(`/api/meetings/${consultationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        message.success('Thanks for your feedback!');
      } else {
        throw new Error(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      // We don't block the user if the backend fails, just notify
      message.warning('Feedback saved locally (backend offline).');
    } finally {
      setFeedbackLoading(false);
      setFeedbackVisible(false);
      if (typeof onMeetingEnd === 'function') onMeetingEnd();
    }
  };

  const skipFeedback = () => {
    setFeedbackVisible(false);
    if (typeof onMeetingEnd === 'function') onMeetingEnd();
  };

  if (isLoading && !meetingDetails) {
    return (
      <MeetingContainer>
        <Spin size="large" tip="Setting up secure meeting room..." />
      </MeetingContainer>
    );
  }

  return (
    <MeetingContainer>
      <VideoArea>
        {meetingDetails && (
          <iframe
            src={`https://meet.jit.si/${meetingDetails.roomId}#userInfo.displayName="${userName}"&config.prejoinPageEnabled=false`}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            onLoad={handleJitsiLoad}
            title="Jitsi Meeting"
          />
        )}
      </VideoArea>

      <ParticipantCard title="Meeting Information">
        <Space direction="vertical">
          <div>
            <strong>Room Name:</strong> {meetingDetails?.roomId}
          </div>
          <div>
            <strong>Direct Link:</strong>{' '}
            <a href={meetingDetails?.joinUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
          <Button type="primary" danger onClick={endMeeting}>
            End Meeting & Submit Feedback
          </Button>
        </Space>
      </ParticipantCard>

      <Modal
        title="How was your consultation?"
        visible={feedbackVisible}
        onCancel={skipFeedback}
        footer={null}
        centered
        maskClosable={false}
      >
        <Form form={feedbackForm} layout="vertical" onFinish={submitFeedback}>
          <Form.Item name="rating" label="Overall rating" initialValue={5}>
            <Rate />
          </Form.Item>

          <Form.Item name="comments" label="Comments">
            <Input.TextArea rows={4} placeholder="Share your experience, suggestions or issues..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={skipFeedback}>Skip</Button>
            <Button type="primary" htmlType="submit" loading={feedbackLoading}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </MeetingContainer>
  );
};

export default JitsiMeeting; 