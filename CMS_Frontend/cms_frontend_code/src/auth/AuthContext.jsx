import { createContext, useContext, useEffect, useState } from "react";
import { api, initCsrf, me as apiMe, logout as apiLogout } from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initCsrf();
        const { data } = await apiMe();
        setUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
        localStorage.setItem("isLoggedIn", "true");
      } catch {
        setUser(null);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    await initCsrf();
    const xsrfCookie = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='));
  const xsrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : null;
  if (!xsrfToken) throw new Error("CSRF token missing");

  await api.post('/login', { email, password }, {
    headers: { 'X-XSRF-TOKEN': xsrfToken }
  });
    const { data } = await apiMe();
    setUser(data);
    localStorage.setItem("currentUser", JSON.stringify(data));
    localStorage.setItem("isLoggedIn", "true");
    return data;
  };

  const logout = async () => {
        try { await apiLogout(); } catch (err) { console.error("Logout error:", err); }    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
