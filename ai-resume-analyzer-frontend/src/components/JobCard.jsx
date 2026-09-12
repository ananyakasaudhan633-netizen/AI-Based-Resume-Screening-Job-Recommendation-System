import React, { useState } from "react";
import {
  BriefcaseBusiness,
  MapPin,
  Clock3,
  ChevronRight,
  X,
} from "lucide-react";

export default function JobCard({
  title,
  company,
  location,
  experience,
  match,
  skills = [],
  description = "",
  category = "",
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* JOB CARD */}
      <div className="match-row">
        <div className="rank">
          <BriefcaseBusiness size={18} />
        </div>

        <div className="job-title">
          <strong>{title || "Job Title"}</strong>

          <small>
            {company || "Company"}
          </small>
        </div>

        <div className="job-meta">
          <span>
            <MapPin size={14} />
            {location || "Location not specified"}
          </span>

          <span>
            <Clock3 size={14} />
            {experience || "Experience not specified"}
          </span>
        </div>

        <div className="progress">
          <i
            style={{
              width: `${Math.max(
                0,
                Math.min(100, Number(match) || 0)
              )}%`,
            }}
          ></i>
        </div>

        <b>
          {Number(match) || 0}%
        </b>

        <button
          type="button"
          className="outline-btn"
          onClick={() => setShowDetails(true)}
        >
          View Details
          <ChevronRight size={14} />
        </button>
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div
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
          onClick={() => setShowDetails(false)}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "5px",
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* HEADER */}
            <div
              style={{
                paddingRight: "35px",
                marginBottom: "22px",
              }}
            >
              <div className="eyebrow">
                JOB DETAILS
              </div>

              <h2>
                {title || "Job Title"}
              </h2>

              <p style={{ marginTop: "6px" }}>
                <strong>
                  {company || "Company not specified"}
                </strong>
              </p>
            </div>

            {/* MATCH */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <span className="skills">
                <span>{Number(match) || 0}% Match</span>
              </span>

              {category && (
                <span className="skills">
                  <span>{category}</span>
                </span>
              )}
            </div>

            {/* BASIC INFO */}
            <div className="info-list">
              <p>
                <b>Location</b>
                <span>
                  {location || "Not specified"}
                </span>
              </p>

              <p>
                <b>Experience</b>
                <span>
                  {experience || "Not specified"}
                </span>
              </p>
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginTop: "24px" }}>
              <h3>Job Description</h3>

              <p
                style={{
                  marginTop: "10px",
                  lineHeight: "1.7",
                }}
              >
                {description ||
                  "No job description available."}
              </p>
            </div>

            {/* SKILLS */}
            <div style={{ marginTop: "24px" }}>
              <h3>Required Skills</h3>

              {skills.length > 0 ? (
                <div
                  className="skills"
                  style={{ marginTop: "12px" }}
                >
                  {skills.map((skill, index) => (
                    <span key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ marginTop: "10px" }}>
                  No specific skills listed.
                </p>
              )}
            </div>

            {/* CLOSE BUTTON */}
            <div
              style={{
                marginTop: "28px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}