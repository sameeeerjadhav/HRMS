"use client";

import { useState } from "react";

type Payslip = {
  id: number;
  month: string; // YYYY-MM
  generated_on: string;
  net_pay: number;
};

export default function EmployeePayslipClientComponent({
  payslips,
}: {
  payslips: Payslip[];
}) {
  const [selectedPayslipId, setSelectedPayslipId] = useState<number | null>(null);

  const selectedPayslip = payslips.find(p => p.id === selectedPayslipId);

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Payslips</h1>
          <p>View and download your monthly payslips.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        {/* Sidebar List */}
        <div className="card">
          <div className="card-header">
            <h2>Salary Months</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {payslips.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No payslips available.</div>
            ) : (
              payslips.map(p => {
                const date = new Date(p.month + "-01");
                const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPayslipId(p.id)}
                    style={{
                      background: selectedPayslipId === p.id ? "var(--surface-2)" : "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--border-light)",
                      padding: "16px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "background 0.2s"
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{monthName}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Net Pay: ${p.net_pay.toLocaleString()}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Payslip Viewer */}
        <div className="card" style={{ minHeight: "600px" }}>
          {selectedPayslip ? (
            <div style={{ padding: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>PAYSLIP</h2>
                  <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                    For the month of {new Date(selectedPayslip.month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  Print / Download
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px", padding: "20px", background: "var(--surface-2)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Employee Name</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>Jane Employee</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Employee ID</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>EMP-0012</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Designation</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>Frontend Developer</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Department</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>Engineering</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
                {/* Earnings */}
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, borderBottom: "2px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>Earnings</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <span>Basic Salary</span>
                    <span>$4,500.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <span>House Rent Allowance</span>
                    <span>$1,200.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <span>Conveyance</span>
                    <span>$300.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 700, fontSize: "15px", borderTop: "2px solid var(--border)", marginTop: "8px" }}>
                    <span>Total Earnings</span>
                    <span style={{ color: "var(--green)" }}>$6,000.00</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, borderBottom: "2px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>Deductions</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <span>Tax (TDS)</span>
                    <span>$450.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <span>Provident Fund</span>
                    <span>$200.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 700, fontSize: "15px", borderTop: "2px solid var(--border)", marginTop: "33px" }}>
                    <span>Total Deductions</span>
                    <span style={{ color: "var(--red)" }}>$650.00</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--brand-light)", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--brand)" }}>Net Payable</span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--brand)" }}>${selectedPayslip.net_pay.toLocaleString()}.00</span>
              </div>
              <div style={{ textAlign: "center", marginTop: "40px", fontSize: "12px", color: "var(--muted)" }}>
                This is a computer-generated document. No signature is required.
              </div>
            </div>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
              Select a month from the left to view the payslip.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
