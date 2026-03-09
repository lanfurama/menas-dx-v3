import { useState, useEffect } from 'react';
import { dbApi } from '../services/api.js';

export function usePredictions(dbOn, params = {}, refetchKey = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dbOn) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    dbApi.getPredictions(params)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Lỗi tải dữ liệu');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dbOn, refetchKey, JSON.stringify(params)]);

  return { data, loading, error };
}
