import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Layout, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const gradientAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const AuthContainer = styled(Layout)`
  min-height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Animated Mesh Background */
  background: 
    radial-gradient(circle at 10% 20%, rgba(0, 176, 240, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(242, 200, 17, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(114, 46, 209, 0.05) 0%, transparent 60%);
  background-size: 150% 150%;
  animation: ${gradientAnim} 20s ease infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
    pointer-events: none;
  }
`;

const GlassCard = styled.div`
  width: 100%;
  max-width: ${props => props.width || '480px'};
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 48px;
  position: relative;
  z-index: 2;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  animation: ${float} 8s ease-in-out infinite;

  @media (max-width: 576px) {
    padding: 32px 24px;
    border-radius: 24px;
    margin: 20px;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  text-decoration: none;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00B0F0, #0077F0);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    box-shadow: 0 8px 20px rgba(0, 176, 240, 0.3);
  }

  h2 {
    color: white;
    margin: 0;
    font-weight: 800;
    font-size: 24px;
    letter-spacing: -0.5px;
  }
`;

const AuthLayout = ({ children, title, subtitle, width }) => {
    return (
        <AuthContainer>
            <GlassCard width={width}>
                <LogoContainer to="/">
                    <div className="icon-wrapper">
                        <ThunderboltOutlined />
                    </div>
                    <h2>CreditLeliya</h2>
                </LogoContainer>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ color: 'white', marginBottom: 8, fontSize: '2rem', fontWeight: 700 }}>
                        {title}
                    </Title>
                    {subtitle && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {children}
            </GlassCard>
        </AuthContainer>
    );
};

export default AuthLayout;
