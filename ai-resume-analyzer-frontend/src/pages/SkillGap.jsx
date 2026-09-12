import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  BookOpen,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const DEFAULT_ANALYSIS = {
  role: "AI / ML Engineer",
  score: 95,
  skills: [
    "Python",
    "Java",
    "C++",
    "Machine Learning",
    "Data Analysis",
    "SQL",
    "Pandas",
    "Matplotlib",
    "Scikit-learn",
    "Git",
  ],
  missing_skills: ["Pandas", "NumPy", "Deep Learning"],
  strengths: [
    "Python programming",
    "Machine Learning",
    "Data Analysis",
    "Problem Solving",
  ],
};

export default function SkillGap() {
  const [analysis, setAnalysis] = useState(DEFAULT_ANALYSIS);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analysis/latest`, {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data) {
        setAnalysis({
          ...DEFAULT_ANALYSIS,
          ...data,
        });
      }
    } catch (error) {
      console.error("Skill Gap Error:", error);
    }
  };

  const currentSkills = analysis.skills || [];
  const missingSkills = analysis.missing_skills || [];
  const strengths = analysis.strengths || [];

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="eyebrow">CAREER ANALYSIS</div>

            <h1>Skill Gap</h1>

            <p>
              Identify the skills you have and the skills you should improve
              for your recommended career.
            </p>
          </div>
        </div>

        {/* STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <div className="stat-label">Current Skills</div>
              <div className="stat-value">{currentSkills.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <div className="stat-label">Skills to Improve</div>
              <div className="stat-value">{missingSkills.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <div className="stat-label">Resume Score</div>
              <div className="stat-value">
                {analysis.score}
                <span className="stat-small">/100</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={20} />
            </div>

            <div>
              <div className="stat-label">Recommended Role</div>
              <div className="stat-value stat-role">
                {analysis.role}
              </div>
            </div>
          </div>
        </section>

        {/* CAREER TARGET */}
        <section className="panel skill-gap-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">YOUR CAREER TARGET</div>

              <h2>{analysis.role}</h2>

              <p>
                These skills are based on your latest resume analysis.
              </p>
            </div>
          </div>

          <div className="skill-gap-list">
            {missingSkills.map((skill, index) => (
              <div className="skill-gap-item" key={skill}>
                <div className="skill-gap-number">
                  {index + 1}
                </div>

                <div className="skill-gap-content">
                  <h3>{skill}</h3>

                  <p>
                    Consider learning and practicing {skill} to improve your
                    profile for <strong>{analysis.role}</strong>.
                  </p>
                </div>

                <div className="skill-gap-badge">
                  <AlertTriangle size={15} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CURRENT SKILLS */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">ALREADY HAVE</div>

              <h2>Your Current Skills</h2>

              <p>
                Skills detected from your uploaded resume.
              </p>
            </div>
          </div>

          <div className="big-skills">
            {currentSkills.map((skill) => (
              <div className="big-skill-card" key={skill}>
                <CheckCircle2 size={18} />

                <div>
                  <strong>{skill}</strong>
                  <span>Detected</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STRENGTHS */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">YOUR STRENGTHS</div>

              <h2>Strong Areas</h2>

              <p>
                Areas where your resume already shows good potential.
              </p>
            </div>
          </div>

          <div className="strength-list">
            {strengths.map((strength) => (
              <div className="strength-item" key={strength}>
                <div className="strength-icon">
                  <BookOpen size={18} />
                </div>

                <strong>{strength}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}