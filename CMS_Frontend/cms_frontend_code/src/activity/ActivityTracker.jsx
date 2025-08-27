import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { me } from "@/services/api.js"; // optional check; harmless if 401
import {
  activity_session_start,
  activity_heartbeat,
  activity_pageview_start,
  activity_pageview_end,
  activity_session_end,
} from "@/services/api.js";

const ENABLED_PATHS_DEFAULT = ["/super_dashboard", "/business_dashboard", "/user_dashboard"];
const HEARTBEAT_MS_DEFAULT = 30_000;


function is401(err) {
  return err && err.response && err.response.status === 401;
}
async function ignore401(promise) {
  try {
    return await promise;
  } catch (e) {
    if (!is401(e)) throw e; // only silence 401
  }
}

// Small helper: safe sendBeacon JSON (for unload). Uses relative URLs.
function beacon(url, payload) {
  try {
    const blob = new Blob([JSON.stringify(payload || {})], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}

// per-tab UUID (very light)
function getTabId() {
  let id = sessionStorage.getItem("activity_tab_id");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
    sessionStorage.setItem("activity_tab_id", id);
  }
  return id;
}

export default function ActivityTracker({
  enabledPaths = ENABLED_PATHS_DEFAULT,
  heartbeatMs = HEARTBEAT_MS_DEFAULT,
}) {
  const location = useLocation();
  const sessionIdRef = useRef(sessionStorage.getItem("activity_session_id") || "");
  const pageViewIdRef = useRef("");
  const heartbeatTimerRef = useRef(null);
  const mountedRef = useRef(false);

  const onEnabledPath = useMemo(() => {
    const p = location.pathname || "/";
    return enabledPaths.some((base) => p.startsWith(base));
  }, [location.pathname, enabledPaths]);

  // Start (or reuse) session
  async function ensureSession() {
    if (!onEnabledPath) return;
    if (sessionIdRef.current) return;

    const tab_id = getTabId();
    // Optional: touch /api/me to warm auth (ignore errors)
    try { await me(); } catch {}
    const { data } = await activity_session_start({ tab_id, parent_path: enabledPaths.find(p => location.pathname.startsWith(p)) || null });
    sessionIdRef.current = data.session_id;
    sessionStorage.setItem("activity_session_id", data.session_id);
  }

  // Heartbeat management
  function startHeartbeat() {
    stopHeartbeat();
    if (!sessionIdRef.current) return;
    if (document.visibilityState !== "visible") return;
    heartbeatTimerRef.current = setInterval(() => {
      if (sessionIdRef.current) ignore401(activity_heartbeat({ session_id: sessionIdRef.current }));
    }, heartbeatMs);
  }
  function stopHeartbeat() {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }

  // Page view helpers
  async function endPageView(left_at = null) {
    if (!pageViewIdRef.current) return;
    const payload = { page_view_id: pageViewIdRef.current };
    if (left_at) payload.left_at = left_at;
    try {
      // Prefer beacon during unload/visibility change
      if (left_at) beacon("/api/activity/pageview/end", payload);
      else await ignore401(activity_pageview_end(payload));
    } finally {
      pageViewIdRef.current = "";
    }
  }

  async function startPageView() {
    if (!sessionIdRef.current || !onEnabledPath) return;
    await endPageView(); // auto-close previous if any
    const { data } = await activity_pageview_start({
      session_id: sessionIdRef.current,
      path: location.pathname + (location.search || ""),
      title: document.title || null,
    });
    pageViewIdRef.current = data.page_view_id;
  }

  useEffect(() => {
    if (!mountedRef.current) mountedRef.current = true;
    (async () => {
      if (!onEnabledPath) {
        if (sessionStorage.getItem("activity_killed") === "1") {
        sessionStorage.removeItem("activity_killed");
        pageViewIdRef.current = "";
        sessionIdRef.current  = "";
        stopHeartbeat();
        return;
        }
        if (pageViewIdRef.current) await endPageView();
        if (sessionIdRef.current) {
          await ignore401(activity_session_end({ session_id: sessionIdRef.current, reason: "navigate_away" }));
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

  }, [location.pathname, location.search]);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "hidden") {
        const iso = new Date().toISOString();
        endPageView(iso);
        stopHeartbeat();
      } else {
        startHeartbeat();
        startPageView();
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Before unload: end PV + session via beacon
  useEffect(() => {
    function onUnload() {
      const sid = sessionIdRef.current;
      const pvid = pageViewIdRef.current;
      const nowIso = new Date().toISOString();
      if (pvid) beacon("/api/activity/pageview/end", { page_view_id: pvid, left_at: nowIso });
      if (sid) beacon("/api/activity/session/end", { session_id: sid, reason: "unload" });
    }
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  return null; // invisible
}

// Optional helper to call on logout buttons
export async function endActivitySession(reason = "logout") {
  const sid = sessionStorage.getItem("activity_session_id");
  if (!sid) return;

  try {
    // IMPORTANT: end the session on the server *while you're still authenticated*
    await activity_session_end({ session_id: sid, reason }); // closes any open PVs too
  } catch (e) {
    // ok to ignore; if the user already lost auth, this may 401
    // console.warn("activity_session_end failed", e);
  } finally {
    // Clear client state so we don't attempt more calls after logout/navigation
    sessionStorage.removeItem("activity_session_id");
    sessionStorage.setItem("activity_killed", "1");
  }
}