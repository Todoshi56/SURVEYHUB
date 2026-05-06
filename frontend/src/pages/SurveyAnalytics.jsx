import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('; ') : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const formatAnswer = (answer) => {
  if (answer === null || answer === undefined) return '—';
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
};

const SurveyAnalytics = () => {
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [responsesData, setResponsesData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [analyticsRes, responsesRes] = await Promise.all([
          axios.get(`/api/responses/analytics/${surveyId}`, { headers }),
          axios.get(`/api/responses/survey/${surveyId}`, { headers })
        ]);
        setAnalytics(analyticsRes.data);
        setResponsesData(responsesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surveyId]);

  const ratingStats = useMemo(() => {
    if (!analytics) return [];
    return analytics.analytics
      .filter((q) => q.questionType === 'rating')
      .map((q) => {
        const numeric = q.answers
          .map((a) => Number(a))
          .filter((n) => !Number.isNaN(n));
        const avg = numeric.length
          ? numeric.reduce((sum, n) => sum + n, 0) / numeric.length
          : 0;
        return {
          questionId: q.questionId,
          questionText: q.questionText,
          count: numeric.length,
          average: avg
        };
      });
  }, [analytics]);

  const overallAverageRating = useMemo(() => {
    if (!ratingStats.length) return null;
    const totals = ratingStats.reduce(
      (acc, r) => {
        acc.sum += r.average * r.count;
        acc.count += r.count;
        return acc;
      },
      { sum: 0, count: 0 }
    );
    return totals.count ? totals.sum / totals.count : null;
  }, [ratingStats]);

  const chartQuestion = useMemo(() => {
    if (!analytics) return null;
    return analytics.analytics.find(
      (q) => q.questionType === 'mcq' || q.questionType === 'rating'
    );
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!chartQuestion) return null;
    const counts = {};
    if (chartQuestion.questionType === 'rating') {
      [1, 2, 3, 4, 5].forEach((n) => { counts[n] = 0; });
    }
    chartQuestion.answers.forEach((ans) => {
      const values = Array.isArray(ans) ? ans : [ans];
      values.forEach((v) => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    const labels = Object.keys(counts);
    const data = labels.map((l) => counts[l]);
    return {
      labels,
      datasets: [{
        label: 'Responses',
        data,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    };
  }, [chartQuestion]);

  const downloadCsv = () => {
    if (!responsesData || !analytics) return;
    const questions = analytics.analytics;
    const header = ['Respondent', 'Email', 'Submitted At', ...questions.map((q) => q.questionText)];
    const rows = responsesData.responses.map((r) => {
      const base = [
        r.user?.name || 'Anonymous',
        r.user?.email || '',
        new Date(r.createdAt).toISOString()
      ];
      const answers = questions.map((q) => {
        const found = r.answers.find((a) => a.questionId === q.questionId.toString());
        return found ? formatAnswer(found.answer) : '';
      });
      return [...base, ...answers];
    });
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (analytics.surveyTitle || 'survey').replace(/[^a-z0-9]+/gi, '_');
    link.href = url;
    link.download = `${safeTitle}_responses.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="page-container"><p>Loading analytics...</p></div>;
  if (error) return (
    <div className="page-container">
      <div className="alert alert-error">{error}</div>
      <Link to="/company/surveys" className="btn btn-secondary">← Back to Surveys</Link>
    </div>
  );
  if (!analytics) return null;

  const totalResponses = analytics.totalResponses;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{analytics.surveyTitle}</h2>
          <p className="page-subtitle">Survey Analytics</p>
        </div>
        <div className="header-actions">
          <button
            onClick={downloadCsv}
            className="btn btn-primary"
            disabled={totalResponses === 0}
          >
            ⬇ Download CSV
          </button>
          <Link to="/company/surveys" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Responses</div>
          <div className="stat-value">{totalResponses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">
            {overallAverageRating !== null
              ? `${overallAverageRating.toFixed(2)} / 5`
              : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Questions</div>
          <div className="stat-value">{analytics.analytics.length}</div>
        </div>
      </div>

      {ratingStats.length > 0 && (
        <div className="form-card">
          <h3>Rating Breakdown</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Responses</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {ratingStats.map((r) => (
                <tr key={r.questionId}>
                  <td>{r.questionText}</td>
                  <td>{r.count}</td>
                  <td>{r.count ? `${r.average.toFixed(2)} / 5` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chartData && totalResponses > 0 && (
        <div className="form-card">
          <h3>Chart: {chartQuestion.questionText}</h3>
          <div className="chart-wrapper">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
              }}
            />
          </div>
        </div>
      )}

      <div className="form-card">
        <h3>All Responses ({totalResponses})</h3>
        {totalResponses === 0 ? (
          <p className="empty-text">No responses submitted yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Respondent</th>
                  <th>Submitted</th>
                  {analytics.analytics.map((q) => (
                    <th key={q.questionId}>{q.questionText}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responsesData.responses.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div>{r.user?.name || 'Anonymous'}</div>
                      <div className="cell-meta">{r.user?.email}</div>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    {analytics.analytics.map((q) => {
                      const found = r.answers.find(
                        (a) => a.questionId === q.questionId.toString()
                      );
                      return (
                        <td key={q.questionId}>
                          {found ? formatAnswer(found.answer) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyAnalytics;
