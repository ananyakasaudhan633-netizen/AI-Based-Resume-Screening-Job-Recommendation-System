import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { UserRound, Save, Mail, GraduationCap, BriefcaseBusiness, BarChart3 } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    education: "B.Tech Information Technology",
    role: "Not analyzed yet",
    score: 0,
    skillsCount: 0,
    resumeCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, analysisRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/analysis/latest`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (dashboardRes.status === 401 || analysisRes.status === 401) {
        throw new Error("Please login first.");
      }

      const dashboardData = await dashboardRes.json();
      const analysisData = await analysisRes.json();

      const dashboard = dashboardData.dashboard || {};
      const analysis = analysisData.analysis || {};

      setProfile({
        name: dashboard.user?.name || "User",
        email: dashboard.user?.email || "Not available",
        education: "B.Tech Information Technology",
        role: dashboard.recommendedRole || analysis.role || "Not analyzed yet",
        score: dashboard.resumeScore || analysis.score || 0,
        skillsCount:
          dashboard.skillsCount ??
          (Array.isArray(analysis.skills) ? analysis.skills.length : 0),
        resumeCount: dashboard.resumeCount || 0,
      });
    } catch (err) {
      console.error("Profile error:", err);
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main narrow">
          <div className="page-head">
            <div>
              <div className="eyebrow">ACCOUNT</div>
              <h1>My Profile</h1>
              <p>Loading your profile...</p>
            </div>
          </div>

          <section className="panel form-panel">
            <p>Loading profile information...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main narrow">
          <div className="page-head">
            <div>
              <div className="eyebrow">ACCOUNT</div>
              <h1>My Profile</h1>
              <p>Manage your basic profile information.</p>
            </div>
          </div>

          <section className="panel form-panel">
            <div className="profile-large">
              <UserRound size={30} />
            </div>

            <div className="error-box">
              {error}
            </div>

            <button className="primary-btn" onClick={loadProfile}>
              Try Again
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main narrow">
        <div className="page-head">
          <div>
            <div className="eyebrow">ACCOUNT</div>
            <h1>My Profile</h1>
            <p>Manage your basic profile information.</p>
          </div>
        </div>

        <section className="panel form-panel">
          <div className="profile-large">
            <UserRound size={30} />
          </div>

          <label>Full name</label>
          <div className="input-with-icon">
            <UserRound size={17} />
            <input value={profile.name} readOnly />
          </div>

          <label>Email</label>
          <div className="input-with-icon">
            <Mail size={17} />
            <input value={profile.email} readOnly />
          </div>

          <label>Education</label>
          <div className="input-with-icon">
            <GraduationCap size={17} />
            <input value={profile.education} readOnly />
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-card">
              <BriefcaseBusiness size={20} />
              <div>
                <span>Recommended Role</span>
                <strong>{profile.role}</strong>
              </div>
            </div>

            <div className="profile-info-card">
              <BarChart3 size={20} />
              <div>
                <span>Resume Score</span>
                <strong>{profile.score}/100</strong>
              </div>
            </div>

            <div className="profile-info-card">
              <UserRound size={20} />
              <div>
                <span>Skills Detected</span>
                <strong>{profile.skillsCount}</strong>
              </div>
            </div>

            <div className="profile-info-card">
              <GraduationCap size={20} />
              <div>
                <span>Resumes Uploaded</span>
                <strong>{profile.resumeCount}</strong>
              </div>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => alert("Your profile information is already synced with the backend.")}
          >
            <Save size={17} />
            Save Changes
          </button>
        </section>
      </main>
    </div>
  );
}