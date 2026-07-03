"use client";

import Link from "next/link";
import { useState } from "react";

type TeamLeave = {
  id: number;
  name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
};

export default function ManagerDashboardClientComponent({
  stats,
  teamLeaves,
  teamMembers,
}: {
  stats: { myTeam: number; pendingLvs: number; todayPresent: number; openTasks: number };
  teamLeaves: TeamLeave[];
  teamMembers: TeamMember[];
}) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Welcome back, Manager</h1>
          <p>Your team overview for today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.myTeam}</div>
            <div className="stat-label">Team Size</div>
            <div className="stat-sub">Direct reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.pendingLvs}</div>
            <div className="stat-label">Pending Leaves</div>
            <div className="stat-sub">Action needed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.todayPresent}</div>
            <div className="stat-label">Present Today</div>
            <div className="stat-sub">Checked in</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.openTasks}</div>
            <div className="stat-label">Open Tasks</div>
            <div className="stat-sub">In progress</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px" }}>
        {/* Team Leave Requests */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <h2>Team Leave Requests</h2>
            <Link href="/manager/team_leaves" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaves.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>No pending leave requests</td>
                </tr>
              ) : (
                teamLeaves.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold">{l.name}</td>
                    <td className="text-muted text-sm">{l.leave_type}</td>
                    <td className="text-sm">{new Date(l.start_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</td>
                    <td className="text-sm">{new Date(l.end_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "yellow"
                        }`}
                      >
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                padding: "16px",
              }}
            >
              <Link href="/manager/tasks" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Assign Task
              </Link>
              <Link href="/manager/regularizations" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Regularizations
              </Link>
              <Link href="/manager/team" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                View Team
              </Link>
              <Link href="/manager/projects" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Projects
              </Link>
            </div>
          </div>

          {/* Team Members */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <h2>My Team</h2>
              <Link href="/manager/team" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={2}>No team members assigned</td>
                  </tr>
                ) : (
                  teamMembers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="td-user">
                          <div className="td-avatar">{m.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="td-name">{m.name}</div>
                            <div className="td-sub">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${m.status === "active" ? "green" : "red"}`}>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
