import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import './index.css';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN || "sentry_dsn_placeholder",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
); 