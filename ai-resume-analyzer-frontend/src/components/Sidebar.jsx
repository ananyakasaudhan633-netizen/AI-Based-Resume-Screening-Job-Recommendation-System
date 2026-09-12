import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  ShieldCheck,
  FileText,
  Menu,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const userLinks = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/upload", "Upload Resume", Upload],
  ["/analysis", "Analysis Result", FileText],
  ["/skills", "My Skills", BrainCircuit],
  ["/jobs", "Recommended Jobs", BriefcaseBusiness],
  ["/skill-gap", "Skill Gap Analysis", ChartNoAxesCombined],
  ["/profile", "My Profile", UserRound],
];

const adminLinks = [
  ["/admin", "Admin Dashboard", ShieldCheck],
  ["/jobs", "Manage Jobs", BriefcaseBusiness],
  ["/profile", "Profile", UserRound],
];

export default function Sidebar({ admin = false }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = admin ? adminLinks : userLinks;

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      sessionStorage.clear();
      navigate("/login");
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Link
          to={admin ? "/admin" : "/dashboard"}
          className="sidebar-brand"
          onClick={closeMobileMenu}
        >
          <span className="brand-icon">
            <BrainCircuit size={21} />
          </span>

          <span>
            AI Resume
            <br />
            Analyzer
          </span>
        </Link>

        <div className="side-label">
          {admin ? "ADMIN" : "STUDENT"}
        </div>

        <nav className="side-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/admin"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `side-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="side-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}