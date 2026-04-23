import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const emptyQuestion = () => ({
  questionText: '',
  questionType: 'text',
  options: ['', ''],
  required: true
});

const CreateEditSurvey = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    productId: '',
    questions: []
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProducts(data);
      } catch (err) {}
    };
    fetchProducts();

    if (isEditing) {
      const fetchSurvey = async () => {
        try {
          const { data } = await axios.get(`/api/surveys/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setForm({
            title: data.title,
            description: data.description || '',
            productId: data.product?._id || data.product,
            questions: data.questions.map((q) => ({
              ...q,
              options: q.options?.length ? q.options : ['', '']
            }))
          });
        } catch (err) {
          setError('Failed to load survey.');
        }
      };
      fetchSurvey();
    }
  }, [id]);

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, emptyQuestion()] });
  };

  const removeQuestion = (index) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const updateQuestion = (index, field, value) => {
    const updated = form.questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setForm({ ...form, questions: updated });
  };

  const addOption = (qIndex) => {
    const updated = form.questions.map((q, i) =>
      i === qIndex ? { ...q, options: [...q.options, ''] } : q
    );
    setForm({ ...form, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = form.questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = q.options.map((opt, oi) => (oi === oIndex ? value : opt));
      return { ...q, options: newOptions };
    });
    setForm({ ...form, questions: updated });
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = form.questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: q.options.filter((_, oi) => oi !== oIndex) };
    });
    setForm({ ...form, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.questions.length === 0) {
      return setError('Please add at least one question.');
    }
    try {
      const payload = {
        ...form,
        questions: form.questions.map((q) => ({
          ...q,
          options: q.questionType === 'mcq' ? q.options.filter((o) => o.trim()) : []
        }))
      };
      if (isEditing) {
        await axios.put(`/api/surveys/${id}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('/api/surveys', payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      navigate('/company/surveys');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save survey.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{isEditing ? 'Edit Survey' : 'Create Survey'}</h2>
        <Link to="/company/surveys" className="btn btn-secondary">← Back to Surveys</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Survey Details */}
        <div className="form-card">
          <h3>Survey Details</h3>
          <div className="form-group">
            <label>Survey Title <span className="required">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Product Satisfaction Survey"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what this survey is about"
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Select Product <span className="required">*</span></label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">-- Choose a product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="field-hint">No products found. <Link to="/company/products/add">Add a product first.</Link></p>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="questions-section">
          <div className="section-header">
            <h3>Questions ({form.questions.length})</h3>
            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          {form.questions.length === 0 && (
            <div className="empty-state">
              <p>No questions yet. Click <strong>"+ Add Question"</strong> to get started.</p>
            </div>
          )}

          {form.questions.map((q, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{qIndex + 1}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeQuestion(qIndex)}
                >
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Question Text <span className="required">*</span></label>
                <input
                  type="text"
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  placeholder="Type your question here..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={q.questionType}
                  onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                >
                  <option value="text">Short Text Answer</option>
                  <option value="rating">Rating Scale (1–5)</option>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                </select>
              </div>

              {/* MCQ Options */}
              {q.questionType === 'mcq' && (
                <div className="options-section">
                  <label>Answer Options</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <span className="option-label">{String.fromCharCode(65 + oIndex)}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeOption(qIndex, oIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => addOption(qIndex)}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {/* Rating Preview */}
              {q.questionType === 'rating' && (
                <div className="rating-preview">
                  <span className="rating-label">Scale preview:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="rating-dot">{n}</span>
                  ))}
                </div>
              )}

              {/* Text Preview */}
              {q.questionType === 'text' && (
                <div className="text-preview">
                  <input type="text" placeholder="Customer will type their answer here..." disabled />
                </div>
              )}

              <div className="form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                  />
                  Mark as required
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Survey' : 'Create Survey'}
          </button>
          <Link to="/company/surveys" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateEditSurvey;
