import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = ({ user }) => (
  <div className="page-container">
    <div className="dashboard-header">
      <h1>Welcome, {user.name}!</h1>
      <p>Browse products or take surveys to share your feedback.</p>
    </div>
    <div className="dashboard-cards">
      <Link to="/surveys" className="dashboard-card">
        <div className="card-icon">📋</div>
        <h3>Surveys</h3>
        <p>Take surveys to share your feedback on products you've used.</p>
      </Link>
      <Link to="/products" className="dashboard-card">
        <div className="card-icon">📦</div>
        <h3>Products</h3>
        <p>Browse products and request a sample. After approval you can take the survey.</p>
      </Link>
    </div>
  </div>
);

const CompanyDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'customer') {
    return <CustomerDashboard user={user} />;
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
          <h3>My Products</h3>
          <p>Add and manage the products you want feedback on</p>
        </Link>
        <Link to="/company/surveys" className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>My Surveys</h3>
          <p>Create surveys with multiple question types for your products</p>
        </Link>
        <Link to="/company/sample-requests" className="dashboard-card">
          <div className="card-icon">📨</div>
          <h3>Sample Requests</h3>
          <p>See which companies and customers have requested your samples.</p>
        </Link>
        <Link to="/products" className="dashboard-card">
          <div className="card-icon">🛍️</div>
          <h3>Browse Products</h3>
          <p>See products from other companies and request samples.</p>
        </Link>
        <Link to="/surveys" className="dashboard-card">
          <div className="card-icon">📝</div>
          <h3>Take Surveys</h3>
          <p>Respond to surveys from other companies on the platform.</p>
        </Link>
      </div>
    </div>
  );
};

export default CompanyDashboard;
