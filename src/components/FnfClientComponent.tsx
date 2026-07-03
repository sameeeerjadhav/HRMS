"use client";

import { useState, useTransition } from "react";
import { saveSettlement, deleteSettlement } from "@/app/actions/fnfActions";

type ExitedEmployee = {
  user_id: number;
  name: string;
  employee_id: string;
  date_of_exit: string;
};

type EmployeeData = {
  full_name: string;
  employee_id: string;
  job_title: string;
  dept_name: string;
};

type CalcData = {
  lwd: string;
  days_worked: number;
  working_days: number;
  pl_days: number;
  pl_encashment: number;
  basic: number;
  gross_monthly: number;
};

type Settlement = {
  id: number;
  user_id: number;
  emp_name: string;
  emp_code: string;
  last_working_day: string;
  total_earnings: number;
  total_deductions: number;
  net_settlement: number;
  days_worked: number;
  working_days_month: number;
  pl_days: number;
  pl_encashment: number;
  bonus: number;
  notice_period: number;
  notice_served: number;
  outstanding_recovery: number;
  custom_items: { name: string; type: string; amount: number }[];
};

export default function FnfClientComponent({
  employees,
  settlements: initialSettlements,
}: {
  employees: ExitedEmployee[];
  settlements: Settlement[];
}) {
  const [selUserId, setSelUserId] = useState<number | "">("");
  const [isPending, startTransition] = useTransition();

  // Mock fetching data for selected employee
  const empData: EmployeeData | null = selUserId
    ? {
        full_name: employees.find((e) => e.user_id === selUserId)?.name || "",
        employee_id: employees.find((e) => e.user_id === selUserId)?.employee_id || "",
        job_title: "Developer",
        dept_name: "Engineering",
      }
    : null;

  const calcData: CalcData | null = selUserId
    ? {
        lwd: employees.find((e) => e.user_id === selUserId)?.date_of_exit || "",
        days_worked: 15,
        working_days: 22,
        pl_days: 10,
        pl_encashment: 15625, // (Basic/30) * 10
        basic: 46875,
        gross_monthly: 100000,
      }
    : null;

  // Form State
  const [bonus, setBonus] = useState(0);
  const [noticePeriod, setNoticePeriod] = useState(90);
  const [noticeServed, setNoticeServed] = useState(0);
  const [recovery, setRecovery] = useState(0);
  const [customItems, setCustomItems] = useState<{ name: string; type: string; amount: number }[]>([]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeFnf, setActiveFnf] = useState<Settlement | null>(null);
  const [editPlEnc, setEditPlEnc] = useState(0);

  // Auto-calculated fields
  const proRata = calcData ? Math.round((calcData.gross_monthly / calcData.working_days) * calcData.days_worked) : 0;
  const shortfall = Math.max(0, noticePeriod - noticeServed);
  const noticeDeduction = calcData ? Math.round((calcData.gross_monthly / 30) * shortfall) : 0;

  let customEarn = 0;
  let customDed = 0;
  customItems.forEach((item) => {
    if (item.type === "addition") customEarn += item.amount;
    else customDed += item.amount;
  });

  const totalEarnings = proRata + (calcData?.pl_encashment || 0) + bonus + customEarn;
  const totalDeductions = noticeDeduction + recovery + customDed;
  const netSettlement = totalEarnings - totalDeductions;

  const fmt = (num: number) => Math.round(num).toLocaleString("en-IN");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selUserId || !calcData) return;

    startTransition(async () => {
      const res = await saveSettlement({
        user_id: selUserId as number,
        last_working_day: calcData.lwd,
        days_worked: calcData.days_worked,
        working_days_month: calcData.working_days,
        pl_days: calcData.pl_days,
        pl_encashment: calcData.pl_encashment,
        bonus,
        notice_period: noticePeriod,
        notice_served: noticeServed,
        notice_shortfall_deduction: noticeDeduction,
        outstanding_recovery: recovery,
        custom_items: JSON.stringify(customItems),
        total_earnings: totalEarnings,
        total_deductions: totalDeductions,
        net_settlement: netSettlement,
      });

      if (res.success) {
        setSelUserId("");
        setBonus(0);
        setNoticePeriod(90);
        setNoticeServed(0);
        setRecovery(0);
        setCustomItems([]);
      } else {
        alert(res.error);
      }
    });
  };

  const openEdit = (s: Settlement) => {
    setActiveFnf(s);
    setEditPlEnc(s.pl_encashment);
    setBonus(s.bonus);
    setNoticePeriod(s.notice_period);
    setNoticeServed(s.notice_served);
    setRecovery(s.outstanding_recovery);
    setCustomItems(s.custom_items || []);
    setIsEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFnf) return;

    startTransition(async () => {
      let customEarn = 0;
      let customDed = 0;
      customItems.forEach(i => {
        if (i.type === "addition") customEarn += i.amount;
        else customDed += i.amount;
      });

      // Rough recalculation for edit
      const shortfallEdit = Math.max(0, noticePeriod - noticeServed);
      const fakeGross = 100000;
      const noticeDeductionEdit = Math.round((fakeGross / 30) * shortfallEdit);
      const proRataEdit = Math.round((fakeGross / 30) * 15);
      const totalEarnEdit = proRataEdit + editPlEnc + bonus + customEarn;
      const totalDedEdit = noticeDeductionEdit + recovery + customDed;

      const res = await saveSettlement({
        id: activeFnf.id,
        user_id: activeFnf.user_id,
        last_working_day: activeFnf.last_working_day,
        days_worked: 15,
        working_days_month: 30,
        pl_days: 10,
        pl_encashment: editPlEnc,
        bonus,
        notice_period: noticePeriod,
        notice_served: noticeServed,
        notice_shortfall_deduction: noticeDeductionEdit,
        outstanding_recovery: recovery,
        custom_items: JSON.stringify(customItems),
        total_earnings: totalEarnEdit,
        total_deductions: totalDedEdit,
        net_settlement: totalEarnEdit - totalDedEdit,
      });

      if (res.success) {
        setIsEditOpen(false);
        setActiveFnf(null);
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h2>Create F&F Settlement</h2>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "16px" }}>
            <div className="form-group" style={{ minWidth: "300px" }}>
              <label>Select Employee (Exited)</label>
              <select
                className="form-control"
                value={selUserId}
                onChange={(e) => setSelUserId(Number(e.target.value) || "")}
              >
                <option value="">— Select —</option>
                {employees.map((emp) => (
                  <option key={emp.user_id} value={emp.user_id}>
                    {emp.name} ({emp.employee_id}) — Exit: {emp.date_of_exit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {empData && calcData && (
            <form onSubmit={handleSave}>
              <div
                style={{
                  background: "var(--surface-2)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  {empData.full_name}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "4px" }}>
                  {empData.employee_id} · {empData.job_title} · {empData.dept_name}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px", color: "var(--text)" }}>
                    Auto-Calculated
                  </div>
                  <table style={{ width: "100%", fontSize: "13px" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Last Working Day</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{calcData.lwd}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Gross Monthly Salary</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brand)" }}>
                          ₹{fmt(calcData.gross_monthly)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Basic Salary (Monthly)</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(calcData.basic)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Days Worked (Last Month)</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{calcData.days_worked}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Working Days (Month)</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{calcData.working_days}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Pro-rata Salary</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green-text)" }}>
                          ₹{fmt(proRata)}
                        </td>
                      </tr>
                      <tr style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>Unused PL Days</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{calcData.pl_days}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>PL Encashment</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green-text)" }}>
                          ₹{fmt(calcData.pl_encashment)}
                        </td>
                      </tr>
                      {shortfall > 0 && (
                        <tr>
                          <td style={{ padding: "7px 0", color: "var(--muted)" }}>
                            Notice Shortfall ({shortfall} days)
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                            − ₹{fmt(noticeDeduction)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px", color: "var(--text)" }}>
                    Manual Entries
                  </div>
                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Bonus (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Notice Period (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Notice Served (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={noticeServed}
                      onChange={(e) => setNoticeServed(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Outstanding Recovery / Loans (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={recovery}
                      onChange={(e) => setRecovery(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Items */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Custom Items (Addition/Deduction)</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCustomItems([...customItems, { name: "", type: "addition", amount: 0 }])}
                  >
                    + Add
                  </button>
                </div>
                {customItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].name = e.target.value;
                        setCustomItems(newItems);
                      }}
                      style={{ flex: 1, fontSize: "12.5px" }}
                    />
                    <select
                      className="form-control"
                      value={item.type}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].type = e.target.value;
                        setCustomItems(newItems);
                      }}
                      style={{ width: "auto", fontSize: "12.5px" }}
                    >
                      <option value="addition">Addition</option>
                      <option value="deduction">Deduction</option>
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="₹"
                      min="0"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].amount = Number(e.target.value);
                        setCustomItems(newItems);
                      }}
                      style={{ width: "100px", fontSize: "12.5px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))}
                      style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5", padding: "4px 8px" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", marginTop: "20px", alignItems: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>
                  Net Settlement: <span style={{ color: "var(--brand)" }}>₹{fmt(netSettlement)}</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving..." : "Calculate & Save Settlement"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {initialSettlements.length > 0 && (
        <div className="table-wrap">
          <div className="table-toolbar">
            <h2>Settlements ({initialSettlements.length})</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>LWD</th>
                <th style={{ textAlign: "right" }}>Earnings</th>
                <th style={{ textAlign: "right" }}>Deductions</th>
                <th style={{ textAlign: "right" }}>Net Settlement</th>
                <th style={{ width: "120px" }}></th>
              </tr>
            </thead>
            <tbody>
              {initialSettlements.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">
                    {s.emp_name} <span className="text-sm text-muted">({s.emp_code})</span>
                  </td>
                  <td className="text-sm">{s.last_working_day}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green-text)" }}>
                    ₹{fmt(s.total_earnings)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                    ₹{fmt(s.total_deductions)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--brand)" }}>
                    ₹{fmt(s.net_settlement)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: "var(--brand-light)", color: "var(--brand)", border: "1px solid #c7d2fe" }}
                        onClick={() => openEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5" }}
                        disabled={isPending}
                        onClick={() => {
                          if (confirm("Delete this settlement?")) {
                            startTransition(async () => {
                              await deleteSettlement(s.id);
                            });
                          }
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && activeFnf && (
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
          onClick={() => setIsEditOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Edit Settlement — {activeFnf.emp_name}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSave} style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>PL Encashment (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editPlEnc}
                    onChange={(e) => setEditPlEnc(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Bonus (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Notice Period (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Notice Served (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={noticeServed}
                    onChange={(e) => setNoticeServed(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Outstanding Recovery (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={recovery}
                    onChange={(e) => setRecovery(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Custom Items</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCustomItems([...customItems, { name: "", type: "addition", amount: 0 }])}
                  >
                    + Add
                  </button>
                </div>
                {customItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].name = e.target.value;
                        setCustomItems(newItems);
                      }}
                      style={{ flex: 1, fontSize: "12.5px" }}
                    />
                    <select
                      className="form-control"
                      value={item.type}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].type = e.target.value;
                        setCustomItems(newItems);
                      }}
                      style={{ width: "auto", fontSize: "12.5px" }}
                    >
                      <option value="addition">Addition</option>
                      <option value="deduction">Deduction</option>
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="₹"
                      min="0"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...customItems];
                        newItems[idx].amount = Number(e.target.value);
                        setCustomItems(newItems);
                      }}
                      style={{ width: "100px", fontSize: "12.5px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))}
                      style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5", padding: "4px 8px" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving..." : "Update Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
