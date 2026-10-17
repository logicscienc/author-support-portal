
import { useCallback, useEffect, useRef, useState } from "react";

export default function useFetch(fetcher, { pollMs = 0, key = "" } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher); // always the latest fetcher function
  const aliveRef = useRef(true); // false once the page has been left
  const requestRef = useRef(0); // numbers the requests so an old slow answer can't overwrite a newer one

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    try {
      const result = await fetcherRef.current();
      if (!aliveRef.current || requestId !== requestRef.current) return;
      setData(result);
      setError("");
    } catch (err) {
      if (aliveRef.current && requestId === requestRef.current) setError(err.message);
    } finally {
      if (aliveRef.current && requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refresh();

    let timer;
    if (pollMs > 0) {
      // Skip refreshing while the browser tab is hidden.
      timer = setInterval(() => {
        if (document.visibilityState === "visible") refresh();
      }, pollMs);
    }

    return () => {
      aliveRef.current = false;
      clearInterval(timer);
    };
  }, [refresh, pollMs, key]);

  return { data, error, loading, refresh };
}