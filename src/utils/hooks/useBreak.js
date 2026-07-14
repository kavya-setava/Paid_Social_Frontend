// useBreak — user-level break state backed by the break API.
// A break belongs to the person (not a role), so this one hook works in any
// dashboard header. While on break the backend hides/blocks the user from
// assignment; here we just drive the header UI + a live timer.
import { useEffect, useState } from "react";
import useApiCaller from "./useApicaller";

export default function useBreak() {
  const { fetchData } = useApiCaller();
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed]     = useState(0);
  const [loading, setLoading]     = useState(true);

  const apply = (d) => {
    setIsOnBreak(!!d?.isOnBreak);
    setStartedAt(d?.breakStartedAt || null);
  };

  const refresh = async () => {
    const res = await fetchData("get", "organicSocial/break/status");
    if (res?.success) apply(res.data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live elapsed timer while on break (rebuilds from startedAt, so it's
  // accurate across refresh and survives re-mounts).
  useEffect(() => {
    if (!isOnBreak || !startedAt) { setElapsed(0); return; }
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOnBreak, startedAt]);

  const start = async (reason = "") => {
    const res = await fetchData("post", "organicSocial/break/start", { reason });
    if (res?.success) apply(res.data);
    else if (res?.breakStartedAt) apply({ isOnBreak: true, breakStartedAt: res.breakStartedAt });
    return res;
  };

  const end = async () => {
    const res = await fetchData("post", "organicSocial/break/end", {});
    if (res?.success) apply({ isOnBreak: false, breakStartedAt: null });
    return res;
  };

  return { isOnBreak, startedAt, elapsed, loading, start, end, refresh };
}
