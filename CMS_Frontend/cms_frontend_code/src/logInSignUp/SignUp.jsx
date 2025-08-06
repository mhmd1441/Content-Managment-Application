import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./logInSignUp.css";
import { register } from "../services/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

    const [error, setError] = useState(""); 

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };
     

  const handleSubmit = async () => {
  const hasEmptyField = Object.values(formData).some(value => value.trim() === "");
  if (hasEmptyField) {
    setError("All fields are required.");
    return;
  }

  try {
    await register({
      first_name: formData.firstName,
      last_name: formData.lastName,
      job_title: formData.jobTitle,
      phone_number: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password,
    });

    navigate("/login");
  } catch (err) {
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("An error occurred during registration.");
    }
  }
};

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-left">
          <h2 className="auth-title">Sign Up</h2>
          <p className="or-text">or use your email password</p>
          {error && <p className="error-message">{error}</p>}

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            onChange={handleChange}
          />
          <input
            type="password_confirmation"
            name="password_confirmation"
            placeholder="Confirm Password"
            className="input-field"
            onChange={handleChange}
          />
          <button className="submit-btn" onClick={handleSubmit}>
            Sign Up
          </button>
        </div>

        <div className="auth-right">
          <h2>Welcome Aboard!</h2>
          <p>Create an account to get started with our platform.</p>
          <button className="switch-btn" onClick={() => navigate("/login")}>
            Go to Log In
          </button>
        </div>
      </div>
    </div>
  );
}
