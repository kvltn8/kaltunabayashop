import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <span className="eyebrow">Join Kaltun's</span>
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input id="first_name" value={form.first_name} onChange={update("first_name")} required />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" value={form.last_name} onChange={update("last_name")} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={update("username")} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update("password")}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-gold btn-block" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          Already shopping with us? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
