import React, { useState } from "react";
import "./logInSignUp.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";



  export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return setError("Both email and password are required.");

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
            <p className="or-text">or use your email and password</p>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="options-row">
              <button className="link-btn">Forgot Your Password?</button>
            </div>

            <button type="button" className="submit-btn" onClick={handleLogin}>
              Log In
            </button>
          </div>

          <div className="auth-right">
            <h2>Welcome Back!</h2>
            <p>Log in to access your account and continue where you left off.</p>
            <button className="switch-btn" onClick={() => navigate("/signup")}>
              Go to SIGN IN
            </button>
          </div>
        </div>
      </div>
    );
  }
