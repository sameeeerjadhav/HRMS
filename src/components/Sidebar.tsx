"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const p = usePathname();
  const companyLogo = ""; // Mock

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {companyLogo ? (
          <img src={companyLogo} alt="Logo" />
        ) : (
          <>
            <div className="logo-mark">
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="logo-text">
              <strong>HRMS Portal</strong>
              <span>Admin Console</span>
            </div>
          </>
        )}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          <Link href="/admin" className={p === "/admin" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Projects</div>
        <nav className="sidebar-nav">
          <Link
            href="/admin/projects"
            className={p.startsWith("/admin/projects") ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
            Projects
          </Link>
          <Link
            href="/admin/project_expenses"
            className={p === "/admin/project_expenses" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Expenses
          </Link>
          <Link
            href="/admin/invoices"
            className={p === "/admin/invoices" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Invoices
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Workforce</div>
        <nav className="sidebar-nav">
          <Link
            href="/admin/users"
            className={p === "/admin/users" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            System Users
          </Link>
          <Link
            href="/admin/employees"
            className={p.startsWith("/admin/employees") ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Employee Directory
          </Link>
          <Link
            href="/admin/organogram"
            className={p === "/admin/organogram" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <rect x="8" y="2" width="8" height="6" rx="1" />
              <rect x="2" y="16" width="8" height="6" rx="1" />
              <rect x="14" y="16" width="8" height="6" rx="1" />
              <path d="M12 8v4" />
              <path d="M6 16v-4h12v4" />
            </svg>
            Organogram
          </Link>
          <Link
            href="/admin/locations"
            className={p === "/admin/locations" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Office Locations
          </Link>
          <Link href="/admin/kpi" className={p === "/admin/kpi" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Employee KPIs
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Payroll & Payslips</div>
        <nav className="sidebar-nav">
          <Link
            href="/admin/payroll"
            className={p.startsWith("/admin/payroll") || p.startsWith("/admin/salary_structure") ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Salary Structure
          </Link>
          <Link
            href="/admin/payslips"
            className={p === "/admin/payslips" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Payslips
          </Link>
          <Link
            href="/admin/fnf_settlement"
            className={p === "/admin/fnf_settlement" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            F&F Settlement
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Time & Attendance</div>
        <nav className="sidebar-nav">
          <Link
            href="/admin/attendance"
            className={p === "/admin/attendance" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Attendance
          </Link>
          <Link
            href="/admin/regularizations"
            className={p === "/admin/regularizations" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 22v-7l-3 3" />
              <path d="M12 22v-7l3 3" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Regularizations
          </Link>
          <Link
            href="/admin/leaves"
            className={p === "/admin/leaves" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Leave Policy
          </Link>
          <Link
            href="/admin/leave_requests"
            className={p === "/admin/leave_requests" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Leave Requests
          </Link>
          <Link
            href="/admin/holidays"
            className={p === "/admin/holidays" ? "active" : ""}
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01" />
              <path d="M12 14h.01" />
              <path d="M16 14h.01" />
              <path d="M8 18h.01" />
              <path d="M12 18h.01" />
              <path d="M16 18h.01" />
            </svg>
            Holidays
          </Link>
        </nav>
      </div>

      <div className="sidebar-footer">
        <Link
          href="/admin/settings"
          className={p === "/admin/settings" ? "active" : ""}
          style={{ marginBottom: "8px" }}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </Link>
        <Link href="/" className="sidebar-logout-btn">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
