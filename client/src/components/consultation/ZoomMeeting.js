import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Modal, Spin } from 'antd';
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
`;

const VideoArea = styled.div`
  height: 600px;
  background: #1f1f1f;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;

const ControlBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const ControlButton = styled(Button)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ParticipantCard = styled(Card)`
  background: #1f1f1f;
  border: 1px solid #303030;
  margin-bottom: 16px;
`;

const ZoomMeeting = ({ consultationId, onMeetingEnd }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [zoomClient, setZoomClient] = useState(null);

  useEffect(() => {
    loadZoomMeeting();
  }, [consultationId]);

  const loadZoomMeeting = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/zoom/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId,
          topic: 'Financial Consultation',
          duration: 60, // 60 minutes
          startTime: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMeetingDetails(data.meeting);
        initializeZoomClient(data.meeting);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error('Failed to create meeting: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeZoomClient = async (meeting) => {
    try {
      const { ZoomMtg } = await import('@zoomus/websdk');
      
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.13.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      ZoomMtg.init({
        leaveUrl: window.location.origin,
        success: (success) => {
          console.log('Init success:', success);
          joinMeeting(ZoomMtg, meeting);
        },
        error: (error) => {
          console.error('Init error:', error);
          message.error('Failed to initialize Zoom meeting');
        }
      });

      setZoomClient(ZoomMtg);
    } catch (error) {
      console.error('Error initializing Zoom:', error);
      message.error('Failed to initialize Zoom client');
    }
  };

  const joinMeeting = (ZoomMtg, meeting) => {
    ZoomMtg.join({
      meetingNumber: meeting.id,
      userName: 'Financial Consultant', // This should come from user context
      signature: meeting.signature, // JWT signature from your backend
      password: meeting.password,
      success: (success) => {
        console.log('Join success:', success);
      },
      error: (error) => {
        console.error('Join error:', error);
        message.error('Failed to join meeting');
      }
    });
  };

  const toggleAudio = () => {
    if (zoomClient) {
      zoomClient.mute({
        mute: !isMuted,
        success: () => setIsMuted(!isMuted)
      });
    }
  };

  const toggleVideo = () => {
    if (zoomClient) {
      zoomClient.stopVideo({
        stop: isVideoOn,
        success: () => setIsVideoOn(!isVideoOn)
      });
    }
  };

  const toggleScreenShare = () => {
    if (zoomClient) {
      if (isScreenSharing) {
        zoomClient.stopShareScreen();
      } else {
        zoomClient.startShareScreen();
      }
      setIsScreenSharing(!isScreenSharing);
    }
  };

  const endMeeting = async () => {
    try {
      if (meetingDetails?.id) {
        await fetch(`/api/zoom/meetings/${meetingDetails.id}/end`, {
          method: 'PUT'
        });
      }
      onMeetingEnd();
    } catch (error) {
      console.error('Error ending meeting:', error);
      message.error('Failed to end meeting');
    }
  };

  if (isLoading) {
    return (
      <MeetingContainer>
        <Spin size="large" tip="Setting up your meeting..." />
      </MeetingContainer>
    );
  }

  return (
    <MeetingContainer>
      <VideoArea id="zmmtg-root">
        <ControlBar>
          <ControlButton
            type={isVideoOn ? 'primary' : 'default'}
            icon={<VideoCameraOutlined />}
            onClick={toggleVideo}
          />
          <ControlButton
            type={!isMuted ? 'primary' : 'default'}
            icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
            onClick={toggleAudio}
          />
          <ControlButton
            type={isScreenSharing ? 'primary' : 'default'}
            icon={<DesktopOutlined />}
            onClick={toggleScreenShare}
          />
          <Button type="primary" danger onClick={endMeeting}>
            End Meeting
          </Button>
        </ControlBar>
      </VideoArea>

      <ParticipantCard title="Meeting Information">
        <p><strong>Meeting ID:</strong> {meetingDetails?.id}</p>
        <p><strong>Password:</strong> {meetingDetails?.password}</p>
        <p>
          <strong>Join URL:</strong>{' '}
          <a href={meetingDetails?.joinUrl} target="_blank" rel="noopener noreferrer">
            Click here to join in browser
          </a>
        </p>
      </ParticipantCard>
    </MeetingContainer>
  );
};

export default ZoomMeeting; 