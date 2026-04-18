import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddEditProduct = () => {
  const [form, setForm] = useState({ name: '', description: '', category: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get('/api/products', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const product = data.find((p) => p._id === id);
          if (product) {
            setForm({
              name: product.name,
              description: product.description || '',
              category: product.category || ''
            });
          }
        } catch (err) {
          setError('Failed to load product details.');
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        await axios.put(`/api/products/${id}`, form, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('/api/products', form, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      navigate('/company/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <p className="form-subtitle">
          {isEditing ? 'Update your product details below.' : 'Fill in the details for your new product.'}
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Electronics, Software, Food & Beverage"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the product"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
            <Link to="/company/products" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
