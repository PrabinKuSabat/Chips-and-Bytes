import { useEffect, useState } from 'react';

const CACHE_PREFIX = 'chips-and-bytes:public-resource:';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
const INVALIDATION_EVENT = 'chips-and-bytes:public-resource:invalidate';

const storageKey = (cacheKey) => `${CACHE_PREFIX}${cacheKey}`;

const readCachedValue = (cacheKey, maxAge) => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = JSON.parse(window.localStorage.getItem(storageKey(cacheKey)));
    if (!cached || !Array.isArray(cached.value) || Date.now() - cached.savedAt > maxAge) {
      return null;
    }
    return cached.value;
  } catch {
    return null;
  }
};

const writeCachedValue = (cacheKey, value) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      storageKey(cacheKey),
      JSON.stringify({ value, savedAt: Date.now() }),
    );
  } catch {
    // Storage is optional. The supplied fallback remains available.
  }
};

export const invalidatePublicResource = (cacheKey) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(storageKey(cacheKey));
  } catch {
    // Storage is optional; the in-page event still requests fresh data.
  }

  window.dispatchEvent(new CustomEvent(INVALIDATION_EVENT, { detail: { cacheKey } }));
};

/**
 * Serves public API data with an immediate local fallback and background
 * revalidation. This avoids a blank section when a free-tier backend wakes.
 */
export const usePublicResource = ({ cacheKey, url, fallback = [], maxAge = DEFAULT_CACHE_TTL, refreshInterval = 0 }) => {
  const [data, setData] = useState(() => readCachedValue(cacheKey, maxAge) || fallback);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setIsRefreshing(false);
      return undefined;
    }

    let isActive = true;
    let activeController;

    const refresh = async () => {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        const value = await response.json();
        if (!Array.isArray(value)) throw new Error('Expected an array response');
        if (!isActive) return;

        writeCachedValue(cacheKey, value);
        setData(value);
        setError(null);
      } catch (requestError) {
        if (isActive) setError(requestError);
      } finally {
        window.clearTimeout(timeoutId);
        if (isActive) setIsRefreshing(false);
      }
    };

    refresh();
    const intervalId = refreshInterval > 0 ? window.setInterval(refresh, refreshInterval) : null;
    const handleInvalidation = (event) => {
      if (event.detail?.cacheKey === cacheKey) refresh();
    };
    const handleStorage = (event) => {
      if (event.key === storageKey(cacheKey) && event.newValue === null) refresh();
    };

    window.addEventListener(INVALIDATION_EVENT, handleInvalidation);
    window.addEventListener('storage', handleStorage);

    return () => {
      isActive = false;
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener(INVALIDATION_EVENT, handleInvalidation);
      window.removeEventListener('storage', handleStorage);
      activeController?.abort();
    };
  }, [cacheKey, url, refreshInterval]);

  return { data, isRefreshing, error };
};
