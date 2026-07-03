"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import DeleteModal from "./DeleteModal";
import { deleteEmployee } from "@/app/actions/adminActions";
import { downloadCSV } from "@/lib/exportUtils";

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  job_title: string;
  type: string;
  status: string;
  joined: string;
};

export default function EmployeesClientComponent({
  initialEmployees,
  departments,
}: {
  initialEmployees: Employee[];
  departments: string[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEmployees = initialEmployees.filter((emp) => {
    const matchSearch =
      !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || emp.department === deptFilter;
    const matchType = !typeFilter || emp.type === typeFilter;
    const matchStatus = !statusFilter || emp.status.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchDept && matchType && matchStatus;
  });

  const isAllSelected =
    filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < filteredEmployees.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map((e) => e.id)));
    }
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const hasFilters = search || deptFilter || typeFilter || statusFilter;

  return (
    <>
      <div className="table-wrap">
        {selectedIds.size > 0 && (
          <div
            style={{
              background: "var(--brand-light)",
              borderBottom: "1px solid #c7d2fe",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)" }}>
              {selectedIds.size}
            </span>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>employees selected</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Deselect All
              </button>
              <button className="btn btn-sm" style={{ background: "#16a34a", color: "#fff" }} onClick={() => downloadCSV(filteredEmployees.filter(e => selectedIds.has(e.id)), "employees_selected.csv")}>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Selected
              </button>
            </div>
          </div>
        )}

        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "10px" }}>
          <h2>
            All Employees{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({filteredEmployees.length})
            </span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginLeft: "auto" }}>
            <div className="search-box">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "160px", fontSize: "13px", padding: "7px 12px" }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "130px", fontSize: "13px", padding: "7px 12px" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="FTE">FTE</option>
              <option value="External">External</option>
            </select>
            <select
              className="form-control"
              style={{ width: "auto", minWidth: "120px", fontSize: "13px", padding: "7px 12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => downloadCSV(filteredEmployees, "employees.csv")}>
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export All
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "40px", paddingLeft: "18px" }}>
                <input
                  type="checkbox"
                  style={{ width: "15px", height: "15px", accentColor: "var(--brand)", cursor: "pointer" }}
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Employee</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ width: "120px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>
                  No employees found.{" "}
                  <Link href="/admin/add_employee" style={{ color: "var(--brand)" }}>
                    Add your first employee →
                  </Link>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ paddingLeft: "18px" }}>
                    <input
                      type="checkbox"
                      style={{ width: "15px", height: "15px", accentColor: "var(--brand)", cursor: "pointer" }}
                      checked={selectedIds.has(emp.id)}
                      onChange={() => handleSelect(emp.id)}
                    />
                  </td>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{emp.name}</div>
                        <div className="td-sub">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{emp.department || "—"}</td>
                  <td className="text-muted">{emp.job_title || "—"}</td>
                  <td>
                    <span className={`badge ${emp.type === "FTE" ? "badge-blue" : "badge-yellow"}`}>
                      {emp.type || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        emp.status.toLowerCase() === "active" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{emp.joined}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/admin/edit_employee/${emp.id}`} className="btn btn-ghost btn-sm">
                        <svg
                          viewBox="0 0 24 24"
                          width="13"
                          height="13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
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
                          setEmployeeToDelete({ id: emp.id, name: emp.name });
                          setDeleteModalOpen(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="13"
                          height="13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Employee?"
        message={`This will permanently remove ${employeeToDelete?.name} and all their data. This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (employeeToDelete) {
            startTransition(async () => {
              const res = await deleteEmployee(employeeToDelete.id);
              if (res.success) {
                setDeleteModalOpen(false);
                setEmployeeToDelete(null);
                // Data will be refreshed by revalidatePath
              } else {
                alert(res.error);
              }
            });
          }
        }}
      />
    </>
  );
}
