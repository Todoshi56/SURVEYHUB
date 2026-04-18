import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'customer') {
    return (
      <div className="page-container">
        <div className="dashboard-header">
          <h1>Welcome, {user.name}!</h1>
          <p>You are logged in as a Customer. Survey browsing and submission features are coming in the next phase.</p>
        </div>
        <div className="info-box">
          <p>Stay tuned — you will be able to browse and respond to product surveys here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Manage your company, products, and surveys from your dashboard.</p>
      </div>
      <div className="dashboard-cards">
        <Link to="/company/profile" className="dashboard-card">
          <div className="card-icon">🏢</div>
          <h3>Company Profile</h3>
          <p>Set up your company information, industry, and website</p>
        </Link>
        <Link to="/company/products" className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Products</h3>
          <p>Add and manage the products you want feedback on</p>
        </Link>
        <Link to="/company/surveys" className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Surveys</h3>
          <p>Create surveys with multiple question types for your products</p>
        </Link>
      </div>
    </div>
  );
};

export default CompanyDashboard;
