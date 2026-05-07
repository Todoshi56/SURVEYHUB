import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReportButton from '../components/ReportButton';

const SampleRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await axios.get('/api/sample-requests/company', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRequests(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sample requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      const { data } = await axios.patch(`/api/sample-requests/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: data.status } : r)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Sample Requests</h2>
        <Link to="/dashboard" className="btn btn-secondary">← Back</Link>
      </div>
      <p className="page-subtitle">
        Companies and customers who have requested samples of your products.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📨</div>
          <h3>No Sample Requests Yet</h3>
          <p>When a company or customer requests a sample, it will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Requester</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="cell-with-image">
                      {r.product?.image ? (
                        <img src={r.product.image} alt={r.product.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb product-thumb-empty">—</div>
                      )}
                      <strong>{r.product?.name || 'Unknown product'}</strong>
                    </div>
                  </td>
                  <td>
                    <div>{r.requesterName}</div>
                    <div className="cell-meta">
                      {r.requester?.role === 'company' ? 'Company' : 'Customer'} · {r.requester?.name}
                    </div>
                  </td>
                  <td>
                    <div>{r.requester?.email}</div>
                    <div className="cell-meta">{r.requester?.phone || '—'}</div>
                  </td>
                  <td>{r.message || <span className="text-muted">—</span>}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    {r.status === 'pending' ? (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateStatus(r._id, 'approved')}
                          disabled={updatingId === r._id}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(r._id, 'declined')}
                          disabled={updatingId === r._id}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateStatus(r._id, 'pending')}
                        disabled={updatingId === r._id}
                      >
                        Reset
                      </button>
                    )}
                    <ReportButton
                      targetUserId={r.requester?._id}
                      targetLabel={r.requesterName || 'this requester'}
                    />
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

export default SampleRequests;
