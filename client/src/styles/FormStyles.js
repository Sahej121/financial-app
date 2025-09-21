import styled from 'styled-components';

// Global form styling components for consistency across the application

export const FormContainer = styled.div`
  .ant-form-item-label > label {
    font-weight: 600;
    color: #333;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .ant-input {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    &::placeholder {
      color: #bfbfbf;
      font-style: italic;
    }
  }

  .ant-input-password {
    .ant-input {
      border: none;
      box-shadow: none;
      height: auto;
    }
  }

  .ant-input-affix-wrapper {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    .ant-input {
      border: none;
      box-shadow: none;
      height: auto;
      padding: 0;
    }
  }

  .ant-select {
    .ant-select-selector {
      border-radius: 12px;
      border: 2px solid #e8f2ff;
      padding: 8px 12px;
      font-size: 16px;
      height: 48px;
      transition: all 0.3s ease;
      background: white;

      &:focus, &:hover {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      }
    }
  }

  .ant-upload {
    border: 2px dashed #d9d9d9;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    transition: all 0.3s ease;

    &:hover {
      border-color: #1890ff;
      background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
    }
  }

  .ant-form-item-explain-error {
    color: #ff4d4f;
    font-size: 14px;
    margin-top: 4px;
    font-weight: 500;
  }

  .ant-form-item-explain-success {
    color: #52c41a;
    font-size: 14px;
    margin-top: 4px;
    font-weight: 500;
  }
`;

// Base animated button component with shared styles
const BaseAnimatedButton = styled.button`
  border: none;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  background: ${props => props.gradient || 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'};
  box-shadow: ${props => props.shadow || '0 4px 15px rgba(24, 144, 255, 0.3)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: ${props => props.hoverGradient || 'linear-gradient(135deg, #096dd9 0%, #1890ff 100%)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.hoverShadow || '0 8px 25px rgba(24, 144, 255, 0.4)'};

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Primary button with blue gradient
export const PrimaryButton = styled(BaseAnimatedButton)`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    box-shadow: 0 8px 25px rgba(24, 144, 255, 0.4);
  }
`;

// Success button with green gradient
export const SuccessButton = styled(BaseAnimatedButton)`
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);

  &:hover {
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    box-shadow: 0 8px 25px rgba(82, 196, 26, 0.4);
  }
`;

// Warning button with orange gradient
export const WarningButton = styled(BaseAnimatedButton)`
  background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%);
  box-shadow: 0 4px 15px rgba(250, 140, 22, 0.3);

  &:hover {
    background: linear-gradient(135deg, #d46b08 0%, #fa8c16 100%);
    box-shadow: 0 8px 25px rgba(250, 140, 22, 0.4);
  }
`;

// Danger button with red gradient
export const DangerButton = styled(BaseAnimatedButton)`
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  box-shadow: 0 4px 15px rgba(255, 77, 79, 0.3);

  &:hover {
    background: linear-gradient(135deg, #cf1322 0%, #ff4d4f 100%);
    box-shadow: 0 8px 25px rgba(255, 77, 79, 0.4);
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  border: 2px solid #d9d9d9;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 32px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1890ff, #096dd9, #1890ff);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const FormSection = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  border: 1px solid rgba(24, 144, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #52c41a, #1890ff, #52c41a);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
`;

export const PageContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
`;

export const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 28px;
  font-weight: 700;
`;

export const FormDescription = styled.p`
  text-align: center;
  color: #666;
  font-size: 16px;
  margin-bottom: 32px;
  line-height: 1.6;
`;

// Animation keyframes
export const fadeInUp = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const slideInRight = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const pulse = `
  @keyframes pulse {
    0% {
      box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
    }
    50% {
      box-shadow: 0 4px 25px rgba(24, 144, 255, 0.5);
    }
    100% {
      box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
    }
  }
`;

// Global form animations
export const AnimatedFormItem = styled.div`
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0ms'};
`;

export const AnimatedButton = styled.button`
  animation: slideInRight 0.8s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0ms'};
`;
