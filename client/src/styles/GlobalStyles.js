import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #0A0A0A;
    color: rgba(255, 255, 255, 0.9);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  .ant-layout {
    background: #0A0A0A;
  }

  .ant-btn {
    border-radius: 20px;
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

  .ant-typography {
    color: rgba(255, 255, 255, 0.9);
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
    }
  }

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