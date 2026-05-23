import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './components/layout/MainLayout';
import EmployerLayout from './components/layout/EmployerLayout';

// Public pages
import Home from './pages/Home';
import Search from './pages/Search';
import LoginEmployer from './pages/LoginEmployer';
import LoginSeeker from './pages/LoginSeeker';
import RegisterSeeker from './pages/RegisterSeeker';
import RegisterEmployer from './pages/RegisterEmployer';
import ApplyWizard from './pages/ApplyWizard';
import Profile from './pages/Profile';

import JobDetails from './pages/JobDetails';
import CompanyDetails from './pages/CompanyDetails';

// Employer pages
import Dashboard from './pages/employer/Dashboard';
import CreateJob from './pages/employer/CreateJob';
import Pricing from './pages/employer/Pricing';
import History from './pages/employer/History';
import Applications from './pages/employer/Applications';

import ProtectedRoute from './components/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "947650809584-r48pbq5ni5ih7bocjh1qa2n983ohf7ct.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/company/:id" element={<CompanyDetails />} />
            <Route path="/login/employer" element={<LoginEmployer />} />
            <Route path="/login/seeker" element={<LoginSeeker />} />
            <Route path="/register/seeker" element={<RegisterSeeker />} />
            <Route path="/register/employer" element={<RegisterEmployer />} />
            <Route path="/apply/:jobId" element={
              <ProtectedRoute requiredRole="seeker">
                <ApplyWizard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="seeker">
                <Profile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Employer Routes */}
          <Route path="/employer" element={
            <ProtectedRoute requiredRole="employer">
              <EmployerLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-job" element={<CreateJob />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="history" element={<History />} />
            <Route path="applications/:jobId" element={<Applications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
