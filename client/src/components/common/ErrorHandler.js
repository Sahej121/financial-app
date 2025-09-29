import React, { useState, useEffect } from 'react';
import { testConnection } from '../services/robustApi';

const ErrorHandler = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test server connection on mount
    testServerConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testServerConnection = async () => {
    try {
      const isConnected = await testConnection();
      setServerStatus(isConnected ? 'connected' : 'disconnected');
      setShowError(!isConnected);
    } catch (error) {
      setServerStatus('disconnected');
      setShowError(true);
    }
  };

  const handleRetry = () => {
    setShowError(false);
    testServerConnection();
  };

  if (!isOnline) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>🔌 No Internet Connection</h2>
          <p>Please check your internet connection and try again.</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showError && serverStatus === 'disconnected') {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>🚫 Server Connection Failed</h2>
          <p>Unable to connect to the server. Please try again later.</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              Retry Connection
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-message">
            <h2>⚠️ Something went wrong</h2>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;
