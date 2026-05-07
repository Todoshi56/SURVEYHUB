import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ReportButton = ({ targetUserId, targetLabel, className = 'btn btn-sm btn-secondary' }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!user || user.role === 'admin') return null;
  if (!targetUserId || String(targetUserId) === String(user._id)) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('/api/reports', { targetUserId, reason }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFeedback('Report submitted. An admin will review it.');
      setReason('');
      setTimeout(() => { setOpen(false); setFeedback(''); }, 1500);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}>
        🚩 Report
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Report {targetLabel || 'user'}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>What's wrong? <span className="required">*</span></label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              {feedback && <div className={`alert alert-${feedback.startsWith('Report') ? 'success' : 'error'}`}>{feedback}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Submit Report'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
