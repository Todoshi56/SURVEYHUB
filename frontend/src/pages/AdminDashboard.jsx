import { useEffect, useState, useMemo } from 'react';
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
  const [search, setSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

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
  }, [user]);

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

  const getAuthHeaders = () => ({ Authorization: `Bearer ${user.token}` });

  const filteredReports = useMemo(() => {
    return reports.filter((r) => reportStatus === 'all' || r.status === reportStatus);
  }, [reports, reportStatus]);

  const filteredSurveys = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return surveys;
    return surveys.filter((s) => (
      s.title?.toLowerCase().includes(query) ||
      s.company?.companyName?.toLowerCase().includes(query) ||
      s.product?.name?.toLowerCase().includes(query)
    ));
  }, [search, surveys]);

  const handleDeleteSurvey = async (survey) => {
    if (!window.confirm(`⚠️ DELETE SURVEY\n\nTitle: "${survey.title}"\nCompany: "${survey.company?.companyName || 'Unknown'}"\nThis action cannot be undone.`)) return;

    setDeletingId(survey._id);
    setError('');
    try {
      await axios.delete(`/api/surveys/${survey._id}`, {
        headers: getAuthHeaders()
      });
      setSurveys((prev) => prev.filter((item) => item._id !== survey._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete survey.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage reports and survey responses across the platform.</p>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-value">{filteredReports.filter((r) => r.status === 'open').length}</div>
          <div className="metric-label">Open reports</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{surveys.filter((s) => s.isActive).length}</div>
          <div className="metric-label">Active surveys</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{surveys.length}</div>
          <div className="metric-label">Total surveys</div>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label htmlFor="surveySearch">Search surveys</label>
          <input
            id="surveySearch"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or product"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="reportStatus">Report status</label>
          <select
            id="reportStatus"
            value={reportStatus}
            onChange={(e) => setReportStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <>
          <div className="form-card">
            <h3>User Reports ({reports.length})</h3>
            {filteredReports.length === 0 ? (
              <p className="empty-text">
                {reports.length === 0 ? 'No reports submitted yet.' : 'No reports match the selected status.'}
              </p>
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
            {filteredSurveys.length === 0 ? (
              <p className="empty-text">
                {surveys.length === 0 ? 'No surveys exist.' : 'No surveys match your search.'}
              </p>
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
                    {filteredSurveys.map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.title}</strong></td>
                        <td>{s.company?.companyName || '—'}</td>
                        <td>{s.product?.name || '—'}</td>
                        <td>{s.questions?.length || 0}</td>
                        <td className="action-cell">
                          <Link to={`/admin/surveys/${s._id}/responses`} className="btn btn-sm btn-primary">
                            View / Delete Responses
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteSurvey(s)}
                            disabled={deletingId === s._id}
                          >
                            {deletingId === s._id ? 'Deleting…' : 'Delete'}
                          </button>
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
