import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, UserRound, Mail, LockKeyhole } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            role: role.toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
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
          <div className="eyebrow">CREATE ACCOUNT</div>
          <h1>Start your career journey</h1>
          <p>
            Create a student profile to analyze your resume and discover
            suitable roles.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <label>Full name</label>

          <div className="input-wrap">
            <UserRound size={17} />
            <input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label>Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Student</option>
            <option>Recruiter</option>
          </select>

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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-bottom">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}