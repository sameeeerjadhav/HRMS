"use client";

import { useState } from "react";

type Project = {
  id: number;
  project_code: string;
  project_name: string;
  client_name: string;
  start_date: string;
  deadline_date: string;
  total_hours: number;
  worked_hours: number;
};

export default function ManagerProjectsClientComponent({
  initialProjects,
  stats,
}: {
  initialProjects: Project[];
  stats: { total: number; totalHrs: number; totalWorked: number; totalExtra: number; deadlineNear: number };
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(
    (p) =>
      !search ||
      p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_code.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
            <svg viewBox="0 0 24 24">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.deadlineNear}</div>
            <div className="stat-label">Deadline Near</div>
            <div className="stat-sub">Within 7 days</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalHrs.toFixed(1)}</div>
            <div className="stat-label">Total Hrs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalWorked.toFixed(1)}</div>
            <div className="stat-label">Hrs Worked</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--red)" }}>
              {stats.totalExtra.toFixed(1)}
            </div>
            <div className="stat-label">Extra Consumed</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
        <div className="search-box" style={{ minWidth: "200px", flex: "0 1 280px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              No projects assigned
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              Projects assigned to you by admin will appear here.
            </div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <h2>
              Projects <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>({filteredProjects.length})</span>
            </h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Timeline</th>
                <th style={{ textAlign: "center" }}>Total Hrs</th>
                <th style={{ textAlign: "center" }}>Worked Hrs</th>
                <th style={{ textAlign: "center" }}>Extra</th>
                <th>Progress</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const extra = Math.max(0, p.worked_hours - p.total_hours);
                const pct = p.total_hours > 0 ? Math.min(100, Math.round((p.worked_hours / p.total_hours) * 100)) : 0;
                const deadlineTime = new Date(p.deadline_date).getTime();
                const nowTime = new Date().getTime();
                const overdue = deadlineTime < nowTime;
                const daysLeft = Math.ceil((deadlineTime - nowTime) / (1000 * 3600 * 24));

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <code
                          style={{
                            fontSize: "11px",
                            background: "var(--surface-2)",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            color: "var(--muted)",
                          }}
                        >
                          {p.project_code}
                        </code>
                      </div>
                      <div className="td-name">{p.project_name}</div>
                    </td>
                    <td className="text-muted text-sm">{p.client_name || "—"}</td>
                    <td className="text-sm">
                      <div style={{ color: "var(--muted)" }}>
                        {new Date(p.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div style={{ color: "var(--text-2)" }}>
                        {new Date(p.deadline_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--brand)" }}>
                      {p.total_hours.toFixed(1)}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--green-text)" }}>
                      {p.worked_hours.toFixed(1)}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 700,
                        color: extra > 0 ? "var(--red)" : "var(--muted)",
                      }}
                    >
                      {extra > 0 ? `+${extra.toFixed(1)}` : "0.0"}
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ flex: 1, height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: pct >= 100 ? "var(--green)" : "var(--blue)",
                              borderRadius: "3px",
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {overdue ? (
                        <span style={{ fontSize: "12px", color: "var(--red)", fontWeight: 700 }}>Overdue</span>
                      ) : daysLeft <= 7 ? (
                        <span style={{ fontSize: "12px", color: "var(--yellow)", fontWeight: 600 }}>
                          {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{daysLeft} days</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
