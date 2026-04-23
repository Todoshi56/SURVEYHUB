import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/auth/register', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">SurveyHub</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us today — it's free</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a password (min. 6 characters)"
              required
            />
          </div>
          <div className="form-group">
            <label>I am registering as a:</label>
            <div className="role-selector">
              <label className={`role-option ${form.role === 'customer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={form.role === 'customer'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
                <span>Customer</span>
              </label>
              <label className={`role-option ${form.role === 'company' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="company"
                  checked={form.role === 'company'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
                <span>Company</span>
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Create Account</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
