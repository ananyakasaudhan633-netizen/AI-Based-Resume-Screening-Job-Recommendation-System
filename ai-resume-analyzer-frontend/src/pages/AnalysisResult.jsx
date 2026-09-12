import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  CheckCircle2,
  Target,
  ChevronRight,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
  X,
  MapPin,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const fallbackJobs = [
  {
    title: "Data Analyst",
    company: "ABC Technologies",
    location: "Gorakhpur, India",
    match: 91,
    skills: ["Python", "SQL", "Pandas", "Excel"],
    description:
      "Analyze data, create reports, identify trends and support business decisions using data.",
  },
  {
    title: "Python Developer",
    company: "Tech Solutions",
    location: "Gorakhpur, India",
    match: 78,
    skills: ["Python", "Flask", "SQL", "Git"],
    description:
      "Develop and maintain Python applications, APIs and backend services.",
  },
  {
    title: "ML Engineer",
    company: "Innovate Labs",
    location: "India",
    match: 64,
    skills: ["Python", "Machine Learning", "Scikit-learn", "NumPy"],
    description:
      "Build machine learning models and work on data-driven artificial intelligence solutions.",
  },
  {
    title: "Web Developer",
    company: "Digital Works",
    location: "India",
    match: 52,
    skills: ["HTML", "CSS", "JavaScript", "React"],
    description:
      "Create responsive websites and web applications using modern frontend technologies.",
  },
];

export default function AnalysisResult() {
  const [analysis, setAnalysis] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      // =====================================================
      // 1. GET LATEST ANALYSIS
      // =====================================================

      const analysisResponse = await fetch(
        `${API_BASE}/api/analysis/latest`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(
          analysisData.message || "Unable to load analysis."
        );
      }

      setAnalysis(analysisData.analysis);

      // =====================================================
      // 2. GET DASHBOARD / USER INFORMATION
      // =====================================================

      const dashboardResponse = await fetch(
        `${API_BASE}/api/dashboard`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const dashboardData = await dashboardResponse.json();

      if (dashboardResponse.ok && dashboardData.success) {
        setDashboard(dashboardData.dashboard);
      }

      // =====================================================
      // 3. GET RECOMMENDED JOBS
      // =====================================================

      const jobsResponse = await fetch(
        `${API_BASE}/api/jobs/recommended`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const jobsData = await jobsResponse.json();

      if (jobsResponse.ok && jobsData.success) {
        const backendJobs = jobsData.jobs || [];

        const formattedJobs = backendJobs
          .slice(0, 4)
          .map((job) => ({
            title: job.title || "Job Opportunity",
            company: job.company || "Company",
            location: job.location || "India",
            match: Number(job.match) || 0,
            skills: Array.isArray(job.skills)
              ? job.skills
              : [],
            description:
              job.description ||
              "No job description available.",
          }));

        setJobs(
          formattedJobs.length > 0
            ? formattedJobs
            : fallbackJobs
        );
      } else {
        setJobs(fallbackJobs);
      }
    } catch (err) {
      console.error("Analysis loading error:", err);

      setError(
        err.message || "Unable to load resume analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div
            style={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Loader2
              size={36}
              className="spin"
            />

            <h2>Loading your analysis...</h2>

            <p>
              Please wait while we load your resume
              analysis.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="eyebrow">
                RESUME ANALYZER
              </div>

              <h1>Resume Analysis</h1>

              <p>
                We couldn't load your analysis.
              </p>
            </div>
          </div>

          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // SAFE DATA
  // =========================================================

  const skills = analysis?.skills || [];
  const missingSkills = analysis?.missingSkills || [];
  const strengths = analysis?.strengths || [];

  const score = analysis?.score ?? 0;
  const role = analysis?.role || "Not determined";

  const userName =
    dashboard?.user?.name || "User";

  const userEmail =
    dashboard?.user?.email || "Not available";

  const education =
    dashboard?.user?.education || "B.Tech (IT)";

  // =========================================================
  // OPEN JOB DETAILS
  // =========================================================

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  // =========================================================
  // CLOSE JOB DETAILS
  // =========================================================

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="page-head">
          <div>
            <div className="eyebrow">
              ANALYSIS COMPLETE
            </div>

            <h1>Resume Analysis Result</h1>

            <p>
              Your resume has been analyzed successfully.
            </p>
          </div>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <div className="success">
          <CheckCircle2 size={19} />
          Resume analyzed successfully!
        </div>

        {/* =================================================
            RESUME SCORE
        ================================================= */}

        <section className="panel score-panel">
          <div className="score-left">
            <div>
              <div className="eyebrow">
                RESUME SCORE
              </div>

              <h2>Your Resume Score</h2>

              <p>
                Your score is based on the skills and
                information detected in your resume.
              </p>
            </div>
          </div>

          <div className="score-circle">
            <strong>{score}</strong>
            <span>/100</span>
          </div>
        </section>

        {/* =================================================
            PERSONAL INFORMATION + SKILLS
        ================================================= */}

        <div className="analysis-grid">

          {/* PERSONAL INFORMATION */}

          <section className="panel">
            <h2>Personal Information</h2>

            <div className="info-list">

              <p>
                <b>Name</b>
                <span>{userName}</span>
              </p>

              <p>
                <b>Email</b>
                <span>{userEmail}</span>
              </p>

              <p>
                <b>Education</b>
                <span>{education}</span>
              </p>

              <p>
                <b>Experience</b>
                <span>Fresher</span>
              </p>

            </div>
          </section>

          {/* EXTRACTED SKILLS */}

          <section className="panel">
            <h2>Extracted Skills</h2>

            {skills.length > 0 ? (
              <div className="skills">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No skills detected.</p>
            )}

            {/* PREDICTED ROLE */}

            <div className="predicted">
              <div className="pred-icon">
                <Target size={21} />
              </div>

              <div>
                <small>
                  Predicted Job Role
                </small>

                <strong>{role}</strong>

                <em>
                  AI Recommendation
                </em>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            STRENGTHS + MISSING SKILLS
        ================================================= */}

        <div className="analysis-grid">

          {/* STRENGTHS */}

          <section className="panel">
            <h2>Your Strengths</h2>

            {strengths.length > 0 ? (
              <div className="strength-list">
                {strengths.map((item, index) => (
                  <div
                    className="strength-item"
                    key={`${item}-${index}`}
                  >
                    <CheckCircle2 size={18} />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>
                No specific strengths were identified.
              </p>
            )}
          </section>

          {/* SKILLS TO IMPROVE */}

          <section className="panel">
            <h2>Skills to Improve</h2>

            {missingSkills.length > 0 ? (
              <div className="skills">
                {missingSkills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>
                Great! No major missing skills detected.
              </p>
            )}
          </section>
        </div>

        {/* =================================================
            RECOMMENDED JOBS
        ================================================= */}

        <section className="panel">

          <div className="panel-title">
            <div>
              <h2>Top Recommended Jobs</h2>

              <span>
                Based on your profile and detected skills
              </span>
            </div>

            <BriefcaseBusiness size={22} />
          </div>

          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div
                className="match-row"
                key={`${job.title}-${index}`}
              >

                <div className="rank">
                  {index + 1}
                </div>

                <div className="job-title">
                  <strong>{job.title}</strong>

                  <small>{job.company}</small>
                </div>

                <div className="progress">
                  <i
                    style={{
                      width: `${Math.min(
                        Math.max(job.match, 0),
                        100
                      )}%`,
                    }}
                  ></i>
                </div>

                <b>{job.match}%</b>

                <button
                  type="button"
                  className="outline-btn"
                  onClick={() =>
                    handleViewDetails(job)
                  }
                >
                  View Details

                  <ChevronRight size={14} />
                </button>

              </div>
            ))
          ) : (
            <p>
              No recommended jobs available yet.
            </p>
          )}

        </section>

      </main>

      {/* =====================================================
          JOB DETAILS MODAL
      ===================================================== */}

      {selectedJob && (
        <div
          onClick={closeJobDetails}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.20)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div className="eyebrow">
                  JOB DETAILS
                </div>

                <h2
                  style={{
                    marginTop: "5px",
                    marginBottom: "6px",
                  }}
                >
                  {selectedJob.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    opacity: 0.7,
                  }}
                >
                  {selectedJob.company}
                </p>
              </div>

              <button
                type="button"
                onClick={closeJobDetails}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "5px",
                  display: "flex",
                }}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* MATCH */}

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: "#f7f8fa",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <strong>
                  Resume Match
                </strong>

                <strong>
                  {selectedJob.match}%
                </strong>
              </div>

              <div
                style={{
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      Math.max(
                        selectedJob.match,
                        0
                      ),
                      100
                    )}%`,
                    background:
                      "currentColor",
                    borderRadius: "10px",
                  }}
                ></div>
              </div>
            </div>

            {/* LOCATION */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <MapPin size={18} />

              <span>
                {selectedJob.location ||
                  "India"}
              </span>
            </div>

            {/* DESCRIPTION */}

            <div style={{ marginBottom: "22px" }}>
              <h3>Job Description</h3>

              <p
                style={{
                  lineHeight: 1.7,
                  opacity: 0.8,
                }}
              >
                {selectedJob.description ||
                  "No description available."}
              </p>
            </div>

            {/* REQUIRED SKILLS */}

            <div style={{ marginBottom: "25px" }}>
              <h3>Required Skills</h3>

              {selectedJob.skills &&
              selectedJob.skills.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {selectedJob.skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        style={{
                          padding:
                            "7px 12px",
                          borderRadius: "20px",
                          background:
                            "#f1f3f5",
                          fontSize: "13px",
                        }}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p>
                  No specific skills listed.
                </p>
              )}
            </div>

            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={closeJobDetails}
              className="outline-btn"
              style={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}