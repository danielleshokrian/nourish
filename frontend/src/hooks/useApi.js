import { useState, useEffect, useCallback } from 'react';

const useApi = (apiFunc, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunc(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || 'Something went wrong');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
};

export default useApi;