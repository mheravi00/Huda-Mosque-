'use client';
import { useCallback, useEffect, useState } from 'react';

export function useApiResource(loader, dependencies = []) {
  const [state, setState] = useState({ data: [], meta: null, loading: true, error: '' });
  const refresh = useCallback(async () => {
    setState(current => ({ ...current, loading: true, error: '' }));
    try {
      const result = await loader();
      setState({ data: result.data ?? [], meta: result.meta?.pagination ?? null, loading: false, error: '' });
      return result;
    } catch (error) {
      setState(current => ({ ...current, loading: false, error: error.message || 'Unable to load data.' }));
      throw error;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  return { ...state, refresh, setData: updater => setState(current => ({ ...current, data: typeof updater === 'function' ? updater(current.data) : updater })) };
}

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [value, delay]);
  return debounced;
}
