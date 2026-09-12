import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BrainCircuit,
  Target,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function MySkills() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/analysis/latest`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your skills."
        );
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err.message || "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="panel">
            <h2>Loading your skills...</h2>
            <p>
              We are getting your skills from the latest
              resume analysis.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="panel">
            <div className="success">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>

            <button
              className="primary-btn"
              onClick={loadSkills}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ================= DATA ================= */

  const skills = analysis?.skills || [];
  const strengths = analysis?.strengths || [];
  const missingSkills = analysis?.missingSkills || [];
  const role = analysis?.role || "Not available";
  const score = analysis?.score ?? 0;

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">

        {/* ================= HEADER ================= */}

        <div className="page-head">
          <div>
            <div className="eyebrow">
              PROFILE
            </div>

            <h1>My Skills</h1>

            <p>
              Skills detected from your latest resume
              analysis.
            </p>
          </div>

          <button
            className="primary-btn"
            type="button"
            onClick={() =>
              alert(
                "Skills are automatically detected from your uploaded resume."
              )
            }
          >
            <Plus size={17} />
            Add Skill
          </button>
        </div>

        {/* ================= SKILL SUMMARY ================= */}

        <div className="stat-grid">

          <div className="stat-card">
            <div className="stat-icon">
              <BrainCircuit size={22} />
            </div>

            <div>
              <span>Total Skills</span>
              <strong>{skills.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={22} />
            </div>

            <div>
              <span>Recommended Role</span>

              <strong
                style={{
                  fontSize: "15px",
                  lineHeight: "1.3",
                }}
              >
                {role}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Resume Score</span>
              <strong>{score}/100</strong>
            </div>
          </div>

        </div>

        {/* ================= TECHNICAL SKILLS ================= */}

        <section className="panel">

          <div className="panel-title">

            <div>
              <h2>Technical Skills</h2>

              <span>
                Skills automatically detected from your
                resume.
              </span>
            </div>

            <BrainCircuit size={22} />

          </div>

          {skills.length > 0 ? (
            <div className="big-skills">
              {skills.map((skill) => (
                <div key={skill}>
                  <CheckCircle2 size={18} />

                  <strong>{skill}</strong>

                  <span>Detected</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No technical skills were detected from your
                latest resume.
              </p>
            </div>
          )}

        </section>

        {/* ================= STRENGTHS ================= */}

        <section className="panel">

          <div className="panel-title">

            <div>
              <h2>Your Strengths</h2>

              <span>
                Strengths identified from your resume.
              </span>
            </div>

            <CheckCircle2 size={22} />

          </div>

          {strengths.length > 0 ? (
            <div className="big-skills">
              {strengths.map((strength, index) => (
                <div key={`${strength}-${index}`}>
                  <CheckCircle2 size={18} />

                  <strong>{strength}</strong>

                  <span>Strength</span>
                </div>
              ))}
            </div>
          ) : (
            <p>
              Strength information is not available yet.
            </p>
          )}

        </section>

        {/* ================= SKILLS TO IMPROVE ================= */}

        <section className="panel">

          <div className="panel-title">

            <div>
              <h2>Skills to Improve</h2>

              <span>
                Skills that may help you become a stronger
                candidate for your recommended role.
              </span>
            </div>

            <Target size={22} />

          </div>

          {missingSkills.length > 0 ? (
            <div className="big-skills">
              {missingSkills.map((skill, index) => (
                <div key={`${skill}-${index}`}>
                  <Target size={18} />

                  <strong>{skill}</strong>

                  <span>Recommended</span>
                </div>
              ))}
            </div>
          ) : (
            <p>
              No additional skills are currently suggested.
            </p>
          )}

        </section>

      </main>
    </div>
  );
}