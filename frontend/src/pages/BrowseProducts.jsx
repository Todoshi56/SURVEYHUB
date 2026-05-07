import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReportButton from '../components/ReportButton';

const BrowseProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const productSearchKey = 'surveyhub_product_search_history';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [productsRes, requestsRes] = await Promise.all([
          axios.get('/api/products/browse', { headers }),
          axios.get('/api/sample-requests/mine', { headers })
        ]);
        setProducts(productsRes.data);
        setRequestedIds(new Set(requestsRes.data.map((r) => r.product?._id).filter(Boolean)));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem(productSearchKey);
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch {
        localStorage.removeItem(productSearchKey);
      }
    }
  }, []);

  const saveProductSearch = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const nextHistory = [trimmed, ...searchHistory.filter((item) => item !== trimmed)].slice(0, 10);
    localStorage.setItem(productSearchKey, JSON.stringify(nextHistory));
    setSearchHistory(nextHistory);
  };

  const clearProductSearchHistory = () => {
    localStorage.removeItem(productSearchKey);
    setSearchHistory([]);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => {
      const productText = `${p.name || ''} ${p.company?.companyName || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      return productText.includes(query);
    });
  }, [products, search]);

  const handleProductSearch = (e) => {
    e.preventDefault();
    saveProductSearch(search);
  };

  const handleSelectProductSearch = (value) => {
    setSearch(value);
    saveProductSearch(value);
  };

  const isOwnProduct = (product) => {
    if (user?.role !== 'company' || !user?.companyId) return false;
    const productCompanyId = product.company?._id || product.company;
    return productCompanyId && String(productCompanyId) === String(user.companyId);
  };

  const openRequest = (product) => {
    setActiveProduct(product);
    setMessage('');
    setFeedback('');
  };

  const closeRequest = () => {
    setActiveProduct(null);
    setMessage('');
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/sample-requests', {
        productId: activeProduct._id,
        message
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequestedIds((prev) => new Set(prev).add(activeProduct._id));
      setFeedback('Sample request sent — the company will review it.');
      setActiveProduct(null);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Products</h2>
      </div>
      <p className="page-subtitle">
        Request a sample of any product. Once the company approves your request, you can take their survey.
      </p>

      <form className="search-bar" onSubmit={handleProductSearch}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, company, category, or description"
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {searchHistory.length > 0 && (
        <div className="search-history-card">
          <div className="search-history-header">
            <span>Recent product searches</span>
            <button type="button" className="link-button" onClick={clearProductSearchHistory}>
              Clear history
            </button>
          </div>
          <div className="search-history-list">
            {searchHistory.map((item) => (
              <button
                key={item}
                type="button"
                className="search-history-item"
                onClick={() => handleSelectProductSearch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {feedback && <div className="alert alert-success">{feedback}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>{search ? 'No matching products' : 'No Products Yet'}</h3>
          <p>
            {search
              ? 'Try a different term or clear your search to see more products.'
              : 'Check back soon — companies are still adding their products.'}
          </p>
        </div>
      ) : (
        <div className="surveys-grid">
          {filteredProducts.map((p) => {
            const alreadyRequested = requestedIds.has(p._id);
            const ownProduct = isOwnProduct(p);
            return (
              <div key={p._id} className="survey-card">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="survey-card-image" />
                ) : (
                  <div className="survey-card-image survey-card-image-empty"><span>📦</span></div>
                )}
                <h3>{p.name}</h3>
                <p className="company-name">{p.company?.companyName || 'Unknown company'}</p>
                {p.category && <p className="product-name">Category: {p.category}</p>}
                {p.description && <p className="description">{p.description}</p>}
                <div className="card-actions">
                  {ownProduct ? (
                    <p className="field-hint">This is your own product.</p>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => openRequest(p)}
                      disabled={alreadyRequested}
                    >
                      {alreadyRequested ? 'Sample Requested' : 'Request Sample'}
                    </button>
                  )}
                  {!ownProduct && (
                    <ReportButton
                      targetUserId={p.company?.user}
                      targetLabel={`company "${p.company?.companyName || 'Unknown'}"`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeProduct && (
        <div className="modal-backdrop" onClick={closeRequest}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Request a sample of "{activeProduct.name}"</h3>
            <form onSubmit={submitRequest}>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the company why you'd like a sample..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeRequest}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProducts;
