const SearchWithHistory = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  history,
  onSelectHistory,
  onClearHistory,
  onClearSearch,
  title = 'Recent searches'
}) => {
  return (
    <>
      <form className="search-bar" onSubmit={onSubmit}>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
        {typeof onClearSearch === 'function' && value && (
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() => onClearSearch()}
          >
            Clear
          </button>
        )}
      </form>

      {history.length > 0 && (
        <div className="search-history-card">
          <div className="search-history-header">
            <span>{title}</span>
            <button type="button" className="link-button" onClick={onClearHistory}>
              Clear history
            </button>
          </div>
          <div className="search-history-list">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                className="search-history-item"
                onClick={() => onSelectHistory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchWithHistory;
