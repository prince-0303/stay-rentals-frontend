import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePushNotifications } from './hooks/usePushNotifications';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/common/Navbar';

// Auth Pages
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import MFAVerify from './pages/auth/MFAVerify';
import VerifyEmail from './pages/auth/VerifyEmail';
import AuthCallback from './pages/auth/AuthCallback';
import KYCSubmit from './pages/auth/KYCSubmit';
import ChangePassword from './pages/auth/ChangePassword';

// App Pages
import Home from './pages/user/HomePage';
import BrowseListings from './pages/user/BrowsePage';
import PropertyDetail from './pages/property/PropertyDetailPage';
import RecommendationsPage from './pages/user/RecommendationsPage';
import ComparePage from './pages/user/ComparePage';
import WishlistPage from './pages/user/WishlistPage';
import Dashboard from './pages/user/Dashboard';

// Lister Pages
import MyListings from './pages/lister/MyListings';
import CreateProperty from './pages/lister/CreateProperty';
import EditProperty from './pages/lister/EditProperty';
import EarningsDashboard from './pages/lister/EarningsDashboard';

// Misc
import ChatWidget from './components/chatbot/ChatbotWidget';
import { ProtectedRoute, ListerRoute, ConsumerRoute } from './components/ProtectedRoute';

// Chat Page
import ChatPage from './pages/chat/ChatPage';
import ListerDashboard from './pages/lister/ListerDashboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppContent = () => {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/mfa-verify'];
  const shouldHideNav = hideNavPaths.includes(location.pathname) || location.pathname.startsWith('/auth/callback');

  return (
    <div className="flex flex-col min-h-screen relative">
      {!shouldHideNav && <Navbar />}

      <div className="flex-1 flex flex-col items-stretch w-full">
        <Routes>
          {/* ── Public / Auth Routes ─────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/mfa-verify" element={<MFAVerify />} />

          {/* ── Protected: any logged-in user ────────────────────── */}
          <Route path="/" element={<ConsumerRoute><Home /></ConsumerRoute>} />
          <Route path="/listings" element={<ConsumerRoute><BrowseListings /></ConsumerRoute>} />
          <Route path="/listings/:id" element={<ConsumerRoute><PropertyDetail /></ConsumerRoute>} />
          <Route path="/recommendations" element={<ConsumerRoute><RecommendationsPage /></ConsumerRoute>} />
          <Route path="/compare" element={<ConsumerRoute><ComparePage /></ConsumerRoute>} />
          <Route path="/wishlist" element={<ConsumerRoute><WishlistPage /></ConsumerRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/kyc-submit" element={<ProtectedRoute><KYCSubmit /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ChatPage />} />

          {/* ── Lister-only Routes ───────────────────────────────── */}
          <Route path="/lister/dashboard" element={<ListerRoute><ListerDashboard /></ListerRoute>} />
          <Route path="/dashboard/earnings" element={<ListerRoute><EarningsDashboard /></ListerRoute>} />
          <Route path="/lister/dashboard/earnings" element={<ListerRoute><EarningsDashboard /></ListerRoute>} />
          <Route path="/my-listings" element={<ListerRoute><MyListings /></ListerRoute>} />
          <Route path="/my-listings/create" element={<ListerRoute><CreateProperty /></ListerRoute>} />
          <Route path="/my-listings/edit/:id" element={<ListerRoute><EditProperty /></ListerRoute>} />

          {/* ── Catch-all ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Floating chat widget — visible on all pages */}
      <ChatWidget />
    </div>
  );
};

function App() {
  usePushNotifications();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;