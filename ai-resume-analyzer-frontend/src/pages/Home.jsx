import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UploadCloud, ScanSearch, BriefcaseBusiness, GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="landing">
      <Navbar />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">AI-POWERED CAREER ASSISTANT</div>
            <h1>Turn your resume into your <span>next opportunity.</span></h1>
            <p>Upload your resume, discover your strongest skills, find matching job roles, and understand exactly what skills you need to grow.</p>
            <div className="hero-actions">
              <Link to="/upload" className="primary-btn"><UploadCloud size={18}/> Upload Resume</Link>
              <Link to="/register" className="secondary-btn">Get Started <ArrowRight size={17}/></Link>
            </div>
            <div className="trust-row">
              <span><CheckCircle2 size={16}/> Skill extraction</span>
              <span><CheckCircle2 size={16}/> Job matching</span>
              <span><CheckCircle2 size={16}/> Skill-gap analysis</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="resume-sheet">
              <div className="fake-avatar"></div>
              <div className="fake-lines"><i></i><i></i><i></i></div>
              <div className="fake-section">SKILLS</div>
              <div className="skill-pills"><b>Python</b><b>SQL</b><b>Pandas</b><b>ML</b></div>
              <div className="fake-section">EXPERIENCE</div>
              <div className="fake-lines"><i></i><i></i><i></i><i></i></div>
            </div>
            <div className="scan-badge"><ScanSearch size={18}/><span>AI Analysis<br/><strong>87% Match</strong></span></div>
            <div className="float-card card-one"><BriefcaseBusiness size={18}/><span>5 jobs<br/><strong>recommended</strong></span></div>
            <div className="float-card card-two"><GraduationCap size={18}/><span>2 skills<br/><strong>to improve</strong></span></div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="section-heading"><div className="eyebrow">KEY FEATURES</div><h2>Everything you need in one dashboard</h2></div>
          <div className="feature-grid">
            {[
              ["01","Resume Analysis","Extract education, experience and technical skills from a PDF or DOCX resume."],
              ["02","Job Recommendation","Compare your profile with job requirements and show relevant opportunities."],
              ["03","Skill Gap Analysis","See the skills you have, the skills you are missing, and what to learn next."],
              ["04","Career Insights","Get a predicted job role and a simple view of your career-readiness."],
            ].map(([n,t,d]) => <div className="feature-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section id="how-it-works" className="workflow">
          <div className="section-heading"><div className="eyebrow">HOW IT WORKS</div><h2>Simple 5-step workflow</h2></div>
          <div className="steps">
            {["Register / Login","Upload Resume","Extract Skills","Match Jobs","Get Recommendations"].map((x,i)=>
              <div className="step" key={x}><div className="step-number">{i+1}</div><h3>{x}</h3><p>{["Create your profile.","Upload PDF or DOCX.","AI reads your resume.","Calculate matching score.","View jobs and skill gaps."][i]}</p></div>
            )}
          </div>
        </section>
      </main>
     <footer className="footer">
  <div className="footer-content">
    <h3>AI Resume Analyzer</h3>
    <p>
      Analyze your resume, discover skill gaps, and find better job opportunities.
    </p>

    <div className="footer-links">
      <a href="/">Home</a>
      <a href="/jobs">Recommended Jobs</a>
      <a href="/skill-gap">Skill Gap</a>
      <a href="/profile">Profile</a>
    </div>

    <p className="copyright">
      © 2026 AI Resume Analyzer. All rights reserved.
    </p>
  </div>
</footer>
     
    </div>
  );
}