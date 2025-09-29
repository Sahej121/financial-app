import React, { useState, useEffect } from 'react';
import { auth, testConnection } from '../../services/robustApi';

const RobustLogin = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // Test server connection on component mount
    testServerConnection();
  }, []);

  const testServerConnection = async () => {
    try {
      setServerStatus('checking');
      const isConnected = await testConnection();
      setServerStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting login...');
      const result = await auth.login(formData);
      
      if (result.success) {
        console.log('✅ Login successful');
        onLoginSuccess(result.data.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR') {
        setError('Network connection failed. Please check your internet connection and try again.');
        setServerStatus('disconnected');
      } else if (error.code === 'TIMEOUT_ERROR') {
        setError('Request timed out. Please try again.');
      } else if (error.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    testServerConnection();
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to Financial App</h2>
        
        {/* Server Status Indicator */}
        <div className={`server-status ${serverStatus}`}>
          {serverStatus === 'checking' && '🔄 Checking server connection...'}
          {serverStatus === 'connected' && '✅ Server connected'}
          {serverStatus === 'disconnected' && (
            <div>
              <span>❌ Server disconnected</span>
              <button onClick={handleRetryConnection} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading || serverStatus === 'disconnected'}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading || serverStatus === 'disconnected'}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || serverStatus === 'disconnected'}
            className="login-button"
          >
            {loading ? '🔄 Logging in...' : 'Login'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="link-button"
            >
              Register here
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-form {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .login-form h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .server-status {
          padding: 0.5rem;
          border-radius: 5px;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .server-status.checking {
          background: #fff3cd;
          color: #856404;
        }

        .server-status.connected {
          background: #d4edda;
          color: #155724;
        }

        .server-status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }

        .retry-btn {
          margin-left: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 5px;
          margin-bottom: 1rem;
          border: 1px solid #f5c6cb;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .login-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .login-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .form-footer {
          text-align: center;
          margin-top: 1rem;
        }

        .link-button {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
        }

        .link-button:hover {
          color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default RobustLogin;
