import { useEffect, useState } from 'react';

const useSearchHistory = (storageKey) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const saveSearch = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const nextHistory = [trimmed, ...history.filter((item) => item !== trimmed)].slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(nextHistory));
    setHistory(nextHistory);
  };

  const clearHistory = () => {
    localStorage.removeItem(storageKey);
    setHistory([]);
  };

  return { history, saveSearch, clearHistory };
};

export default useSearchHistory;
