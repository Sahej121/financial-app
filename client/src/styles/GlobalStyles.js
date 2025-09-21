import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    transition: all 0.3s ease;
  }

  body.dark-theme {
    background: #0A0A0A;
    color: rgba(255, 255, 255, 0.9);
  }

  body.light-theme {
    background: #f5f5f5;
    color: #000000;
  }

  * {
    box-sizing: border-box;
  }

  .ant-layout {
    background: transparent;
  }

  .dark-theme .ant-layout {
    background: #0A0A0A;
  }

  .light-theme .ant-layout {
    background: #ffffff;
  }

  .ant-btn {
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .dark-theme .ant-btn {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }

  .light-theme .ant-btn {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.8);
    color: #000000;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.3);
      color: #667eea;
    }
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;

    &:hover, &:focus {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.07);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .light-theme .ant-input {
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #000000;

    &:hover, &:focus {
      border-color: rgba(0, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.04);
    }

    &::placeholder {
      color: rgba(0, 0, 0, 0.4);
    }
  }  .ant-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .ant-card-head {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ant-card-head-title {
      color: white;
    }
  }

  .light-theme .ant-card {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);

    .ant-card-head {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .ant-card-head-title {
      color: #000000;
    }
  }  .light-theme .ant-typography {
    color: rgba(0, 0, 0, 0.85);
  }
  .ant-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .ant-card-head {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ant-card-head-title {
      color: white;
  .ant-modal {
    .ant-modal-content {
      background: #141414;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ant-modal-header {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ant-modal-title {
      color: white;
    }

    .ant-modal-close {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .light-theme .ant-modal {
    .ant-modal-content {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .ant-modal-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .ant-modal-title {
      color: #000000;
    }

    .ant-modal-close {
      color: rgba(0, 0, 0, 0.5);
    }
  }      color: rgba(255, 255, 255, 0.5);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;

export default GlobalStyles;       transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;

export default GlobalStyles; 