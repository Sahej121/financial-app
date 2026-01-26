import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Spin, ConfigProvider, theme } from 'antd';
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
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './components/auth/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CARegister from './components/auth/CARegister';
import FinancialAnalystRegister from './components/auth/FinancialAnalystRegister';
import FinancialPlanning from './pages/FInancialPlanning';
import CASelectionPage from './pages/CASelectionPage';
import DocumentDashboard from './pages/DocumentDashboard';
import styled from 'styled-components';

const { Content } = Layout;

// Initialize axios defaults
setupAxiosDefaults();

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const MainContent = styled(Content)`
padding - top: 64px; // Height of the fixed navbar
`;

function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getProfile());
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
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#00B0F0',
            colorBgBase: '#000000',
            colorBgContainer: '#141414',
            borderRadius: 8,
            fontFamily: "'Inter', sans-serif",
            colorTextHeading: '#FFFFFF',
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextLightSolid: '#FFFFFF', // Ensures white text on primary buttons
          },
          components: {
            Button: {
              controlHeight: 45,
              borderRadius: 12,
              primaryShadow: '0 4px 14px 0 rgba(0, 176, 240, 0.3)',
            },
            Card: {
              colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
            },
            Input: {
              controlHeight: 45,
              borderRadius: 12,
              colorBgContainer: '#0A0A0A', // Consistent with --bg-secondary
              colorBorder: 'rgba(255, 255, 255, 0.08)',
              activeBorderColor: '#00B0F0',
            },
            Select: {
              controlHeight: 45,
              borderRadius: 12,
              colorBgContainer: '#0A0A0A',
              colorBorder: 'rgba(255, 255, 255, 0.08)',
            }
          }
        }}
      >
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
                <Route path="/ca-register" element={<CARegister />} />
                <Route path="/analyst-register" element={<FinancialAnalystRegister />} />

                {/* Public Routes */}
                <Route path="/ca-selection" element={<CASelectionPage />} />
                <Route path="/credit-card" element={<CreditCard />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
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

                {/* AI Document Dashboard */}
                <Route
                  path="/documents"
                  element={
                    <PrivateRoute>
                      <DocumentDashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </MainContent>
          </StyledLayout>
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
