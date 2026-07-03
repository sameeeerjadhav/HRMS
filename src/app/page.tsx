"use client";

import { useState } from "react";
import "./login.css";

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const companyLogo = ""; // Will be fetched from API later
  const companyName = "HRMS Portal";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      // Successful login, redirect to the correct dashboard
      window.location.href = data.redirect;
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="ll-logo">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              style={{
                height: "44px",
                maxWidth: "160px",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          ) : (
            <>
              <div className="mark">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <strong>{companyName}</strong>
            </>
          )}
        </div>

        <div className="ll-hero">
          <h1>Manage your workforce with confidence</h1>
          <p>
            A modern HR platform built for teams that move fast — from
            onboarding to payroll, all in one place.
          </p>
        </div>

        <ul className="ll-features">
          <li>
            <span className="dot">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Role-based access for Admin, Manager & Employee
          </li>
          <li>
            <span className="dot">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Custom fields, bulk import & real-time data
          </li>
          <li>
            <span className="dot">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Secure, session-based authentication
          </li>
        </ul>
      </div>

      <div className="login-right">
        <div className="lr-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {errorMsg && (
          <div className="alert-error">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="2,4 12,13 22,4" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control-login"
                placeholder="you@company.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                className="form-control-login"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label="Toggle password visibility"
              >
                {passwordVisible ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-row">
            <span></span>
            <a href="/forgot-password" className="forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
            <svg viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div className="lr-footer">
          &copy; {new Date().getFullYear()} Bühler+Scherler HRMS Portal. All
          rights reserved.
        </div>
      </div>
    </div>
  );
}
