import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <BrainCircuit size={22} />
        </span>

        <span>AI Resume Analyzer</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>

        <a href="/#features">Features</a>

        <a href="/#how-it-works">How it works</a>

        <Link to="/login" className="nav-login">
          Login
        </Link>

        <Link to="/register" className="nav-register">
          Register
          <ArrowRight size={16} />
        </Link>
      </nav>
    </header>
  );
}