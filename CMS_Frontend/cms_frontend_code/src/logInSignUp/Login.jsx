import React, { useState } from "react";
import "./LogIn.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import touchLogo from "../assets/TouchLogo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return setError("Both email and password are required.");
    try {
      const user = await login(email, password);
      const rolePaths = {
        super_admin: "/super_dashboard",
        business_admin: "/business_dashboard",
        business_user: "/user_dashboard",
      };
      if (rolePaths[user.role]) return navigate(rolePaths[user.role]);
      setError("Unknown role. Access denied.");
    } catch (err) {
      setError("Session error – please reload and log in again.");
      console.error("/me error:", err);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-left">
          <h2 className="auth-title">Log In</h2>
          <p className="or-text">Use your email and password</p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="options-row">
            <button type="button" className="text-btn">
              Forgot your password?
            </button>
          </div>

          <button type="button" className="submit-btn" onClick={handleLogin}>
            Log In
          </button>
        </div>

        <div className="auth-right">
          <img src={touchLogo} alt="Touch Logo" className="auth-logo" />
          <h2 className="welcome-title">Welcome</h2>
          <p className="welcome-subtext">Please log in to continue</p>
        </div>
      </div>
    </div>
  );
}
