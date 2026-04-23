import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Products</h2>
        <Link to="/company/products/add" className="btn btn-primary">+ Add Product</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products Yet</h3>
          <p>Add your first product to start creating surveys for it.</p>
          <Link to="/company/products/add" className="btn btn-primary">Add Product</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={p._id}>
                  <td>{index + 1}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category || <span className="text-muted">—</span>}</td>
                  <td>{p.description || <span className="text-muted">—</span>}</td>
                  <td className="action-cell">
                    <Link to={`/company/products/edit/${p._id}`} className="btn btn-sm btn-secondary">Edit</Link>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
