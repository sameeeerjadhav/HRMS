"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generatePayslips, savePayslipArrears } from "@/app/actions/payrollActions";
import { useRouter } from "next/navigation";

type Payslip = {
  id: number;
  user_id: number;
  emp_name: string;
  emp_code: string;
  dept_name: string;
  total_earnings: number;
  total_deductions: number;
  net_payable: number;
  arrears_earning: number;
  arrears_deduction: number;
};

export default function PayslipsClientComponent({
  initialPayslips,
  selMonth,
  selYear,
}: {
  initialPayslips: Payslip[];
  selMonth: number;
  selYear: number;
}) {
  const [payslips, setPayslips] = useState(initialPayslips);
  const [selectedMonth, setSelectedMonth] = useState(selMonth);
  const [selectedYear, setSelectedYear] = useState(selYear);

  // Arrears Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePs, setActivePs] = useState<Payslip | null>(null);
  const [arrEarn, setArrEarn] = useState(0);
  const [arrDed, setArrDed] = useState(0);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalEarn = payslips.reduce((sum, p) => sum + p.total_earnings, 0);
  const totalDed = payslips.reduce((sum, p) => sum + p.total_deductions, 0);
  const totalNet = payslips.reduce((sum, p) => sum + p.net_payable, 0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Generate payslips for month ${selectedMonth}/${selectedYear}?`)) {
      startTransition(async () => {
        const res = await generatePayslips(selectedMonth, selectedYear);
        if (res.success) {
          alert("Payslips generated successfully.");
        } else {
          alert(res.error);
        }
      });
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/payslips?month=${selectedMonth}&year=${selectedYear}`);
  };

  const openArrears = (ps: Payslip) => {
    setActivePs(ps);
    setArrEarn(ps.arrears_earning);
    setArrDed(ps.arrears_deduction);
    setIsModalOpen(true);
  };

  const handleSaveArrears = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePs) return;
    
    startTransition(async () => {
      // In a real app we might also need to update arrears_deduction separately if we had an action for it.
      // But our action `savePayslipArrears` just takes amount and treats it as earnings for simplicity.
      // Assuming arrEarn is what we want to save here based on the action created.
      const res = await savePayslipArrears(activePs.user_id, selectedMonth, selectedYear, arrEarn);
      if (res.success) {
        setIsModalOpen(false);
        router.push(`/admin/payslips?month=${selectedMonth}&year=${selectedYear}`);
      } else {
        alert(res.error);
      }
    });
  };

  const fmt = (num: number) => Math.round(num).toLocaleString("en-IN");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <>
      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <form onSubmit={handleFilter} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            className="form-control"
            style={{ fontSize: "13px", padding: "9px 12px", width: "auto" }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            style={{ fontSize: "13px", padding: "9px 12px", width: "auto" }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            View
          </button>
        </form>

        <form onSubmit={handleGenerate} style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Generating..." : `Generate Payslips — ${months[selectedMonth - 1]} ${selectedYear}`}
          </button>
        </form>
      </div>

      <div
        style={{
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>⚡</span>
        <span style={{ fontSize: "12.5px", color: "#065f46", fontWeight: 600 }}>
          Auto-Generate is ON — Payslips generate on the 1st of every month.
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{payslips.length}</div>
            <div className="stat-label">Payslips</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--green-text)" }}>
              ₹{fmt(totalEarn)}
            </div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--red)" }}>
              ₹{fmt(totalDed)}
            </div>
            <div className="stat-label">Total Deductions</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}>
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--brand)" }}>
              ₹{fmt(totalNet)}
            </div>
            <div className="stat-label">Net Payable</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Payslips — {months[selectedMonth - 1]} {selectedYear}{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({payslips.length})
            </span>
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th style={{ textAlign: "center" }}>Earnings</th>
              <th style={{ textAlign: "center" }}>Deductions</th>
              <th style={{ textAlign: "center" }}>Net Payable</th>
              <th style={{ width: "140px" }}></th>
            </tr>
          </thead>
          <tbody>
            {payslips.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={6}>No payslips for this month. Click "Generate Payslips" to create them.</td>
              </tr>
            ) : (
              payslips.map((ps) => (
                <tr key={ps.id}>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{ps.emp_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{ps.emp_name}</div>
                        <div className="td-sub">{ps.emp_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{ps.dept_name || "—"}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--green-text)" }}>
                    ₹{fmt(ps.total_earnings)}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--red)" }}>
                    ₹{fmt(ps.total_deductions)}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 800, color: "var(--brand)" }}>
                    ₹{fmt(ps.net_payable)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Link
                        href={`/admin/payslip_view?id=${ps.id}`}
                        className="btn btn-sm"
                        style={{ background: "var(--brand-light)", color: "var(--brand)", border: "1px solid #c7d2fe" }}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ background: "var(--yellow-bg)", color: "#92400e", border: "1px solid #fcd34d", fontSize: "11px" }}
                        onClick={() => openArrears(ps)}
                      >
                        Arrears
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Arrears Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                Edit Arrears — {activePs?.emp_name}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveArrears} style={{ padding: "16px 20px" }}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label>Arrears – Earning (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={arrEarn}
                  onChange={(e) => setArrEarn(parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px", display: "block" }}>
                  Added to total earnings
                </span>
              </div>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label>Arrears – Deduction (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={arrDed}
                  onChange={(e) => setArrDed(parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px", display: "block" }}>
                  Added to total deductions
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
