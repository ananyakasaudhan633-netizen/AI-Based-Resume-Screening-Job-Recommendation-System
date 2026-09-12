import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FileText,
  BriefcaseBusiness,
  BrainCircuit,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load dashboard."
        );
      }

      setDashboard(data.dashboard);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.message || "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="panel">
            <h2>Loading dashboard...</h2>
            <p>
              Please wait while we load your latest resume
              information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="panel">
            <div
              className="error-message"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={loadDashboard}
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const user = dashboard?.user || {};

  const resumeCount = dashboard?.resumeCount ?? 0;
  const analysisCount = dashboard?.analysisCount ?? 0;
  const skillsCount = dashboard?.skillsCount ?? 0;
  const resumeScore = dashboard?.resumeScore ?? 0;

  const recommendedRole =
    dashboard?.recommendedRole || "Not available";

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">

        {/* HEADER */}
        <div className="page-head">
          <div>
            <div className="eyebrow">
              STUDENT DASHBOARD
            </div>

            <h1>
              Welcome back, {user.name || "Student"} 👋
            </h1>

            <p>
              Track your resume analysis, skills and job
              recommendations from one place.
            </p>
          </div>

          <Link
            to="/upload-resume"
            className="primary-btn"
          >
            <UploadCloud size={18} />
            Upload Resume
          </Link>
        </div>

        {/* STAT CARDS */}
        <div className="stat-grid">

          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Resumes Analyzed</span>
              <strong>{analysisCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <span>Recommended Role</span>

              <strong
                style={{
                  fontSize: "16px",
                  lineHeight: "1.3",
                }}
              >
                {recommendedRole}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BrainCircuit size={22} />
            </div>

            <div>
              <span>Skills Identified</span>
              <strong>{skillsCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Resume Score</span>

              <strong>
                {resumeScore}
                <small
                  style={{
                    fontSize: "13px",
                    marginLeft: "3px",
                  }}
                >
                  /100
                </small>
              </strong>
            </div>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="dashboard-grid">

          {/* RESUME OVERVIEW */}
          <section className="panel">

            <div className="panel-title">
              <div>
                <h2>Resume Overview</h2>

                <span>
                  Your current resume analysis summary.
                </span>
              </div>

              <FileText size={22} />
            </div>

            <div className="overview-row">

              <div>
                <span>Total Resumes</span>
                <strong>{resumeCount}</strong>
              </div>

              <div>
                <span>Analyses</span>
                <strong>{analysisCount}</strong>
              </div>

              <div>
                <span>Skills</span>
                <strong>{skillsCount}</strong>
              </div>

            </div>

          </section>

          {/* CAREER RECOMMENDATION */}
          <section className="panel">

            <div className="panel-title">
              <div>
                <h2>Career Recommendation</h2>

                <span>
                  Based on your latest resume analysis.
                </span>
              </div>

              <BriefcaseBusiness size={22} />
            </div>

            <div className="recommendation-box">

              <span>Recommended Role</span>

              <h2>
                {recommendedRole}
              </h2>

              <p>
                Continue improving your skills and resume
                to increase your job matching opportunities.
              </p>

              <Link
                to="/recommended-jobs"
                className="outline-btn"
              >
                View Recommended Jobs
                <ArrowRight size={16} />
              </Link>

            </div>

          </section>

        </div>

        {/* QUICK ACTIONS */}
        <section className="panel">

          <div className="panel-title">

            <div>
              <h2>Quick Actions</h2>

              <span>
                Continue working on your career profile.
              </span>
            </div>

            <CheckCircle2 size={22} />

          </div>

          <div className="quick">

            <Link
              to="/upload-resume"
              className="action-btn blue"
            >
              <UploadCloud size={20} />

              <div>
                <strong>Upload Resume</strong>
                <span>Analyze a new resume</span>
              </div>

              <ArrowRight
                size={17}
                style={{ marginLeft: "auto" }}
              />
            </Link>

            <Link
              to="/my-skills"
              className="action-btn green"
            >
              <BrainCircuit size={20} />

              <div>
                <strong>My Skills</strong>
                <span>View your detected skills</span>
              </div>

              <ArrowRight
                size={17}
                style={{ marginLeft: "auto" }}
              />
            </Link>

            <Link
              to="/recommended-jobs"
              className="action-btn purple"
            >
              <BriefcaseBusiness size={20} />

              <div>
                <strong>Recommended Jobs</strong>
                <span>Explore suitable jobs</span>
              </div>

              <ArrowRight
                size={17}
                style={{ marginLeft: "auto" }}
              />
            </Link>

          </div>

        </section>

      </main>
    </div>
  );
}