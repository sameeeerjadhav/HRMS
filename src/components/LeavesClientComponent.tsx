"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveLeaveType, toggleLeaveType } from "@/app/actions/leaveActions";

type LeaveType = {
  id: number;
  name: string;
  days_per_credit: number;
  credit_cycle: string;
  credit_day: number;
  max_carry_fwd: number;
  color: string;
  is_active: boolean;
};

type BalanceSummary = {
  leave_type_id: number;
  total_bal: number;
  total_used: number;
  cnt: number;
};

type User = {
  id: number;
  name: string;
  role: string;
  balances: Record<number, { balance: number; used: number }>;
};

export default function LeavesClientComponent({
  initialLeaveTypes,
  initialBalSummary,
  users,
}: {
  initialLeaveTypes: LeaveType[];
  initialBalSummary: Record<number, BalanceSummary>;
  users: User[];
}) {
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);
  const [isPending, startTransition] = useTransition();
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);

  // Manual Credit State
  const [mcType, setMcType] = useState("");
  const [mcDays, setMcDays] = useState(1);
  const [mcReason, setMcReason] = useState("Manual credit");
  const [mcSearch, setMcSearch] = useState("");
  const [mcSelected, setMcSelected] = useState<Set<number>>(new Set());

  const activeLeaveTypes = leaveTypes.filter((lt) => lt.is_active);

  const filteredUsers = users.filter(
    (u) => !mcSearch || u.name.toLowerCase().includes(mcSearch.toLowerCase())
  );

  const isAllMcSelected = filteredUsers.length > 0 && mcSelected.size === filteredUsers.length;

  const toggleMcAll = () => {
    if (isAllMcSelected) {
      setMcSelected(new Set());
    } else {
      setMcSelected(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleMcUser = (id: number) => {
    const newSel = new Set(mcSelected);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setMcSelected(newSel);
  };

  return (
    <>
      <div className="table-wrap" style={{ marginBottom: "24px" }}>
        <div className="table-toolbar">
          <h2>Leave Types</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            + Add Leave Type
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Credit</th>
              <th>Cycle</th>
              <th>Carry Fwd</th>
              <th>Total Balance</th>
              <th>Total Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((lt) => {
              const bs = initialBalSummary[lt.id] || { total_bal: 0, total_used: 0 };
              return (
                <tr key={lt.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: lt.color,
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      ></span>
                      <span className="font-semibold">{lt.name}</span>
                    </div>
                  </td>
                  <td className="text-sm">{lt.days_per_credit} day(s)</td>
                  <td>
                    <span
                      className={`badge ${
                        lt.credit_cycle === "manual"
                          ? "badge-yellow"
                          : lt.credit_cycle === "yearly"
                          ? "badge-blue"
                          : "badge-green"
                      }`}
                    >
                      {lt.credit_cycle.charAt(0).toUpperCase() + lt.credit_cycle.slice(1)}
                    </span>
                  </td>
                  <td className="text-sm text-muted">
                    {lt.max_carry_fwd > 0 ? `${lt.max_carry_fwd} days` : "None"}
                  </td>
                  <td className="font-semibold">{bs.total_bal.toFixed(1)} days</td>
                  <td className="text-muted text-sm">{bs.total_used.toFixed(1)} days</td>
                  <td>
                    <span className={`badge ${lt.is_active ? "badge-green" : "badge-red"}`}>
                      {lt.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingType(lt);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {lt.credit_cycle !== "manual" && (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "var(--green-bg)",
                            color: "var(--green-text)",
                            border: "1px solid #a7f3d0",
                          }}
                        >
                          Credit All
                        </button>
                      )}
                      <button 
                        className="btn btn-ghost btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await toggleLeaveType(lt.id, lt.is_active);
                          });
                        }}
                      >
                        {lt.is_active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* ACL Row */}
            <tr style={{ background: "#faf5ff" }}>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#7c3aed",
                    marginRight: "8px",
                  }}
                ></span>
                <span className="font-semibold" style={{ color: "#7c3aed" }}>
                  ACL (Compensatory Leave)
                </span>
              </td>
              <td className="text-sm text-muted">Auto-calculated</td>
              <td className="text-sm text-muted">—</td>
              <td className="text-sm text-muted">—</td>
              <td className="text-sm text-muted">—</td>
              <td className="text-sm text-muted">—</td>
              <td>
                <span className="badge badge-green">Active</span>
              </td>
              <td>
                <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 500 }}>
                  System managed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Manual Credit */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Manual Credit</h2>
            <p>Select employees, choose a leave type, enter days, and credit manually.</p>
          </div>
        </div>
        <div className="card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Mock manual credit");
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "20px",
                alignItems: "flex-end",
              }}
            >
              <div className="form-group" style={{ margin: 0, minWidth: "200px" }}>
                <label>
                  Leave Type <span className="req">*</span>
                </label>
                <select
                  className="form-control"
                  required
                  value={mcType}
                  onChange={(e) => setMcType(e.target.value)}
                >
                  <option value="">Select type…</option>
                  {activeLeaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: "120px" }}>
                <label>
                  Days <span className="req">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="0.5"
                  step="0.5"
                  required
                  value={mcDays}
                  onChange={(e) => setMcDays(parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: "220px" }}>
                <label>Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Annual credit Q1"
                  value={mcReason}
                  onChange={(e) => setMcReason(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginBottom: "1px" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Credit Selected
              </button>
            </div>

            <div
              className="table-wrap"
              style={{ boxShadow: "none", maxHeight: "380px", overflowY: "auto" }}
            >
              <div
                className="table-toolbar"
                style={{
                  padding: "10px 16px",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: "var(--surface)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    style={{
                      width: "15px",
                      height: "15px",
                      accentColor: "var(--brand)",
                      cursor: "pointer",
                    }}
                    checked={isAllMcSelected}
                    onChange={toggleMcAll}
                  />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Select All</span>
                  {mcSelected.size > 0 && (
                    <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "4px" }}>
                      ({mcSelected.size} selected)
                    </span>
                  )}
                </div>
                <div className="search-box">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search…"
                    value={mcSearch}
                    onChange={(e) => setMcSearch(e.target.value)}
                  />
                </div>
              </div>
              <table>
                <thead style={{ position: "sticky", top: "44px", zIndex: 1 }}>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Employee</th>
                    <th>Role</th>
                    {activeLeaveTypes.map((lt) => (
                      <th key={lt.id} style={{ fontSize: "11px" }}>
                        {lt.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ paddingLeft: "16px" }}>
                        <input
                          type="checkbox"
                          style={{
                            width: "15px",
                            height: "15px",
                            accentColor: "var(--brand)",
                            cursor: "pointer",
                          }}
                          checked={mcSelected.has(u.id)}
                          onChange={() => toggleMcUser(u.id)}
                        />
                      </td>
                      <td>
                        <div className="td-user">
                          <div className="td-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          <div className="td-name">{u.name}</div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "manager" ? "badge-brand" : "badge-gray"
                          }`}
                        >
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      {activeLeaveTypes.map((lt) => {
                        const bal = u.balances[lt.id] || { balance: 0, used: 0 };
                        return (
                          <td key={lt.id} className="text-sm text-center">
                            <span style={{ color: "var(--green-text)", fontWeight: 600 }}>
                              {bal.balance.toFixed(1)}
                            </span>
                            <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                              {" "}
                              / {bal.used.toFixed(1)} used
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>

      {/* Exposing controls to open Modals for the parent to trigger */}
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(17,24,39,0.5); backdrop-filter: blur(2px);
          display: none; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-overlay.open { display: flex; }
        .modal {
          background: var(--surface); width: 100%; max-width: 500px;
          border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
          display: flex; flex-direction: column; max-height: 90vh;
        }
        .modal-header {
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .modal-close {
          background: none; border: none; cursor: pointer; color: var(--muted);
          display: flex; align-items: center; justify-content: center; padding: 4px;
        }
        .modal-body { padding: 20px; overflow-y: auto; }
        .modal-footer {
          padding: 16px 20px; border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end; gap: 10px;
        }
      `}</style>

      {/* Add Modal */}
      <div className={`modal-overlay ${isAddModalOpen ? "open" : ""}`} onClick={() => setIsAddModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <form action={async (formData) => {
            startTransition(async () => {
              const res = await saveLeaveType(formData);
              if (res.success) {
                setIsAddModalOpen(false);
              } else {
                alert(res.error);
              }
            });
          }}>
            <div className="modal-header">
              <h3>Add Leave Type</h3>
              <button type="button" className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Leave Type Name <span className="req">*</span></label>
                <input type="text" name="name" className="form-control" required />
              </div>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Days per Credit <span className="req">*</span></label>
                <input type="number" name="days_per_credit" className="form-control" step="0.5" required />
              </div>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Credit Cycle <span className="req">*</span></label>
                <select name="credit_cycle" className="form-control" required>
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Max Carry Forward</label>
                <input type="number" name="max_carry_fwd" className="form-control" defaultValue="0" />
              </div>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Color Badge</label>
                <input type="color" name="color" className="form-control" style={{ padding: "0", height: "40px" }} defaultValue="#6366f1" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Modal implementation */}
      <div className={`modal-overlay ${isEditModalOpen ? "open" : ""}`} onClick={() => setIsEditModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {editingType && (
            <form action={async (formData) => {
              startTransition(async () => {
                const res = await saveLeaveType(formData);
                if (res.success) {
                  setIsEditModalOpen(false);
                } else {
                  alert(res.error);
                }
              });
            }}>
              <input type="hidden" name="id" value={editingType.id} />
              <div className="modal-header">
                <h3>Edit Leave Type</h3>
                <button type="button" className="modal-close" onClick={() => setIsEditModalOpen(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Leave Type Name <span className="req">*</span></label>
                  <input type="text" name="name" className="form-control" defaultValue={editingType.name} required />
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Days per Credit <span className="req">*</span></label>
                  <input type="number" name="days_per_credit" className="form-control" step="0.5" defaultValue={editingType.days_per_credit} required />
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Credit Cycle <span className="req">*</span></label>
                  <select name="credit_cycle" className="form-control" defaultValue={editingType.credit_cycle} required>
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Max Carry Forward</label>
                  <input type="number" name="max_carry_fwd" className="form-control" defaultValue={editingType.max_carry_fwd} />
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Color Badge</label>
                  <input type="color" name="color" className="form-control" style={{ padding: "0", height: "40px" }} defaultValue={editingType.color} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
