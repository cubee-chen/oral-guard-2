// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DentistDashboard from './pages/DentistDashboard';
import AddNewPatient from './pages/AddNewPatient';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientProfile from './pages/PatientProfile';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navbar from './components/common/Navbar';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
    return user.role === 'dentist' 
      ? <Navigate to="/dentist/dashboard" replace />
      : <Navigate to="/patient/dashboard" replace />;
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
      
      {/* Dentist Routes */}
      <Route 
        path="/dentist/dashboard" 
        element={
          <ProtectedRoute requiredRole="dentist">
            <DentistDashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/dentist/patients/:patientId"
        element={
          <ProtectedRoute requiredRole="dentist">
            <PatientDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/dentist/add-new-patient'
        element={
          <ProtectedRoute requiredRole="dentist">
            <AddNewPatient />
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
      <Route 
        path="/patient/upload" 
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientUpload />
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