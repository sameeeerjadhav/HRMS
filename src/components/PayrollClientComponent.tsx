"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { applySalaryTemplate } from "@/app/actions/payrollActions";

type EmployeeSalary = {
  user_id: number;
  emp_code: string;
  full_name: string;
  dept_name: string;
  job_title: string;
  salary_id: number | null;
  gross_salary: number;
  basic_salary: number;
};

export default function PayrollClientComponent({
  initialEmployees,
}: {
  initialEmployees: EmployeeSalary[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Template Form State
  const [tConveyance, setTConveyance] = useState(0);
  const [tEducationAllowance, setTEducationAllowance] = useState(0);
  const [tLta, setTLta] = useState(0);
  const [tMedicalReimbursement, setTMedicalReimbursement] = useState(0);
  const [tMobileInternet, setTMobileInternet] = useState(0);
  const [tBonus, setTBonus] = useState(0);
  const [tTaxRegime, setTTaxRegime] = useState("new");
  const [tEpfEmployeeRate, setTEpfEmployeeRate] = useState(3.67);
  const [tEpsEmployerRate, setTEpsEmployerRate] = useState(8.33);
  const [tEdliEmployerRate, setTEdliEmployerRate] = useState(0.5);
  const [tEpfAdminRate, setTEpfAdminRate] = useState(0.5);
  const [tEsiEmployeeRate, setTEsiEmployeeRate] = useState(0.75);
  const [tEsiEmployerRate, setTEsiEmployerRate] = useState(3.25);

  const filteredEmployees = initialEmployees.filter(
    (e) =>
      !searchQuery ||
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.emp_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected =
    filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map((e) => e.user_id)));
    }
  };

  const toggleOne = (id: number) => {
    const newSel = new Set(selectedIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedIds(newSel);
  };

  const handleApplyTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      alert("Please select employees from the table first.");
      return;
    }
    
    startTransition(async () => {
      const ids = Array.from(selectedIds);
      const res = await applySalaryTemplate(ids, "Default Template");
      if (res.success) {
        setIsTemplateModalOpen(false);
        setSelectedIds(new Set());
        alert("Template applied successfully!");
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
          <div className="search-box" style={{ minWidth: "240px", flex: "0 1 320px" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search employee name, ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery("")}>
              Clear
            </button>
          )}
        </div>

        <button
          className="btn btn-sm"
          style={{
            background: "var(--brand-light)",
            color: "var(--brand)",
            border: "1px solid #c7d2fe",
            fontWeight: 700,
          }}
          onClick={() => setIsTemplateModalOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Apply Template
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Employees{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({initialEmployees.length})
            </span>
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "36px" }}>
                <input
                  type="checkbox"
                  style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }}
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th style={{ textAlign: "center" }}>Gross (Annual)</th>
              <th style={{ textAlign: "center" }}>Monthly Basic</th>
              <th>Status</th>
              <th style={{ width: "140px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>No employees found.</td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.user_id}>
                  <td>
                    <input
                      type="checkbox"
                      style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }}
                      checked={selectedIds.has(emp.user_id)}
                      onChange={() => toggleOne(emp.user_id)}
                    />
                  </td>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{emp.full_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{emp.full_name}</div>
                        <div className="td-sub">{emp.emp_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{emp.dept_name || "—"}</td>
                  <td className="text-sm">{emp.job_title || "—"}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--brand)" }}>
                    {emp.salary_id ? `₹${emp.gross_salary.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--green-text)" }}>
                    {emp.salary_id ? `₹${emp.basic_salary.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td>
                    {emp.salary_id ? (
                      <span className="badge badge-green">Added</span>
                    ) : (
                      <span className="badge badge-yellow">Pending</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {emp.salary_id ? (
                        <>
                          <Link
                            href={`/admin/salary_structure?user_id=${emp.user_id}`}
                            className="btn btn-sm"
                            style={{
                              background: "var(--brand-light)",
                              color: "var(--brand)",
                              border: "1px solid #c7d2fe",
                            }}
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/salary_structure?user_id=${emp.user_id}&edit=1`}
                            className="btn btn-ghost btn-sm"
                          >
                            Edit
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/admin/salary_structure?user_id=${emp.user_id}&edit=1`}
                          className="btn btn-primary btn-sm"
                        >
                          + Add
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsTemplateModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Salary Template</h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                  Define allowances & deductions once, apply to selected employees. Gross is
                  auto-fetched from each employee's record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApplyTemplate} style={{ padding: "20px 24px" }}>
              <div
                style={{
                  background: "var(--surface-2)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "2px" }}>
                  ℹ️ How it works
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text-2)" }}>
                  Select employees from the table (checkbox), then fill this form. Each employee's{" "}
                  <strong>Gross Salary</strong> is taken from their employee record. Basic =
                  Gross/12/2, HRA = Basic/2, Income Tax auto-calculated.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Allowances */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "var(--brand)",
                    }}
                  >
                    Allowances (Monthly ₹)
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Conveyance</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tConveyance}
                      onChange={(e) => setTConveyance(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Education Allowance</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tEducationAllowance}
                      onChange={(e) => setTEducationAllowance(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>LTA</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tLta}
                      onChange={(e) => setTLta(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Medical Reimbursement</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tMedicalReimbursement}
                      onChange={(e) => setTMedicalReimbursement(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Mobile & Internet</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tMobileInternet}
                      onChange={(e) => setTMobileInternet(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Bonus (Yearly - Dec)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tBonus}
                      onChange={(e) => setTBonus(parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                {/* Deductions & Rates */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "var(--red)",
                    }}
                  >
                    Deductions & Rates
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px" }}>Tax Regime</label>
                    <select
                      className="form-control"
                      value={tTaxRegime}
                      onChange={(e) => setTTaxRegime(e.target.value)}
                    >
                      <option value="new">New Regime</option>
                      <option value="old">Old Regime</option>
                    </select>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px" }}>
                    Income Tax & PT auto-calculated. EPF/ESI rates below:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>EPF Emp (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEpfEmployeeRate}
                        onChange={(e) => setTEpfEmployeeRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>EPS Employer (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEpsEmployerRate}
                        onChange={(e) => setTEpsEmployerRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>EDLI (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEdliEmployerRate}
                        onChange={(e) => setTEdliEmployerRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>EPF Admin (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEpfAdminRate}
                        onChange={(e) => setTEpfAdminRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>ESI Emp (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEsiEmployeeRate}
                        onChange={(e) => setTEsiEmployeeRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11px" }}>ESI Employer (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tEsiEmployerRate}
                        onChange={(e) => setTEsiEmployerRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsTemplateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Applying..." : "Apply to Selected Employees"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
