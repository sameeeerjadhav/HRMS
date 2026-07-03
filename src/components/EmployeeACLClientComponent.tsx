"use client";

import { useState } from "react";

type ACLRequest = {
  id: number;
  work_date: string;
  reason: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function EmployeeACLClientComponent({
  initialRequests,
}: {
  initialRequests: ACLRequest[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>My ACL Requests</h1>
          <p>Submit and track Compensatory Leave requests for working on holidays.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            New ACL Request
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>Request History</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Holiday Work Date</th>
              <th>Reason</th>
              <th>Hours Logged</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialRequests.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5}>You have no ACL requests.</td>
              </tr>
            ) : (
              initialRequests.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-sm">{new Date(r.work_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="text-sm text-muted">{r.reason}</td>
                  <td className="font-semibold">{r.hours} h</td>
                  <td className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <span className={`badge badge-${r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
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
              <h2 className="modal-title">Request Compensatory Leave</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Work Date (Holiday)</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Hours Logged</label>
                  <input type="number" className="form-control" min="1" max="24" defaultValue="8" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Justification</label>
                <textarea className="form-control" rows={3} placeholder="Please provide details about the work done..."></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
