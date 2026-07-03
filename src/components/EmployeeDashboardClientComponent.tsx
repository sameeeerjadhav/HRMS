"use client";

import Link from "next/link";

import { useState, useTransition } from "react";
import { clockIn, clockOut } from "@/app/actions/attendanceActions";

type RecentLeave = {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
};

type UpcomingTask = {
  id: number;
  subtask: string;
  project_code: string;
  to_date: string;
};

type AttendanceLog = {
  id: number;
  log_date: string;
  clock_in: string | null;
  clock_out: string | null;
  work_seconds: number;
  status: "present" | "remote" | "late" | "half_day" | "absent";
};

export default function EmployeeDashboardClientComponent({
  stats,
  recentLeaves,
  upcomingTasks,
  attendance,
  userId,
  isClockedIn,
}: {
  stats: { leaveBalance: number; pendingLeaves: number; myTasks: number; monthAttend: number };
  recentLeaves: RecentLeave[];
  upcomingTasks: UpcomingTask[];
  attendance: AttendanceLog[];
  userId: number;
  isClockedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClockInOut = async () => {
    startTransition(async () => {
      if (isClockedIn) {
        const res = await clockOut(userId);
        if (!res.success) alert(res.error);
      } else {
        // For simplicity, passing a mock IP and Location
        const res = await clockIn(userId);
        if (!res.success) alert(res.error);
      }
    });
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "approved": return "green";
      case "rejected": return "red";
      case "pending": return "yellow";
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-header-text">
          <h1>Hello, Employee 👋</h1>
          <p>Here's your personal overview for today.</p>
        </div>
        <div>
          <button 
            onClick={handleClockInOut} 
            disabled={isPending}
            className="btn" 
            style={{ 
              background: isClockedIn ? "var(--red)" : "var(--brand)", 
              color: "#fff", 
              fontWeight: 600, 
              padding: "10px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {isPending ? "Processing..." : isClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#d1fae5", color: "#059669" }}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.leaveBalance.toFixed(1)}</div>
            <div className="stat-label">Leave Balance</div>
            <div className="stat-sub">Days remaining</div>
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
            <div className="stat-value">{stats.pendingLeaves}</div>
            <div className="stat-label">Pending Leaves</div>
            <div className="stat-sub">Awaiting approval</div>
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
            <div className="stat-value">{stats.myTasks}</div>
            <div className="stat-label">Open Tasks</div>
            <div className="stat-sub">Pending / In progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.monthAttend}</div>
            <div className="stat-label">Days Present</div>
            <div className="stat-sub">This month</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Leave History */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <h2>Recent Leaves</h2>
            <Link href="/employee/my_leaves" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.length === 0 ? (
                <tr className="empty-row"><td colSpan={4}>No leave requests yet</td></tr>
              ) : (
                recentLeaves.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold text-sm">{l.leave_type}</td>
                    <td className="text-sm text-muted">{new Date(l.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="text-sm text-muted">{new Date(l.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td><span className={`badge badge-${getStatusColor(l.status)}`}>{l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h2>Quick Actions</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", padding: "16px" }}>
              <Link href="/employee/my_leaves" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                My Leaves
              </Link>
              <Link href="/employee/attendance" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Attendance
              </Link>
              <Link href="/employee/my_tasks" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                My Tasks
              </Link>
              <Link href="/employee/profile" className="btn btn-secondary" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "auto", padding: "16px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                My Profile
              </Link>
            </div>
          </div>

          {/* Tasks */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <h2>Upcoming Tasks</h2>
              <Link href="/employee/my_tasks" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            <table>
              <thead><tr><th>Task</th><th>Project</th><th>Due</th></tr></thead>
              <tbody>
                {upcomingTasks.length === 0 ? (
                  <tr className="empty-row"><td colSpan={3}>No open tasks</td></tr>
                ) : (
                  upcomingTasks.map((t) => {
                    const dueDate = new Date(t.to_date);
                    dueDate.setHours(0, 0, 0, 0);
                    return (
                      <tr key={t.id}>
                        <td className="font-semibold text-sm">{t.subtask}</td>
                        <td className="text-sm text-muted">{t.project_code}</td>
                        <td className="text-sm" style={{ color: dueDate < today ? "var(--red)" : "var(--muted)" }}>
                          {dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="table-wrap" style={{ marginTop: "16px" }}>
        <div className="table-toolbar">
          <h2>This Month's Attendance</h2>
          <Link href="/employee/attendance" className="btn btn-secondary btn-sm">Full Log</Link>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr className="empty-row"><td colSpan={5}>No attendance records this month</td></tr>
            ) : (
              attendance.map((a) => (
                <tr key={a.id}>
                  <td className="text-sm font-semibold">{new Date(a.log_date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</td>
                  <td className="text-sm">{a.clock_in ? new Date(`1970-01-01T${a.clock_in}Z`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "—"}</td>
                  <td className="text-sm">
                    {a.clock_out ? (
                      new Date(`1970-01-01T${a.clock_out}Z`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
                    ) : (
                      <span style={{ color: "var(--yellow)" }}>Ongoing</span>
                    )}
                  </td>
                  <td className="text-sm">{formatHours(a.work_seconds)}</td>
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
    </>
  );
}
