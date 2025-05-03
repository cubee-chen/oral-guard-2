// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import FacilityDashboard from './pages/FacilityDashboard';
import AddWorker from './pages/AddWorker';
import WorkerDashboard from './pages/WorkerDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientProfile from './pages/PatientProfile';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navbar from './components/common/Navbar';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WorkerDetailsPage from './pages/WorkerDetailsPage';
import AddPatient from './pages/AddPatient';
import PatientDashboard from './pages/PatientDashboard';
import './styles/index.css';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user role
    if (user.role === 'facility') {
      return <Navigate to="/facility/dashboard" replace />;
    } else if (user.role === 'worker') {
      return <Navigate to="/worker/dashboard" replace />;
    } else if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else {
      // Default fallback
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Facility Routes */}
      <Route 
        path="/facility/dashboard" 
        element={
          <ProtectedRoute requiredRole="facility">
            <FacilityDashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/facility/workers/:workerId"
        element={
          <ProtectedRoute requiredRole="facility">
            <WorkerDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/facility/add-worker'
        element={
          <ProtectedRoute requiredRole="facility">
            <AddWorker />
          </ProtectedRoute>
        }
      />
      <Route
        path='/facility/workers/:workerId/add-patient'
        element={
          <ProtectedRoute requiredRole="facility">
            <AddPatient />
          </ProtectedRoute>
        }
      />
      
      {/* Worker Routes */}
      <Route 
        path="/worker/dashboard" 
        element={
          <ProtectedRoute requiredRole="worker">
            <WorkerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/worker/patients/:patientId"
        element={
          <ProtectedRoute requiredRole="worker">
            <PatientDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/worker/patients/:patientId/upload" 
        element={
          <ProtectedRoute requiredRole="worker">
            <PatientUpload />
          </ProtectedRoute>
        } 
      />
      
      {/* Patient Routes */}
      <Route 
        path="/patient/dashboard" 
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path='/patient/profile'
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;