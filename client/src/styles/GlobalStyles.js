import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #0A0A0A;
    color: rgba(255, 255, 255, 0.9);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  .ant-layout {
    background: #0A0A0A;
  }

  .ant-btn {
    border-radius: 24px;
    font-weight: 500;
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;

    &:hover, &:focus {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.07);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .ant-typography {
    color: rgba(255, 255, 255, 0.9);
  }

  .ant-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;

    .ant-card-head {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .ant-card-head-title {
      color: white;
    }
  }

  .ant-modal {
    .ant-modal-content {
      background: #1A1A1A;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ant-modal-header {
      background: transparent;
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .ant-modal-title {
      color: white;
    }

    .ant-modal-close {
      color: rgba(255, 255, 255, 0.5);
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

export default GlobalStyles; 