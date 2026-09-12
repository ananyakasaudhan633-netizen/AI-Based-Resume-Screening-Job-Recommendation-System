import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";

export default function UploadResume() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    setError("");

    if (!selected) {
      setFile(null);
      return;
    }

    const name = selected.name.toLowerCase();

    if (
      !name.endsWith(".pdf") &&
      !name.endsWith(".doc") &&
      !name.endsWith(".docx")
    ) {
      setError("Please upload PDF, DOC or DOCX file.");
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const analyzeResume = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // STEP 1: Upload resume
      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await fetch(
        "http://localhost:5000/api/resume/upload",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(
          uploadData.message || "Resume upload failed."
        );
      }

      // STEP 2: Analyze uploaded resume
      const analysisResponse = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(
          analysisData.message || "Resume analysis failed."
        );
      }

      // STEP 3: Save analysis for Analysis page
      sessionStorage.setItem(
        "resumeAnalysis",
        JSON.stringify(analysisData)
      );

      sessionStorage.setItem(
        "uploadedResumeName",
        file.name
      );

      // STEP 4: Go to analysis page
      navigate("/analysis");
    } catch (err) {
      console.error("Resume Error:", err);

      setError(
        err.message || "Unable to upload/analyze resume."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="eyebrow">
              RESUME ANALYZER
            </div>

            <h1>Upload your resume</h1>

            <p>
              Upload your resume and let AI analyze your
              profile.
            </p>
          </div>
        </div>

        <section className="upload-panel">
          <div className="upload-icon">
            <UploadCloud size={36} />
          </div>

          <h2>
            {file
              ? "Resume selected"
              : "Upload your resume"}
          </h2>

          <p>
            PDF, DOC and DOCX files are supported.
          </p>

          {!file && (
            <label className="primary-btn">
              <UploadCloud size={18} />
              Choose File

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFile}
                hidden
              />
            </label>
          )}

          {file && (
            <div className="selected-file">
              <div>
                <FileText size={24} />

                <strong>{file.name}</strong>
              </div>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {file && (
            <button
              type="button"
              className="primary-btn"
              onClick={analyzeResume}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Analyze Resume
                </>
              )}
            </button>
          )}
        </section>
      </main>
    </div>
  );
}