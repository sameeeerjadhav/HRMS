"use client";

import { useState, useTransition } from "react";
import { submitRegularizationRequest } from "@/app/actions/attendanceActions";

type RegRequest = {
  id: number;
  reg_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function EmployeeRegularizationsClientComponent({
  initialRequests,
  userId,
}: {
  initialRequests: RegRequest[];
  userId: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    regDate: "",
    clockIn: "09:00",
    clockOut: "18:00",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.regDate || !form.reason) {
      alert("Please fill all required fields");
      return;
    }

    startTransition(async () => {
      const res = await submitRegularizationRequest(
        userId,
        form.regDate,
        form.clockIn,
        form.clockOut,
        form.reason
      );
      if (res.success) {
        setIsModalOpen(false);
        setForm({ regDate: "", clockIn: "09:00", clockOut: "18:00", reason: "" });
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Regularizations</h1>
          <p>Submit and track attendance regularization requests.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            New Request
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>Regularization History</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date to Regularize</th>
              <th>Reason</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialRequests.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={4}>You have no regularization requests.</td>
              </tr>
            ) : (
              initialRequests.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-sm">{new Date(r.reg_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="text-sm text-muted">{r.reason}</td>
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
              <h2 className="modal-title">Request Regularization</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Date to Regularize</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={form.regDate}
                      onChange={e => setForm({ ...form, regDate: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Clock In Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={form.clockIn}
                        onChange={e => setForm({ ...form, clockIn: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Clock Out Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={form.clockOut}
                        onChange={e => setForm({ ...form, clockOut: e.target.value })}
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
                      onChange={e => setForm({ ...form, reason: e.target.value })}
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
