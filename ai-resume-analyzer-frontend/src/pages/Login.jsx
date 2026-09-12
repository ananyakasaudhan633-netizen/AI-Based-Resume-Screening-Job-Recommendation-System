import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, LockKeyhole } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/">
          <BrainCircuit size={23} /> AI Resume Analyzer
        </Link>
      </div>

      <div className="auth-box">
        <div className="auth-copy">
          <div className="eyebrow">WELCOME BACK</div>
          <h1>Login to your account</h1>
          <p>
            Continue your career journey with AI-powered resume insights.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email address</label>

          <div className="input-wrap">
            <Mail size={17} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="input-wrap">
            <LockKeyhole size={17} />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label className="check">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot">Forgot password?</a>
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <button
            className="primary-btn full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-bottom">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}