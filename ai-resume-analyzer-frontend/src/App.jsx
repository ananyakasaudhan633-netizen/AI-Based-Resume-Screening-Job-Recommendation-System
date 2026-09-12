import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import AnalysisResult from "./pages/AnalysisResult";
import MySkills from "./pages/MySkills";
import RecommendedJobs from "./pages/RecommendedJobs";
import SkillGap from "./pages/SkillGap";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadResume />} />
      <Route path="/analysis" element={<AnalysisResult />} />
      <Route path="/skills" element={<MySkills />} />
      <Route path="/jobs" element={<RecommendedJobs />} />
      <Route path="/skill-gap" element={<SkillGap />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}