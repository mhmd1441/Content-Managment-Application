import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { initCsrf, register, show_user, update_user } from "../../../src/services/api";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();            // if present -> edit mode
  const editing = Boolean(id);

  const [loading, setLoading] = useState(editing); // only load if editing
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // UI state (camelCase)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    phoneNumber: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // --- helpers: API<->UI mapping ---
  const apiToUi = (u) => ({
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    jobTitle: u.job_title || "",
    phoneNumber: u.phone_number || "",
    email: u.email || "",
    password: "",
    password_confirmation: "",
  });

  const uiToApi = (f) => {
    const payload = {
      first_name: f.firstName,
      last_name: f.lastName,
      job_title: f.jobTitle,
      phone_number: f.phoneNumber,
      email: f.email,
    };
    // Only include password fields if provided
    if (f.password?.trim()) {
      payload.password = f.password;
      if (f.password_confirmation?.trim()) {
        payload.password_confirmation = f.password_confirmation;
      }
    }
    return payload;
  };

  // --- load user for edit ---
  useEffect(() => {
    if (!editing) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await initCsrf();
        const { data } = await show_user(id); // GET /api/show_user/:id
        const user = Array.isArray(data) ? data[0] : data?.data || data;
        if (mounted && user) {
          setFormData(apiToUi(user));
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load user.");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [editing, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    // For create: everything required
    if (!editing) {
      const required = ["firstName", "lastName", "jobTitle", "phoneNumber", "email", "password"];
      const hasEmpty = required.some((k) => !String(formData[k] || "").trim());
      if (hasEmpty) return "All fields are required.";
      if (formData.password !== formData.password_confirmation) {
        return "Passwords do not match.";
      }
      return "";
    }

    // For edit: email + basic fields should not be empty; password optional
    const required = ["firstName", "lastName", "jobTitle", "phoneNumber", "email"];
    const hasEmpty = required.some((k) => !String(formData[k] || "").trim());
    if (hasEmpty) return "Fill the required fields.";
    if (formData.password || formData.password_confirmation) {
      if (formData.password !== formData.password_confirmation) {
        return "Passwords do not match.";
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSubmitting(true);
      await initCsrf();

      if (editing) {
        // UPDATE
        const payload = uiToApi(formData);
        await update_user(id, payload); // PUT /api/update_user/:id
        navigate(-1); // back to list
      } else {
        // CREATE (register)
        const payload = uiToApi(formData);
        // register probably expects snake_case too, but you can send payload directly
        await register(payload);
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError(editing ? "Update failed." : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-box">
          <div className="auth-left">
            <h2 className="auth-title">{editing ? "Edit User" : "Sign Up"}</h2>
            <p className="or-text">Loading user…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-left">
          <h2 className="auth-title">{editing ? "Edit User" : "Sign Up"}</h2>
          <p className="or-text">
            {editing ? "Update the fields and save your changes" : "or use your email password"}
          </p>

          {error && <p className="error-message">{error}</p>}

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="input-field"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="input-field"
            value={formData.lastName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            className="input-field"
            value={formData.jobTitle}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            className="input-field"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Passwords:
              - In edit mode they're optional (leave blank to keep current)
              - In create mode they're required */}
          <input
            type="password"
            name="password"
            placeholder={editing ? "New Password (optional)" : "Password"}
            className="input-field"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password_confirmation"
            placeholder={editing ? "Confirm New Password (optional)" : "Confirm Password"}
            className="input-field"
            value={formData.password_confirmation}
            onChange={handleChange}
          />

          <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (editing ? "Saving..." : "Signing up...") : (editing ? "Save Changes" : "Sign Up")}
          </button>
        </div>

        <div className="auth-right">
          <h2>{editing ? "Review & Save" : "Welcome Aboard!"}</h2>
          <p>
            {editing
              ? "Your current details are loaded. Update only what you need."
              : "Create an account to get started with our platform."}
          </p>
          <button className="switch-btn" onClick={() => navigate(editing ? -1 : "/login")}>
            {editing ? "Back to List" : "Go to Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
