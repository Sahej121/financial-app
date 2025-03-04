import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { getProfile } from './redux/slices/userSlice';
import { setupAxiosDefaults } from './services/authService';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import CASelection from './pages/CASelection';
import CreditCard from './pages/CreditCard';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './pages/Profile';
import CARegister from './components/auth/CARegister';

const { Content } = Layout;

// Initialize axios defaults
setupAxiosDefaults();

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getProfile())
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Router>
      <Layout className="layout">
        <Navbar />
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ca-register" element={<CARegister />} />
            
            {/* Protected Routes */}
            <Route
              path="/ca-selection"
              element={
                <PrivateRoute>
                  <CASelection />
                </PrivateRoute>
              }
            />
            <Route path="/credit-card" element={<CreditCard />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App; 