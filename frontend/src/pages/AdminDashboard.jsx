import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [reportsRes, surveysRes] = await Promise.all([
          axios.get('/api/reports', { headers }),
          axios.get('/api/surveys', { headers })
        ]);
        setReports(reportsRes.data);
        setSurveys(surveysRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateReportStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      const { data } = await axios.patch(`/api/reports/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status: data.status } : r)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage reports and survey responses across the platform.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <>
          <div className="form-card">
            <h3>User Reports ({reports.length})</h3>
            {reports.length === 0 ? (
              <p className="empty-text">No reports submitted yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Target</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div>{r.reporter?.name}</div>
                          <div className="cell-meta">{r.reporter?.email} · {r.reporter?.role}</div>
                        </td>
                        <td>
                          <div>{r.target?.name} <span className="badge">{r.targetRole}</span></div>
                          <div className="cell-meta">{r.target?.email} · {r.target?.phone || '—'}</div>
                        </td>
                        <td>{r.reason}</td>
                        <td><span className={`badge badge-${r.status === 'open' ? 'pending' : r.status === 'resolved' ? 'approved' : 'declined'}`}>{r.status}</span></td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="action-cell">
                          {r.status === 'open' ? (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => updateReportStatus(r._id, 'resolved')}
                                disabled={updatingId === r._id}
                              >
                                Resolve
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => updateReportStatus(r._id, 'dismissed')}
                                disabled={updatingId === r._id}
                              >
                                Dismiss
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => updateReportStatus(r._id, 'open')}
                              disabled={updatingId === r._id}
                            >
                              Reopen
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="form-card">
            <h3>All Surveys ({surveys.length})</h3>
            {surveys.length === 0 ? (
              <p className="empty-text">No surveys exist.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Product</th>
                      <th>Questions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.title}</strong></td>
                        <td>{s.company?.companyName || '—'}</td>
                        <td>{s.product?.name || '—'}</td>
                        <td>{s.questions?.length || 0}</td>
                        <td className="action-cell">
                          <Link to={`/admin/surveys/${s._id}/responses`} className="btn btn-sm btn-primary">
                            View / Delete Responses
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
