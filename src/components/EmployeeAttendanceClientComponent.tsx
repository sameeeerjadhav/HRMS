"use client";

import { useState } from "react";

type AttendanceLog = {
  id: number;
  log_date: string;
  clock_in: string | null;
  clock_out: string | null;
  work_seconds: number;
  status: "present" | "remote" | "late" | "half_day" | "absent";
  location: string;
  ip_address: string;
};

export default function EmployeeAttendanceClientComponent({
  logs,
}: {
  logs: AttendanceLog[];
}) {
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredLogs = logs.filter((l) => {
    const d = new Date(l.log_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const getStatusColor = (s: string) => {
    switch (s) {
      case "present": return "green";
      case "remote": return "blue";
      case "late":
      case "half_day": return "yellow";
      case "absent": return "red";
      default: return "gray";
    }
  };

  const formatHours = (seconds: number) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Attendance</h1>
          <p>View your daily clock-ins, clock-outs, and hours worked.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="tabs" style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", flex: 1 }}>
          <button
            className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
            style={{ background: "none", border: "none", padding: "10px 16px", cursor: "pointer", borderBottom: activeTab === "list" ? "2px solid var(--brand)" : "2px solid transparent", color: activeTab === "list" ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}
          >
            List View
          </button>
          <button
            className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
            style={{ background: "none", border: "none", padding: "10px 16px", cursor: "pointer", borderBottom: activeTab === "calendar" ? "2px solid var(--brand)" : "2px solid transparent", color: activeTab === "calendar" ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}
          >
            Calendar View
          </button>
        </div>
        
        <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
          <select 
            className="form-control" 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            style={{ padding: "6px 12px", width: "120px" }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i, 1).toLocaleDateString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          <select 
            className="form-control" 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            style={{ padding: "6px 12px", width: "100px" }}
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Location</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={7}>No attendance records for this month.</td>
                </tr>
              ) : (
                filteredLogs.map((a) => (
                  <tr key={a.id}>
                    <td className="text-sm font-semibold">{new Date(a.log_date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="text-sm">{a.clock_in ? new Date(`1970-01-01T${a.clock_in}Z`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "—"}</td>
                    <td className="text-sm">
                      {a.clock_out ? (
                        new Date(`1970-01-01T${a.clock_out}Z`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
                      ) : (
                        <span style={{ color: "var(--yellow)" }}>Ongoing</span>
                      )}
                    </td>
                    <td className="text-sm font-semibold">{formatHours(a.work_seconds)}</td>
                    <td className="text-sm text-muted">{a.location || "—"}</td>
                    <td className="text-sm text-muted">{a.ip_address || "—"}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(a.status)}`}>
                        {a.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              Calendar View
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              The calendar view widget will be rendered here.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
