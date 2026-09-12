import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Users,
  FileText,
  BriefcaseBusiness,
  Star,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalJobs: 0,
    recommendations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * NOTE:
       * Agar backend me separate admin dashboard API nahi hai,
       * to current user dashboard API se basic data load hoga.
       */
      const response = await fetch(`${API_BASE}/api/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        throw new Error("Please login first.");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load admin dashboard."
        );
      }

      const info = data.dashboard || {};

      setDashboard({
        totalUsers: info.user ? 1 : 0,
        totalResumes: info.resumeCount || 0,
        totalJobs: 0,
        recommendations: info.analysisCount || 0,
      });
    } catch (err) {
      console.error("Admin Dashboard Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout Error:", err);
    }

    navigate("/login");
  };

  const stats = [
    ["Total Users", dashboard.totalUsers, Users],
    ["Total Resumes", dashboard.totalResumes, FileText],
    ["Total Jobs", dashboard.totalJobs, BriefcaseBusiness],
    ["Recommendations", dashboard.recommendations, Star],
  ];

  return (
    <div className="app-shell">
      <Sidebar admin />

      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="eyebrow">ADMIN PANEL</div>
            <h1>Admin Dashboard</h1>
            <p>
              Overview of system usage and application data.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="secondary-btn"
              onClick={loadAdminDashboard}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="secondary-btn"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <section className="panel">
            <p>Loading admin dashboard...</p>
          </section>
        ) : error ? (
          <section className="panel">
            <div className="error-box">
              {error}
            </div>

            <button
              className="primary-btn"
              onClick={loadAdminDashboard}
            >
              Try Again
            </button>
          </section>
        ) : (
          <>
            <div className="stat-grid">
              {stats.map(([title, number, Icon]) => (
                <div className="stat-card" key={title}>
                  <div className="stat-icon">
                    <Icon size={20} />
                  </div>

                  <div>
                    <span>{title}</span>
                    <strong>{number}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <div className="section-head">
                  <div>
                    <div className="eyebrow">
                      SYSTEM
                    </div>

                    <h2>Admin Overview</h2>

                    <p>
                      Current application activity from the
                      backend.
                    </p>
                  </div>
                </div>

                <div className="admin-overview">
                  <div className="admin-row">
                    <span>Registered Users</span>
                    <strong>{dashboard.totalUsers}</strong>
                  </div>

                  <div className="admin-row">
                    <span>Uploaded Resumes</span>
                    <strong>{dashboard.totalResumes}</strong>
                  </div>

                  <div className="admin-row">
                    <span>Completed Analyses</span>
                    <strong>{dashboard.recommendations}</strong>
                  </div>

                  <div className="admin-row">
                    <span>Available Jobs</span>
                    <strong>{dashboard.totalJobs}</strong>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="section-head">
                  <div>
                    <div className="eyebrow">
                      QUICK ACCESS
                    </div>

                    <h2>Admin Actions</h2>

                    <p>
                      Manage and monitor the application.
                    </p>
                  </div>
                </div>

                <div className="admin-actions">
                  <button
                    className="admin-action"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Users size={20} />
                    <div>
                      <strong>View Dashboard</strong>
                      <span>
                        Open user dashboard
                      </span>
                    </div>
                  </button>

                  <button
                    className="admin-action"
                    onClick={() => navigate("/jobs")}
                  >
                    <BriefcaseBusiness size={20} />
                    <div>
                      <strong>Recommended Jobs</strong>
                      <span>
                        View available opportunities
                      </span>
                    </div>
                  </button>

                  <button
                    className="admin-action"
                    onClick={() => navigate("/skills")}
                  >
                    <Star size={20} />
                    <div>
                      <strong>Skills</strong>
                      <span>
                        View detected skills
                      </span>
                    </div>
                  </button>

                  <button
                    className="admin-action"
                    onClick={() => navigate("/analysis")}
                  >
                    <FileText size={20} />
                    <div>
                      <strong>Analysis</strong>
                      <span>
                        View latest resume analysis
                      </span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}