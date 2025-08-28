import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  me,
  activity_session_start,
  activity_heartbeat,
  activity_pageview_start,
  activity_pageview_end,
  activity_session_end,
} from "@/services/api.js";

const ENABLED_PATHS_DEFAULT = [
  "/super_dashboard",
  "/business_dashboard",
  "/user_dashboard",
];
const HEARTBEAT_MS_DEFAULT = 30_000;

function is401(err) {
  return err && err.response && err.response.status === 401;
}
async function ignore401(promise) {
  try {
    return await promise;
  } catch (e) {
    if (!is401(e)) throw e;
  }
}

function beacon(url, payload) {
  try {
    const blob = new Blob([JSON.stringify(payload || {})], {
      type: "application/json",
    });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}

function getTabId() {
  let id = sessionStorage.getItem("activity_tab_id");
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
    sessionStorage.setItem("activity_tab_id", id);
  }
  return id;
}

export default function ActivityTracker({
  enabledPaths = ENABLED_PATHS_DEFAULT,
  heartbeatMs = HEARTBEAT_MS_DEFAULT,
}) {
  const location = useLocation();
  const sessionIdRef = useRef(
    sessionStorage.getItem("activity_session_id") || ""
  );
  const pageViewIdRef = useRef("");
  const heartbeatTimerRef = useRef(null);

  const onEnabledPath = useMemo(() => {
    const p = location.pathname || "/";
    return enabledPaths.some((base) => p.startsWith(base));
  }, [location.pathname, enabledPaths]);

  async function ensureSession() {
    if (!onEnabledPath || sessionIdRef.current) return;
    const tab_id = getTabId();
    await ignore401(me());
    const parent_path =
      enabledPaths.find((p) => location.pathname.startsWith(p)) || null;
    const res = await ignore401(
      activity_session_start({ tab_id, parent_path })
    );
    if (res?.data?.session_id) {
      sessionIdRef.current = res.data.session_id;
      sessionStorage.setItem("activity_session_id", res.data.session_id);
    }
  }

  function startHeartbeat() {
    stopHeartbeat();
    if (!sessionIdRef.current) return;
    if (document.visibilityState !== "visible") return;
    heartbeatTimerRef.current = setInterval(() => {
      if (sessionIdRef.current)
        ignore401(activity_heartbeat({ session_id: sessionIdRef.current }));
    }, heartbeatMs);
  }
  function stopHeartbeat() {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }

  async function endPageView(left_at = null, useBeacon = false) {
    if (!pageViewIdRef.current) return;
    const payload = { page_view_id: pageViewIdRef.current };
    if (left_at) payload.left_at = left_at;
    try {
      if (useBeacon) {
      beacon("/api/activity/pageview/end", payload);
    } else {
      await ignore401(activity_pageview_end(payload));
    }
    } finally {
      pageViewIdRef.current = "";
    }
  }

  async function startPageView() {
    if (!sessionIdRef.current || !onEnabledPath) return;
    const iso = new Date().toISOString();
    await endPageView(iso, /*useBeacon*/ false);
    const res = await ignore401(
      activity_pageview_start({
        session_id: sessionIdRef.current,
        path: location.pathname + (location.search || ""),
        title: document.title || null,
      })
    );
    if (res?.data?.page_view_id) {
      pageViewIdRef.current = res.data.page_view_id;
    }
  }

  useEffect(() => {
    (async () => {
      if (!onEnabledPath) {
        if (sessionStorage.getItem("activity_killed") === "1") {
          sessionStorage.removeItem("activity_killed");
          pageViewIdRef.current = "";
          sessionIdRef.current = "";
          stopHeartbeat();
          return;
        }
        if (pageViewIdRef.current) await endPageView();
        if (sessionIdRef.current) {
          await ignore401(
            activity_session_end({
              session_id: sessionIdRef.current,
              reason: "navigate_away",
            })
          );
          sessionIdRef.current = "";
          sessionStorage.removeItem("activity_session_id");
        }
        stopHeartbeat();
        return;
      }

      await ensureSession();
      startHeartbeat();
      await startPageView();
      ignore401(activity_heartbeat({ session_id: sessionIdRef.current }));
    })();
    return () => {
      stopHeartbeat();
    };
  }, [location.pathname, location.search, onEnabledPath]);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "hidden") {
        const iso = new Date().toISOString();
        endPageView(iso);
        stopHeartbeat();
      } else {
        void ensureSession().then(() => {
          startHeartbeat();
          startPageView();
        });
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    function onUnload() {
      const sid = sessionIdRef.current;
      const pvid = pageViewIdRef.current;
      const nowIso = new Date().toISOString();
      if (pvid)
        beacon("/api/activity/pageview/end", {
          page_view_id: pvid,
          left_at: nowIso,
        });
      if (sid)
        beacon("/api/activity/session/end", {
          session_id: sid,
          reason: "unload",
        });
    }
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  return null;
}

export async function endActivitySession(reason = "logout") {
  const sid = sessionStorage.getItem("activity_session_id");
  if (!sid) return;

  try {
    await activity_session_end({ session_id: sid, reason });
  } catch (e) {
    console.error(e);
  } finally {
    sessionStorage.removeItem("activity_session_id");
    sessionStorage.setItem("activity_killed", "1");
  }
}
