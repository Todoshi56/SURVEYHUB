import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import Surveys from './pages/Surveys';
import CreateEditSurvey from './pages/CreateEditSurvey';
import SurveysBrowse from './pages/SurveysBrowse';
import SurveyDetail from './pages/SurveyDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><CompanyDashboard /></ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute><ChangePassword /></ProtectedRoute>
            } />

            {/* Company routes */}
            <Route path="/company/profile" element={
              <ProtectedRoute role="company"><CompanyProfile /></ProtectedRoute>
            } />
            <Route path="/company/products" element={
              <ProtectedRoute role="company"><Products /></ProtectedRoute>
            } />
            <Route path="/company/products/add" element={
              <ProtectedRoute role="company"><AddEditProduct /></ProtectedRoute>
            } />
            <Route path="/company/products/edit/:id" element={
              <ProtectedRoute role="company"><AddEditProduct /></ProtectedRoute>
            } />
            <Route path="/company/surveys" element={
              <ProtectedRoute role="company"><Surveys /></ProtectedRoute>
            } />
            <Route path="/company/surveys/create" element={
              <ProtectedRoute role="company"><CreateEditSurvey /></ProtectedRoute>
            } />
            <Route path="/company/surveys/edit/:id" element={
              <ProtectedRoute role="company"><CreateEditSurvey /></ProtectedRoute>
            } />

            {/* Customer routes */}
            <Route path="/surveys" element={
              <ProtectedRoute><SurveysBrowse /></ProtectedRoute>
            } />
            <Route path="/survey/:id" element={
              <ProtectedRoute><SurveyDetail /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
