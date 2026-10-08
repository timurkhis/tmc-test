import { useCallback, useEffect, useRef, useState } from 'react';

const pageSize = 20;

type Page = {
  items: string[];
  nextCursor: string | null;
};

type Side = 'left' | 'right';

async function fetchPage(
  side: Side,
  query: string,
  cursor: string | null,
): Promise<Page> {
  const params = new URLSearchParams({ side, limit: String(pageSize) });
  if (cursor) params.set('cursor', cursor);
  if (query) params.set('q', query);
  const response = await fetch(`/api/items?${params}`);
  if (!response.ok) throw new Error('Не удалось загрузить список');
  return response.json() as Promise<Page>;
}

function appendPage(current: string[], pageItems: string[]) {
  const seen = new Set(current);
  const extra = pageItems.filter((id) => !seen.has(id));
  return extra.length === 0 ? current : [...current, ...extra];
}

export function useDebounced(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function usePagedItems(side: Side, query: string) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    const request = ++generation.current;
    cursorRef.current = null;
    loadingRef.current = true;
    setItems([]);
    setLoading(true);
    setError(null);
    fetchPage(side, query, null)
      .then((page) => {
        if (request !== generation.current) return;
        setItems(page.items);
        cursorRef.current = page.nextCursor;
      })
      .catch(() => {
        if (request === generation.current)
          setError('Не удалось загрузить список');
      })
      .finally(() => {
        if (request !== generation.current) return;
        loadingRef.current = false;
        setLoading(false);
      });
  }, [side, query]);

  const loadMore = useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor || loadingRef.current) return;
    const request = generation.current;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    fetchPage(side, query, cursor)
      .then((page) => {
        if (request !== generation.current) return;
        setItems((current) => appendPage(current, page.items));
        cursorRef.current = page.nextCursor;
      })
      .catch(() => {
        if (request === generation.current)
          setError('Не удалось загрузить список');
      })
      .finally(() => {
        if (request !== generation.current) return;
        loadingRef.current = false;
        setLoading(false);
      });
  }, [side, query]);

  return { items, setItems, loading, error, loadMore };
}
