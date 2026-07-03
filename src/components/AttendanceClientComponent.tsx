"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  role: string;
};

type AttendanceLog = {
  id: number;
  log_date: string;
  user_name: string;
  user_role: string;
  clock_in: string | null;
  clock_out: string | null;
  work_seconds: number;
  ot_hours: number;
  status: string;
  location_name: string | null;
  user_id: number;
};

export default function AttendanceClientComponent({
  initialLogs,
  users,
}: {
  initialLogs: AttendanceLog[];
  users: User[];
}) {
  const [fromDate, setFromDate] = useState("2026-07-01");
  const [toDate, setToDate] = useState("2026-07-31");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = initialLogs.filter((log) => {
    const logDate = new Date(log.log_date);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const matchDate = logDate >= from && logDate <= to;
    const matchUser = !filterUserId || log.user_id.toString() === filterUserId;
    const matchRole = !filterRole || log.user_role === filterRole;
    const matchSearch =
      !searchQuery ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDate && matchUser && matchRole && matchSearch;
  });

  const fmtTime = (timeStr: string | null) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    let hours = parseInt(h);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const fmtHrs = (sec: number) => {
    if (!sec) return "—";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  const statusMap: Record<string, string> = {
    present: "badge-green",
    remote: "badge-blue",
    half_day: "badge-yellow",
    late: "badge-yellow",
    absent: "badge-red",
  };

  return (
    <>
      {/* Filter Form */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600 }}>From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600 }}>To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0, minWidth: "210px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600 }}>Employee / Manager</label>
              <select
                className="form-control"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, minWidth: "130px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600 }}>Role</label>
              <select
                className="form-control"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => {
                setFromDate("2026-07-01");
                setToDate("2026-07-31");
                setFilterUserId("");
                setFilterRole("");
                setSearchQuery("");
              }}>
                Reset
              </button>
              <button className="btn btn-success">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Attendance Records
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              {" "}
              ({fromDate} → {toDate} · {filteredLogs.length} records)
            </span>
          </h2>
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Role</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Work Hours</th>
              <th>OT</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={9}>No records for this period.</td>
              </tr>
            ) : (
              filteredLogs.map((r) => {
                const hrs = r.work_seconds;
                const short = hrs > 0 && hrs < 32400; // less than 9 hours
                const isAbsent = r.status === "absent";

                return (
                  <tr key={r.id} style={isAbsent ? { background: "#fff8f8" } : {}}>
                    <td className="text-sm font-semibold">
                      {new Date(r.log_date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="td-user">
                        <div
                          className="td-avatar"
                          style={
                            isAbsent ? { background: "var(--red-bg)", color: "var(--red)" } : {}
                          }
                        >
                          {r.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="td-name">{r.user_name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {r.user_role.charAt(0).toUpperCase() + r.user_role.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm">{fmtTime(r.clock_in)}</td>
                    <td className="text-sm">{fmtTime(r.clock_out)}</td>
                    <td>
                      {isAbsent ? (
                        <span style={{ fontSize: "12.5px", color: "var(--muted-light)" }}>—</span>
                      ) : (
                        <>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: short ? "var(--red)" : "var(--green)",
                            }}
                          >
                            {fmtHrs(hrs)}
                          </span>
                          {short && hrs > 0 && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--red)",
                                marginLeft: "3px",
                              }}
                            >
                              (&lt;9h)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {r.ot_hours > 0 ? (
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#7c3aed" }}>
                          {r.ot_hours.toFixed(1)}h
                        </span>
                      ) : (
                        <span style={{ fontSize: "12.5px", color: "var(--muted-light)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${statusMap[r.status] || "badge-gray"}`}>
                        {r.status.replace("_", " ").charAt(0).toUpperCase() +
                          r.status.replace("_", " ").slice(1)}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{r.location_name || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
