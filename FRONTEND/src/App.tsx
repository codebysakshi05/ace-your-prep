import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import { AppLayout } from './layout/AppLayout';
import { AuthLayout } from './layout/AuthLayout';
import { MainLayout } from './layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Toaster } from 'react-hot-toast';
import { Chatbot } from './components/Chatbot';

// Pages
import { Home } from './pages/Home';
import { PublicProfile } from './pages/portfolio/PublicProfile';
import { Login } from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Aptitude } from './pages/modules/Aptitude';
import { GroupDiscussion } from './pages/modules/GroupDiscussion';
import { Communication } from './pages/modules/Communication';
import { Interview } from './pages/modules/Interview';
import { ExecutiveInterview } from './pages/modules/ExecutiveInterview';
import { MissionRoom } from './pages/modules/MissionRoom';
import { Roadmap } from './pages/roadmap/Roadmap';
import { Leaderboard } from './pages/leaderboard/Leaderboard';
import { ResumeBuilder } from './pages/resume/ResumeBuilder';
import { SmartInsights } from './pages/insights/SmartInsights';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { UserDirectory } from './pages/admin/UserDirectory';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PracticeHub } from './pages/modules/PracticeHub';
import About from './pages/static/About';
import Contact from './pages/static/Contact';
import PrivacyPolicy from './pages/static/PrivacyPolicy';
import Support from './pages/static/Support';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
            }}
          />
          {/* Render Chatbot Globally */}
          <Chatbot />
        
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />

          {/* Public Portfolio Route */}
          <Route path="/p/:userId" element={<AppLayout><PublicProfile /></AppLayout>} />

          {/* Authentication Routes */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />

          {/* Main Application Routes (Protected via AuthContext) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aptitude" element={<Aptitude />} />
              <Route path="/gd-practice" element={<GroupDiscussion />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/interview-pro" element={<ExecutiveInterview />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/mission-room" element={<MissionRoom />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/insights" element={<SmartInsights />} />
              <Route path="/practice" element={<PracticeHub />} />
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/users" element={<UserDirectory />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
