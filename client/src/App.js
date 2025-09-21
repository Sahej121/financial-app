import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { getProfile } from './redux/slices/userSlice';
import { setupAxiosDefaults } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import UserDashboard from './components/dashboards/UserDashboard';
import CADashboard from './components/dashboards/CADashboard';
import FinancialPlannerDashboard from './components/dashboards/FinancialPlannerDashboard';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import CreditCard from './pages/CreditCard';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CARegister from './components/auth/CARegister';
import FinancialPlanning from './pages/FInancialPlanning';
import CASelectionPage from './pages/CASelectionPage';
import styled from 'styled-components';

const { Content } = Layout;

// Initialize axios defaults
setupAxiosDefaults();

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const MainContent = styled(Content)`
  padding-top: 64px; // Height of the fixed navbar
`;

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
    <ThemeProvider>
      <Router>
        <StyledLayout>
          <Navbar />
          <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ca-register" element={<CARegister />} />
            
            {/* Public Routes */}
            <Route path="/ca-selection" element={<CASelectionPage />} />
            <Route path="/credit-card" element={<CreditCard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/planning" element={<FinancialPlanning />} />

            {/* Dashboard Routes - Role-based */}
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['user', 'admin']}>
                  <UserDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/ca-dashboard"
              element={
                <RoleBasedRoute allowedRoles={['ca']}>
                  <CADashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/financial-planner-dashboard"
              element={
                <RoleBasedRoute allowedRoles={['financial_planner']}>
                  <FinancialPlannerDashboard />
                </RoleBasedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
          </MainContent>
        </StyledLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
