"use client";

import { useState } from "react";
import "./organogram.css";

type OrgNode = {
  id: string;
  name: string;
  job_title: string;
  department_name: string;
  role: "admin" | "manager" | "employee";
  photo: string | null;
  manager_name: string | null;
  children?: OrgNode[];
};

const renderTree = (nodes: OrgNode[]) => {
  return (
    <ul className="org-tree">
      {nodes.map((node) => {
        const initials = node.name.split(" ").map(n => n[0]).join("").toUpperCase();
        let colorClass = "level-emp";
        if (node.role === "admin") colorClass = "level-admin";
        else if (node.role === "manager") colorClass = "level-mgr";

        return (
          <li key={node.id}>
            <div className={`org-person ${colorClass}`}>
              <div className="org-circle">
                {node.photo ? (
                  <img src={node.photo} alt={node.name} />
                ) : (
                  <span className="org-initials">{initials}</span>
                )}
              </div>
              <div className="org-label">
                <strong>{node.name}</strong>
                {node.job_title && <span>{node.job_title}</span>}
                {node.department_name && <span style={{ color: "#94a3b8", fontSize: "9px" }}>{node.department_name}</span>}
              </div>
            </div>
            {node.children && node.children.length > 0 && renderTree(node.children)}
          </li>
        );
      })}
    </ul>
  );
};

export default function OrganogramClientComponent({
  treeData,
  flatData,
}: {
  treeData: OrgNode[];
  flatData: OrgNode[];
}) {
  const [view, setView] = useState<"tree" | "dept">("tree");

  // Group flat data by department
  const byDept: Record<string, OrgNode[]> = {};
  flatData.forEach((emp) => {
    const dName = emp.department_name || "Unassigned";
    if (!byDept[dName]) byDept[dName] = [];
    byDept[dName].push(emp);
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Organization Chart</h1>
          <p>{flatData.length} employees · Visual reporting hierarchy</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Legend & Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="org-legend-bar">
          <span>
            <span className="ol-dot" style={{ background: "#7c3aed" }}></span> Admin
          </span>
          <span>
            <span className="ol-dot" style={{ background: "#059669" }}></span> Manager
          </span>
          <span>
            <span className="ol-dot" style={{ background: "#2563eb" }}></span> Employee
          </span>
        </div>
        <div className="view-toggle" style={{ marginLeft: "auto" }}>
          <button className={view === "tree" ? "active" : ""} onClick={() => setView("tree")}>
            Hierarchy
          </button>
          <button className={view === "dept" ? "active" : ""} onClick={() => setView("dept")}>
            Departments
          </button>
        </div>
      </div>

      {/* Tree View */}
      {view === "tree" && (
        <div className="org-wrapper">
          <div className="org-tree-container">
            {treeData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
                <p style={{ fontSize: "15px", fontWeight: 600 }}>No hierarchy data found</p>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>Set "Direct Manager Name" on employee profiles.</p>
              </div>
            ) : (
              renderTree(treeData)
            )}
          </div>
        </div>
      )}

      {/* Department View */}
      {view === "dept" && (
        <div>
          {Object.entries(byDept)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([deptName, deptEmps]) => (
              <div className="dept-group" key={deptName}>
                <div className="dept-group-header">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                  {deptName}
                  <span className="dept-count">{deptEmps.length}</span>
                </div>
                <div className="dept-group-body">
                  {deptEmps.map((emp) => {
                    const initials = emp.name.split(" ").map(n => n[0]).join("").toUpperCase();
                    return (
                      <div className="dept-card" key={emp.id}>
                        <div className="dept-card-avatar">
                          {emp.photo ? <img src={emp.photo} alt={emp.name} /> : <span>{initials}</span>}
                        </div>
                        <div className="dept-card-info">
                          <strong>{emp.name}</strong>
                          <span>{emp.job_title || "—"}</span>
                          {emp.manager_name && <span className="dept-mgr">↑ {emp.manager_name}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
