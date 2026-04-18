import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CompanyProfile = () => {
  const [form, setForm] = useState({
    companyName: '',
    description: '',
    industry: '',
    website: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

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
          website: data.website || ''
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
    setMessage('');
    try {
      await axios.post('/api/company/profile', form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage('Company profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2>Company Profile</h2>
        <p className="form-subtitle">This information represents your company on the platform.</p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
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
          <button type="submit" className="btn btn-primary">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
