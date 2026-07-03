"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function ManagerSidebar() {
  const p = usePathname();
  const [openSub, setOpenSub] = useState<string | null>(null);

  const toggleSub = (id: string) => {
    setOpenSub(openSub === id ? null : id);
  };

  // Auto-open on mount if child is active
  useEffect(() => {
    if (p.includes("/manager/regularizations")) setOpenSub("regSub");
  }, [p]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
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
          <span>Manager Panel</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          <Link href="/manager" className={p === "/manager" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href="/manager/projects" className={p.startsWith("/manager/projects") ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
            My Projects
          </Link>
          <Link href="/manager/tasks" className={p.startsWith("/manager/tasks") ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Tasks
          </Link>
          <Link href="/manager/gantt" className={p === "/manager/gantt" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="6" y="10" width="12" height="4" rx="1" />
              <rect x="9" y="16" width="9" height="4" rx="1" />
            </svg>
            Gantt Chart
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Team</div>
        <nav className="sidebar-nav">
          <Link href="/manager/team" className={p === "/manager/team" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            My Team
          </Link>
          <Link href="/manager/team_leaves" className={p === "/manager/team_leaves" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Team Leaves
          </Link>
          <Link href="/manager/regularizations" className={p === "/manager/regularizations" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Regularizations
          </Link>
          <Link href="/manager/acl_requests" className={p === "/manager/acl_requests" ? "active" : ""}>
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            ACL Requests
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
