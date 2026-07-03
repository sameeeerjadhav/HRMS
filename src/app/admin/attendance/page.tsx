import Topbar from "@/components/Topbar";
import AttendanceClientComponent from "@/components/AttendanceClientComponent";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminAttendancePage() {
  const dbLogs = await prisma.attendance_logs.findMany({
    include: {
      users: true,
      attendance_locations: true
    },
    orderBy: { log_date: 'desc' }
  });

  const allUsers = await prisma.users.findMany({
    select: { id: true, name: true, role: true }
  });

  let presentDays = 0;
  let absentDays = 0;
  let totalHours = 0;
  let totalOT = 0;

  const logs = dbLogs.map((log) => {
    if (log.status === "present" || log.status === "late") presentDays++;
    if (log.status === "absent") absentDays++;
    if (log.work_seconds) totalHours += (log.work_seconds / 3600);
    if (log.ot_hours) totalOT += Number(log.ot_hours);

    return {
      id: log.id,
      log_date: new Date(log.log_date).toISOString().split("T")[0],
      user_name: log.users?.name || "Unknown",
      user_role: log.users?.role || "employee",
      clock_in: log.clock_in ? new Date(log.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
      clock_out: log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
      work_seconds: log.work_seconds || 0,
      ot_hours: Number(log.ot_hours || 0),
      status: log.status,
      location_name: log.attendance_locations?.name || "Unknown",
      user_id: log.user_id,
    };
  });

  const stats = {
    totalRecords: logs.length,
    presentDays,
    absentDays,
    totalHours: Math.round(totalHours),
    totalOT: Math.round(totalOT * 10) / 10,
  };

  const users = allUsers.map(u => ({ id: u.id, name: u.name, role: u.role }));

  return (
    <>
      <Topbar title="Attendance" breadcrumb="Logs & Reports" user="Admin User" role="Admin" />
      <div className="page-body">
        <div className="page-header" style={{ marginBottom: "20px" }}>
          <div className="page-header-text">
            <h1>Attendance Logs</h1>
            <p>Filter by date range and employee. Absent days are auto-filled for working days (Mon–Sat).</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Manage Locations
            </button>
          </div>
        </div>

        {/* Quick Date Range Shortcuts (Visual mock for now) */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm">Today</button>
          <button className="btn btn-ghost btn-sm">This Week</button>
          <button
            className="btn btn-ghost btn-sm active"
            style={{ background: "var(--brand-light)", color: "var(--brand)", borderColor: "var(--brand)" }}
          >
            This Month
          </button>
          <button className="btn btn-ghost btn-sm">Last Month</button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.totalRecords}</div>
              <div className="stat-label">Total Records</div>
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
              <div className="stat-value">{stats.presentDays}</div>
              <div className="stat-label">Present Days</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.absentDays}</div>
              <div className="stat-label">Absent Days</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.totalHours}h</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.totalOT}h</div>
              <div className="stat-label">Total OT</div>
            </div>
          </div>
        </div>

        <AttendanceClientComponent initialLogs={logs} users={users} />
      </div>
    </>
  );
}
