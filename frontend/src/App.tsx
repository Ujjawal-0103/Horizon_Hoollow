import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { TopicSelectionPage } from './pages/TopicSelectionPage';
import { DiagnosticSessionPage } from './pages/DiagnosticSessionPage';
import { LearningXRayPage } from './pages/LearningXRayPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PrivacyNoticePage } from './pages/PrivacyNoticePage';
import { 
  InterventionPage, 
  ReassessmentPage, 
  HistoryPage, 
  LearnFromScratchPlaceholderPage 
} from './pages/PlaceholderPages';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              
              {/* Public Routes (Sections 12, 14, 15, 24) */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="privacy" element={<PrivacyNoticePage />} />

              {/* Protected Student Routes (Section 33) */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfileSetupPage />} />
                <Route path="learn" element={<TopicSelectionPage />} />
                <Route path="learn/from-scratch" element={<LearnFromScratchPlaceholderPage />} />
                <Route path="diagnostic" element={<DiagnosticSessionPage />} />
                <Route path="diagnostic/:sessionId" element={<DiagnosticSessionPage />} />
                <Route path="learning-xray" element={<LearningXRayPage />} />
                <Route path="intervention" element={<InterventionPage />} />
                <Route path="reassessment" element={<ReassessmentPage />} />
                <Route path="history" element={<HistoryPage />} />
              </Route>

              {/* Wildcard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
