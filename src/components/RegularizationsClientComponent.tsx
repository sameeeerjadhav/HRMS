"use client";

import { useState, useTransition } from "react";
import { approveRegularization, rejectRegularization } from "@/app/actions/attendanceActions";

type Regularization = {
  id: number;
  emp_name: string;
  emp_email: string;
  emp_role: "employee" | "manager";
  manager_name: string;
  log_date: string;
  req_clock_in: string;
  req_clock_out: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  escalated: boolean;
  escalated_at: string | null;
  review_note?: string;
};

export default function RegularizationsClientComponent({
  initialRegs,
}: {
  initialRegs: Regularization[];
}) {
  const [regs, setRegs] = useState<Regularization[]>(initialRegs);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterEscalated, setFilterEscalated] = useState(false);
  const [search, setSearch] = useState("");

  // Modals
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: number) => {
    if (confirm("Approve this regularization?")) {
      setRegs(
        regs.map((r) => (r.id === id ? { ...r, status: "approved", escalated: false } : r))
      );
      startTransition(async () => {
        const res = await approveRegularization(id, 1);
        if (!res.success) {
          alert(res.error);
        }
      });
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectId && rejectNote) {
      setRegs(
        regs.map((r) =>
          r.id === rejectId ? { ...r, status: "rejected", escalated: false } : r
        )
      );
      const rId = rejectId;
      const rNote = rejectNote;

      setRejectId(null);
      setRejectNote("");

      startTransition(async () => {
        const res = await rejectRegularization(rId, 1, rNote);
        if (!res.success) {
          alert(res.error);
        }
      });
    }
  };

  const setStatusFilter = (status: string, esc = false) => {
    setFilterStatus(status);
    setFilterEscalated(esc);
  };

  // Filter Logic
  const filteredRegs = regs.filter((r) => {
    if (filterEscalated) {
      if (!r.escalated || r.status !== "pending") return false;
    } else {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
    }

    if (filterRole && r.emp_role !== filterRole) return false;
    if (search && !r.emp_name.toLowerCase().includes(search.toLowerCase())) return false;

    return true;
  });

  // Calculate Stats
  const counts = {
    pending: regs.filter((r) => r.status === "pending" && !r.escalated).length,
    approved: regs.filter((r) => r.status === "approved").length,
    rejected: regs.filter((r) => r.status === "rejected").length,
    escalated: regs.filter((r) => r.status === "pending" && r.escalated).length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [h, m] = timeString.split(":");
    const d = new Date();
    d.setHours(Number(h));
    d.setMinutes(Number(m));
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {counts.escalated > 0 && (
        <div
          className="alert"
          style={{
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fcd34d",
            marginBottom: "16px",
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <strong>{counts.escalated} escalated regularization(s)</strong> — pending 3+ days without manager action.
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "#92400e", fontWeight: 700, marginLeft: "8px" }}
            onClick={() => setStatusFilter("pending", true)}
          >
            View Escalated →
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-text">
          <h1>Regularizations</h1>
          <p>Manager regularization requests and escalated employee requests.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: "20px" }}>
        {[
          { key: "pending", label: "Pending", badge: "badge-yellow", val: counts.pending },
          { key: "approved", label: "Approved", badge: "badge-green", val: counts.approved },
          { key: "rejected", label: "Rejected", badge: "badge-red", val: counts.rejected },
        ].map((s) => (
          <div
            key={s.key}
            className="stat-card"
            style={{
              cursor: "pointer",
              borderColor: filterStatus === s.key && !filterEscalated ? "var(--brand)" : "var(--border)",
              boxShadow: filterStatus === s.key && !filterEscalated ? "0 0 0 2px var(--brand-light)" : "none",
            }}
            onClick={() => setStatusFilter(s.key, false)}
          >
            <div className="stat-body">
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
            <span className={`badge ${s.badge}`} style={{ alignSelf: "flex-start" }}>
              {s.label}
            </span>
          </div>
        ))}

        <div
          className="stat-card"
          style={{
            cursor: "pointer",
            borderColor: filterEscalated ? "#f59e0b" : "var(--border)",
            boxShadow: filterEscalated ? "0 0 0 2px #fef3c7" : "none",
          }}
          onClick={() => setStatusFilter("pending", true)}
        >
          <div className="stat-body">
            <div className="stat-value" style={{ color: "#d97706" }}>
              {counts.escalated}
            </div>
            <div className="stat-label">Escalated</div>
          </div>
          <span className="badge badge-yellow" style={{ alignSelf: "flex-start" }}>
            ⚠ Escalated
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "all", label: "All" },
        ].map((s) => (
          <button
            key={s.key}
            className={`btn btn-sm ${filterStatus === s.key && !filterEscalated ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatusFilter(s.key, false)}
          >
            {s.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <select
            className="form-control"
            style={{ fontSize: "13px", padding: "7px 12px", minWidth: "130px" }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            {filterEscalated ? "⚠ Escalated Requests" : "Regularization Requests"}{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({filteredRegs.length})
            </span>
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Date</th>
              <th>Req. In</th>
              <th>Req. Out</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ width: "160px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredRegs.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>No regularization requests found.</td>
              </tr>
            ) : (
              filteredRegs.map((r) => {
                const isEsc = r.escalated && r.status === "pending";
                return (
                  <tr key={r.id} style={{ background: isEsc ? "#fffbeb" : "transparent" }}>
                    <td>
                      <div className="td-user">
                        <div className="td-avatar">{r.emp_name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="td-name">{r.emp_name}</div>
                          <div className="td-sub">{r.emp_email}</div>
                          {r.manager_name && <div className="td-sub">Mgr: {r.manager_name}</div>}
                        </div>
                      </div>
                      {isEsc && (
                        <div>
                          <span className="badge badge-yellow" style={{ fontSize: "10px", marginTop: "3px" }}>
                            ⚠ Escalated
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.emp_role === "manager" ? "badge-brand" : "badge-gray"}`}>
                        {r.emp_role}
                      </span>
                    </td>
                    <td className="font-semibold text-sm">{formatDate(r.log_date)}</td>
                    <td className="text-sm">{formatTime(r.req_clock_in)}</td>
                    <td className="text-sm">{formatTime(r.req_clock_out)}</td>
                    <td
                      className="text-muted text-sm"
                      style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={r.reason}
                    >
                      {r.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "pending"
                            ? "badge-yellow"
                            : r.status === "approved"
                            ? "badge-green"
                            : "badge-red"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "pending" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: "var(--green-bg)",
                              color: "var(--green-text)",
                              border: "1px solid #a7f3d0",
                            }}
                            onClick={() => handleApprove(r.id)}
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5" }}
                            onClick={() => setRejectId(r.id)}
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      ) : r.review_note ? (
                        <span style={{ fontSize: "12px", color: "var(--muted)" }} title={r.review_note}>
                          Note ℹ
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setRejectId(null)}>
          <div className="modal" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3>Reject Regularization</h3>
              <button className="modal-close" onClick={() => setRejectId(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleReject}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason <span className="req">*</span></label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide a reason…"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
