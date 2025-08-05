// logInSignUp.jsx
import { useState } from "react";
import "./logInSignUp.css";

export default function LogInSignUp() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-left">
          <h2 className="auth-title">{isLogin ? "Log In" : "Sign In"}</h2>

          <p className="or-text">or use your email password</p>

          {!isLogin && (
          <>
            <input type="text" placeholder="First Name" className="input-field" />
            <input type="text" placeholder="Last Name" className="input-field" />
            <input type="text" placeholder="Job Title" className="input-field" />
            <input type="text" placeholder="Phone Number" className="input-field" />
          </>
        )}

          <input type="email" placeholder="Email" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />

          <div className="options-row">
            {isLogin && (
              <button className="link-btn">Forgot Your Password?</button>
            )}
          </div>

          <button className="submit-btn">{isLogin ? "Log In" : "Sign In"}</button>
        </div>

        <div className="auth-right">
          <h2>Welcome {isLogin ? "Back" : "Aboard"}!</h2>
          <p>
            {isLogin
              ? "Log in to access your account and continue where you left off."
              : "Create an account to get started with our platform."}
          </p>
          <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Log In" : "SIGN IN"}
          </button>
        </div>
      </div>
    </div>
  );
}
