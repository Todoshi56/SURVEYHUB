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
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const formatAnswer = (answer) => {
  if (answer === null || answer === undefined) return '—';
  return Array.isArray(answer) ? answer.join(', ') : String(answer);
};

const getQuestionCounts = (question) => {
  const counts = {};
  if (question.questionType === 'rating') {
    [1, 2, 3, 4, 5].forEach((value) => { counts[value] = 0; });
  }

  question.answers.forEach((answer) => {
    const values = Array.isArray(answer) ? answer : [answer];
    values.forEach((value) => {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  return counts;
};

const SurveyAnalytics = () => {
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [responsesData, setResponsesData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user?.token) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');

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
  }, [surveyId, user?.token]);

  const questions = useMemo(() => analytics?.analytics || [], [analytics]);
  const totalResponses = analytics?.totalResponses || 0;
  const chartQuestion = useMemo(
    () => questions.find((q) => q.questionType === 'mcq' || q.questionType === 'rating') || null,
    [questions]
  );

  const ratingStats = useMemo(
    () => questions
      .filter((q) => q.questionType === 'rating')
      .map((question) => {
        const values = question.answers
          .map((answer) => Number(answer))
          .filter((value) => !Number.isNaN(value));
        const average = values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;

        return {
          questionId: question.questionId,
          questionText: question.questionText,
          count: values.length,
          average
        };
      }),
    [questions]
  );

  const overallAverageRating = useMemo(() => {
    if (!ratingStats.length) return null;
    const totals = ratingStats.reduce(
      (acc, stat) => ({
        sum: acc.sum + stat.average * stat.count,
        count: acc.count + stat.count
      }),
      { sum: 0, count: 0 }
    );

    return totals.count ? totals.sum / totals.count : null;
  }, [ratingStats]);

  const chartData = useMemo(() => {
    if (!chartQuestion) return null;
    const counts = getQuestionCounts(chartQuestion);
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [{
        label: 'Responses',
        data: labels.map((label) => counts[label]),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    };
  }, [chartQuestion]);

  const downloadCsv = () => {
    if (!responsesData || !analytics) return;

    const header = ['Respondent', 'Email', 'Submitted At', ...questions.map((q) => q.questionText)];
    const rows = responsesData.responses.map((response) => {
      const base = [
        response.user?.name || 'Anonymous',
        response.user?.email || '',
        new Date(response.createdAt).toISOString()
      ];
      const answers = questions.map((question) => {
        const found = response.answers.find(
          (answer) => answer.questionId === question.questionId.toString()
        );
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

  const handleDeleteResponse = async (id) => {
    if (!window.confirm('Delete this response? This cannot be undone.')) return;

    setDeletingId(id);

    try {
      await axios.delete(`/api/responses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setResponsesData((prev) => ({
        ...prev,
        responses: prev.responses.filter((response) => response._id !== id)
      }));
      setAnalytics((prev) => prev && ({
        ...prev,
        totalResponses: Math.max(0, prev.totalResponses - 1)
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete response.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <Link to="/company/surveys" className="btn btn-secondary">← Back to Surveys</Link>
      </div>
    );
  }

  if (!analytics) return null;

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
            {overallAverageRating !== null ? `${overallAverageRating.toFixed(2)} / 5` : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Questions</div>
          <div className="stat-value">{questions.length}</div>
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
              {ratingStats.map((stat) => (
                <tr key={stat.questionId}>
                  <td>{stat.questionText}</td>
                  <td>{stat.count}</td>
                  <td>{stat.count ? `${stat.average.toFixed(2)} / 5` : '—'}</td>
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
                  {questions.map((question) => (
                    <th key={question.questionId}>{question.questionText}</th>
                  ))}
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {responsesData.responses.map((response) => (
                  <tr key={response._id}>
                    <td>
                      <div>{response.user?.name || 'Anonymous'}</div>
                      <div className="cell-meta">{response.user?.email}</div>
                    </td>
                    <td>{new Date(response.createdAt).toLocaleDateString()}</td>
                    {questions.map((question) => {
                      const found = response.answers.find(
                        (answer) => answer.questionId === question.questionId.toString()
                      );
                      return (
                        <td key={question.questionId}>
                          {found ? formatAnswer(found.answer) : '—'}
                        </td>
                      );
                    })}
                    {isAdmin && (
                      <td className="action-cell">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteResponse(response._id)}
                          disabled={deletingId === response._id}
                        >
                          {deletingId === response._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    )}
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
