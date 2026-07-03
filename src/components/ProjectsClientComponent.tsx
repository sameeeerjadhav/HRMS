"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import DeleteModal from "./DeleteModal";
import { deleteProject } from "@/app/actions/projectActions";

type Project = {
  id: number;
  project_code: string;
  project_name: string;
  client_name: string;
  manager_name: string;
  deadline_date: string;
  total_hours: number;
  worked_hours: number;
  status: string;
};

export default function ProjectsClientComponent({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProjects = initialProjects.filter((p) => {
    const matchSearch =
      !search ||
      p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_code.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase());

    const matchDateFrom = !dateFrom || new Date(p.deadline_date) >= new Date(dateFrom);
    const matchDateTo = !dateTo || new Date(p.deadline_date) <= new Date(dateTo);

    return matchSearch && matchDateFrom && matchDateTo;
  });

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "14px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <div className="search-box" style={{ minWidth: "180px", flex: "0 1 240px" }}>
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
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
          Deadline:
        </span>
        <input
          type="date"
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>to</span>
        <input
          type="date"
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button
          className="btn btn-ghost btn-sm"
          onClick={clearFilters}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Projects{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({filteredProjects.length})
            </span>
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Manager</th>
              <th>Deadline</th>
              <th style={{ textAlign: "center" }}>Total Hrs</th>
              <th style={{ textAlign: "center" }}>Worked</th>
              <th>Progress</th>
              <th style={{ width: "120px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>
                  No projects found.{" "}
                  <Link href="/admin/add_project" style={{ color: "var(--brand)" }}>
                    Create one →
                  </Link>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => {
                const worked = p.worked_hours;
                const assigned = p.total_hours;
                const pct = assigned > 0 ? Math.min(100, Math.round((worked / assigned) * 100)) : 0;
                const overdue = new Date(p.deadline_date) < new Date();

                return (
                  <tr key={p.id} style={overdue ? { background: "#fff8f8" } : {}}>
                    <td>
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
                      <div className="td-name" style={{ marginTop: "2px" }}>
                        {p.project_name}
                      </div>
                    </td>
                    <td className="text-muted text-sm">{p.client_name || "—"}</td>
                    <td className="text-sm">{p.manager_name || "—"}</td>
                    <td className="text-sm">
                      <div
                        style={{
                          color: overdue ? "var(--red)" : "var(--text)",
                          fontWeight: overdue ? 700 : 400,
                        }}
                      >
                        {new Date(p.deadline_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      {overdue && (
                        <span style={{ fontSize: "10.5px", color: "var(--red)" }}>Overdue</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--brand)" }}>
                      {assigned.toFixed(1)}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--green-text)" }}>
                      {worked.toFixed(1)}
                    </td>
                    <td style={{ minWidth: "90px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div
                          style={{
                            flex: 1,
                            height: "5px",
                            background: "var(--border)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
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
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link
                          href={`/admin/view_project?id=${p.id}`}
                          className="btn btn-sm"
                          style={{
                            background: "var(--brand-light)",
                            color: "var(--brand)",
                            border: "1px solid #c7d2fe",
                          }}
                        >
                          View
                        </Link>
                        <Link href={`/admin/add_project?id=${p.id}`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: "var(--red-bg)",
                            color: "var(--red)",
                            border: "1px solid #fca5a5",
                          }}
                          onClick={() => {
                            setProjectToDelete({ id: p.id, name: p.project_name });
                            setDeleteModalOpen(true);
                          }}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Project?"
        message={`This will permanently remove ${projectToDelete?.name}. This action cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (projectToDelete) {
            startTransition(async () => {
              const res = await deleteProject(projectToDelete.id);
              if (!res.success) {
                alert(res.error);
              }
              setDeleteModalOpen(false);
            });
          }
        }}
      />
    </>
  );
}
