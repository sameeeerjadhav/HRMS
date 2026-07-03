"use client";

import { useState, useTransition } from "react";
import { approveLeave, rejectLeave } from "@/app/actions/leaveActions";

type LeaveRequest = {
  id: number;
  emp_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

export default function ManagerLeavesClientComponent({
  initialRequests,
  managerId,
}: {
  initialRequests: LeaveRequest[];
  managerId: number;
}) {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isPending, startTransition] = useTransition();

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyRequests = requests.filter((r) => r.status !== "pending");

  const handleAction = (id: number, action: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${action === 'approved' ? 'approve' : 'reject'} this request?`)) return;
    
    startTransition(async () => {
      let res;
      if (action === "approved") {
        res = await approveLeave(id, managerId);
      } else {
        res = await rejectLeave(id, managerId, "Rejected by manager");
      }

      if (res.success) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
      } else {
        alert(res.error);
      }
    });
  };

  const renderTable = (data: LeaveRequest[], isHistory: boolean) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Reason</th>
            <th>Status</th>
            {!isHistory && <th style={{ width: "160px" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={isHistory ? 6 : 7}>No {isHistory ? "historical" : "pending"} leave requests.</td>
            </tr>
          ) : (
            data.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.emp_name}</td>
                <td className="text-muted text-sm">{r.leave_type}</td>
                <td className="text-sm">{new Date(r.start_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="text-sm">{new Date(r.end_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="text-sm text-muted">{r.reason}</td>
                <td>
                  <span className={`badge badge-${r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                {!isHistory && (
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleAction(r.id, "approved")}
                        className="btn btn-sm"
                        disabled={isPending}
                        style={{ background: "var(--green-bg)", color: "var(--green-text)", border: "1px solid #a7f3d0" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "rejected")}
                        className="btn btn-sm"
                        disabled={isPending}
                        style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5" }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Team Leave Requests</h1>
          <p>Review and approve/reject leave requests from your team.</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: "20px", display: "flex", gap: "10px", borderBottom: "1px solid var(--border)" }}>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
          style={{ background: "none", border: "none", padding: "10px 16px", cursor: "pointer", borderBottom: activeTab === "pending" ? "2px solid var(--brand)" : "2px solid transparent", color: activeTab === "pending" ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
          style={{ background: "none", border: "none", padding: "10px 16px", cursor: "pointer", borderBottom: activeTab === "history" ? "2px solid var(--brand)" : "2px solid transparent", color: activeTab === "history" ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}
        >
          History ({historyRequests.length})
        </button>
      </div>

      {activeTab === "pending" ? renderTable(pendingRequests, false) : renderTable(historyRequests, true)}
    </>
  );
}
