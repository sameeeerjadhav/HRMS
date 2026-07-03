"use client";

import { useState, useTransition } from "react";
import { submitLeaveRequest } from "@/app/actions/leaveActions";

type LeaveRequest = {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function EmployeeLeavesClientComponent({
  initialLeaves,
  leaveBalance,
  userId,
  leaveTypes,
}: {
  initialLeaves: LeaveRequest[];
  leaveBalance: number;
  userId: number;
  leaveTypes: { id: number; name: string }[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    leaveTypeId: leaveTypes.length > 0 ? leaveTypes[0].id : 0,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { leaveTypeId, startDate, endDate, reason } = form;

    if (!startDate || !endDate || !reason) {
      alert("Please fill all required fields");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    if (days > leaveBalance) {
      alert("Insufficient leave balance for this request");
      return;
    }

    startTransition(async () => {
      const res = await submitLeaveRequest(userId, Number(leaveTypeId), startDate, endDate, days, reason);
      if (res.success) {
        setIsModalOpen(false);
        setForm({ ...form, startDate: "", endDate: "", reason: "" });
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Leaves</h1>
          <p>Track your leave balances and request time off.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Apply for Leave
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(1, 1fr)", maxWidth: "300px", marginBottom: "24px" }}>
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
            <div className="stat-value">{leaveBalance.toFixed(1)}</div>
            <div className="stat-label">Available Leave Balance</div>
            <div className="stat-sub">Days remaining this year</div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>Leave History</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Reason</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialLeaves.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={6}>You haven't applied for any leaves yet.</td>
              </tr>
            ) : (
              initialLeaves.map((l) => (
                <tr key={l.id}>
                  <td className="font-semibold text-sm">{l.leave_type}</td>
                  <td className="text-sm">{new Date(l.start_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="text-sm">{new Date(l.end_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="text-sm text-muted">{l.reason}</td>
                  <td className="text-sm text-muted">{new Date(l.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <span className={`badge badge-${l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "yellow"}`}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Apply for Leave</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select 
                      className="form-control" 
                      value={form.leaveTypeId}
                      onChange={(e) => setForm({ ...form, leaveTypeId: Number(e.target.value) })}
                    >
                      {leaveTypes.map(lt => (
                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Please provide a reason..."
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </>
  );
}
