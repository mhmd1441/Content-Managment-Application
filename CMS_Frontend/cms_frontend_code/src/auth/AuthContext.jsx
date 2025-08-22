import { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  initCsrf,
  me as apiMe,
  logout as apiLogout,
} from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const onAuthPages = ['/', '/login'].includes(window.location.pathname);
    if (onAuthPages) { setLoading(false); return; }
    (async () => {
      try {
        await initCsrf();
        const { data } = await apiMe();
        setUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
        localStorage.setItem("isLoggedIn", "true");
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    if (authBusy) return;        // prevent double-click races
    setAuthBusy(true);
    try {
      await initCsrf();          // fresh XSRF
      await api.post("/login", { email, password });   // sets cookies
      const { data } = await apiMe();                  // now authenticated
      setUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
      localStorage.setItem("isLoggedIn", "true");
      return data;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, authBusy }}>
      {children}
    </AuthCtx.Provider>
  );
}
