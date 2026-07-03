"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EmployeeSidebar() {
  const p = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="logo-text">
          <strong>HRMS Portal</strong>
          <span>My Workspace</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          <Link href="/employee" className={p === "/employee" ? "active" : ""}>
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
        <div className="sidebar-section-label">My Work</div>
        <nav className="sidebar-nav">
          <Link href="/employee/my_leaves" className={p === "/employee/my_leaves" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            My Leaves
          </Link>
          <Link href="/employee/my_regularizations" className={p === "/employee/my_regularizations" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            My Regularizations
          </Link>
          <Link href="/employee/my_tasks" className={p === "/employee/my_tasks" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            My Tasks
          </Link>
          <Link href="/employee/gantt" className={p === "/employee/gantt" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="6" y="10" width="12" height="4" rx="1" />
              <rect x="9" y="16" width="9" height="4" rx="1" />
            </svg>
            My Gantt Chart
          </Link>
          <Link href="/employee/attendance" className={p === "/employee/attendance" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Attendance
          </Link>
          <Link href="/employee/my_acl" className={p === "/employee/my_acl" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="M4.93 4.93l2.83 2.83" />
              <path d="M16.24 16.24l2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
            </svg>
            My ACL
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Account</div>
        <nav className="sidebar-nav">
          <Link href="/employee/profile" className={p === "/employee/profile" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </Link>
          <Link href="/employee/id_card" className={p === "/employee/id_card" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M6 20c0-2.5 2.7-4 6-4s6 1.5 6 4" />
            </svg>
            ID Card
          </Link>
          <Link href="/employee/payslip" className={p === "/employee/payslip" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Payslip
          </Link>
        </nav>
      </div>

      <div className="sidebar-footer">
        <Link href="/" className="sidebar-logout-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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
