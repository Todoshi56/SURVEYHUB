import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddEditProduct = () => {
  const [form, setForm] = useState({ name: '', description: '', category: '' });
  const [existingImage, setExistingImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
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
            setExistingImage(product.image || '');
          }
        } catch (err) {
          setError('Failed to load product details.');
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description);
      payload.append('category', form.category);
      if (imageFile) payload.append('image', imageFile);
      if (isEditing && removeImage && !imageFile) payload.append('removeImage', 'true');

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (isEditing) {
        await axios.put(`/api/products/${id}`, payload, config);
      } else {
        await axios.post('/api/products', payload, config);
      }
      navigate('/company/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const previewSrc = imagePreview || (!removeImage && existingImage) || '';

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
          <div className="form-group">
            <label>Product Image</label>
            {previewSrc && (
              <div className="image-preview">
                <img src={previewSrc} alt="Product preview" />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleClearImage}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleFileChange}
            />
            <p className="field-hint">PNG, JPG, GIF, or WEBP — up to 5 MB.</p>
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
