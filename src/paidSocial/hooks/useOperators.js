import { useState, useEffect, useRef } from 'react';
import socket from '../../socket';

// Loads an assignment roster once and re-fetches automatically whenever any
// user's presence changes (PAID_PRESENCE_EVENT) — so the red dot / disabled
// state in assignment dropdowns updates live without a page refresh.
// `fetchFn` returns the API promise (e.g. () => qmApi.getOperators('AGENT')).
export default function useOperators(fetchFn) {
  const [operators, setOperators] = useState([]);
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  useEffect(() => {
    let alive = true;
    const load = () =>
      fnRef.current()
        .then((r) => { if (alive) setOperators(r?.data || []); })
        .catch(() => { if (alive) setOperators([]); });

    load();
    socket.on('PAID_PRESENCE_EVENT', load);
    return () => { alive = false; socket.off('PAID_PRESENCE_EVENT', load); };
  }, []);

  return operators;
}
