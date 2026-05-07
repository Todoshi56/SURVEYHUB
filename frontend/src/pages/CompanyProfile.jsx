import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CompanyProfile = () => {
  const [form, setForm] = useState({
    companyName: '',
    description: '',
    industry: '',
    website: '',
    phone: ''
  });
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/company/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setForm({
          companyName: data.companyName || '',
          description: data.description || '',
          industry: data.industry || '',
          website: data.website || '',
          phone: data.phone || ''
        });
        setRating({
          average: data.movementRatingAverage || 0,
          count: data.movementRatingCount || 0
        });
      } catch (err) {
        // 404 means no profile yet — that's fine, user will create one
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/company/profile', form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      login({ ...user, companyId: data._id, companyName: data.companyName });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2>Company Profile</h2>
        <p className="form-subtitle">This information represents your company on the platform.</p>
        {rating.count > 0 && (
          <div className="company-rating-summary">
            Movement rating: {rating.average.toFixed(1)} / 5 ({rating.count} review{rating.count > 1 ? 's' : ''})
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name <span className="required">*</span></label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Your company name"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what your company does"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="e.g. Technology, Retail, Healthcare, Education"
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="form-group">
            <label>Company Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Public contact number for your company"
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
