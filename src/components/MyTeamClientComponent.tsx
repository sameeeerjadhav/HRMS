"use client";

import { useState } from "react";

type TeamMember = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  employee_type: string;
  status: string;
  date_of_joining: string;
  location: string;
};

export default function MyTeamClientComponent({
  teamMembers,
  deptName,
}: {
  teamMembers: TeamMember[];
  deptName: string;
}) {
  const [search, setSearch] = useState("");

  const filteredMembers = teamMembers.filter(
    (m) =>
      !search ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{deptName || "My Team"}</h1>
          <p>{teamMembers.length} team member{teamMembers.length !== 1 ? "s" : ""} in your department</p>
        </div>
        <div className="page-header-actions">
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{teamMembers.length}</div>
            <div className="stat-label">Total Members</div>
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
            <div className="stat-value">{teamMembers.filter(m => m.status.toLowerCase() === "active").length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
            <svg viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{teamMembers.filter(m => m.employee_type === "FTE").length}</div>
            <div className="stat-label">FTE</div>
          </div>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="table-wrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted-light)"
              strokeWidth="1.5"
              style={{ display: "block", margin: "0 auto 12px" }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
              No team members yet
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              Employees in the {deptName} department will appear here.
            </div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Employee</th>
                <th>Job Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m, i) => (
                <tr key={m.id}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{m.first_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{m.first_name} {m.last_name}</div>
                        <div className="td-sub">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{m.job_title || "—"}</td>
                  <td>
                    <span className={`badge ${m.employee_type === "FTE" ? "badge-blue" : "badge-yellow"}`}>
                      {m.employee_type || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.status.toLowerCase() === "active" ? "badge-green" : "badge-red"}`}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{m.phone || "—"}</td>
                  <td className="text-muted text-sm">{m.location || "—"}</td>
                  <td className="text-muted text-sm">
                    {m.date_of_joining ? new Date(m.date_of_joining).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontSize: "13.5px" }}>
              No members match your search.
            </div>
          )}
        </div>
      )}
    </>
  );
}
