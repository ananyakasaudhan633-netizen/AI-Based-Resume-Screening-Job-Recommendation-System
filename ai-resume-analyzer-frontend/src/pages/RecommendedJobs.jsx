import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import {
  AlertTriangle,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function RecommendedJobs() {
  const [analysis, setAnalysis] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      // ---------------------------------------------------
      // 1. Latest Resume Analysis
      // ---------------------------------------------------
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
          analysisData.message ||
            "Unable to load your resume analysis."
        );
      }

      setAnalysis(analysisData.analysis);

      // ---------------------------------------------------
      // 2. Recommended Jobs From Backend
      // ---------------------------------------------------
      const jobsResponse = await fetch(
        `${API_BASE}/api/jobs/recommended`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const jobsData = await jobsResponse.json();

      if (!jobsResponse.ok || !jobsData.success) {
        throw new Error(
          jobsData.message ||
            "Unable to load recommended jobs."
        );
      }

      setRecommendedJobs(jobsData.jobs || []);
    } catch (err) {
      console.error("Recommended jobs error:", err);

      setError(
        err.message ||
          "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <div className="panel">
            <h2>Loading recommended jobs...</h2>

            <p>
              We are checking your latest resume analysis.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------
  // ERROR
  // ---------------------------------------------------
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
              onClick={loadRecommendations}
              type="button"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const skills = analysis?.skills || [];
  const role = analysis?.role || "Not available";

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">

        {/* HEADER */}
        <div className="page-head">
          <div>
            <div className="eyebrow">
              OPPORTUNITIES
            </div>

            <h1>Recommended Jobs</h1>

            <p>
              Jobs ranked according to your latest resume
              analysis and identified skills.
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseBusiness size={22} />
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
        </div>

        {/* SKILL SUMMARY */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Your Skills</h2>

              <span>
                These skills are being used to calculate job
                matching.
              </span>
            </div>
          </div>

          {skills.length > 0 ? (
            <div className="skills">
              {skills.map((skill, index) => (
                <span key={`${skill}-${index}`}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>
              No skills were detected from your latest resume.
            </p>
          )}
        </section>

        {/* JOB LIST */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Top Job Matches</h2>

              <span>
                Higher percentage means better skill matching.
              </span>
            </div>

            <BriefcaseBusiness size={22} />
          </div>

          {recommendedJobs.length > 0 ? (
            <div className="job-list">
              {recommendedJobs.map((job) => (
                <JobCard
                  key={`${job.id}-${job.title}`}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  experience={
                    job.experience || "Not specified"
                  }
                  match={job.match ?? 0}
                  skills={job.skills || []}
                  description={
                    job.description || ""
                  }
                  category={
                    job.category || ""
                  }
                />
              ))}
            </div>
          ) : (
            <p>
              No recommended jobs available.
            </p>
          )}
        </section>

      </main>
    </div>
  );
}