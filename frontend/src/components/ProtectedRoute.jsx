import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const allowed = roles || (role ? [role] : null);
  if (allowed && !allowed.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};

export default ProtectedRoute;
