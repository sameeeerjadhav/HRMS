"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveSalaryStructure } from "@/app/actions/payrollActions";
import { useRouter } from "next/navigation";

type EmployeeDetail = {
  uid: number;
  full_name: string;
  employee_id: string;
  job_title: string;
  dept_name: string;
};

type SalaryStructure = {
  id?: number;
  gross_salary: number;
  basic_salary?: number;
  hra?: number;
  conveyance?: number;
  education_allowance?: number;
  lta?: number;
  medical_reimbursement?: number;
  mobile_internet?: number;
  bonus?: number;
  income_tax_annual?: number;
  professional_tax?: number;
  epf_employee_rate?: number;
  eps_employer_rate?: number;
  edli_employer_rate?: number;
  epf_admin_rate?: number;
  esi_employee_rate?: number;
  esi_employer_rate?: number;
  tax_regime?: string;
  custom_deductions?: { name: string; amount: number }[];
  custom_additions?: { name: string; amount: number }[];
};

export default function SalaryStructureClientComponent({
  emp,
  initialSalary,
  isEdit,
}: {
  emp: EmployeeDetail;
  initialSalary: SalaryStructure | null;
  isEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for Inputs
  const [grossSalary, setGrossSalary] = useState(initialSalary?.gross_salary || 1200000);
  const [conveyance, setConveyance] = useState(initialSalary?.conveyance || 0);
  const [educationAllowance, setEducationAllowance] = useState(
    initialSalary?.education_allowance || 0
  );
  const [lta, setLta] = useState(initialSalary?.lta || 0);
  const [medicalReimbursement, setMedicalReimbursement] = useState(
    initialSalary?.medical_reimbursement || 0
  );
  const [mobileInternet, setMobileInternet] = useState(initialSalary?.mobile_internet || 0);
  const [bonus, setBonus] = useState(initialSalary?.bonus || 0);

  const [taxRegime, setTaxRegime] = useState(initialSalary?.tax_regime || "new");
  const [epfEmpRate, setEpfEmpRate] = useState(initialSalary?.epf_employee_rate || 3.67);
  const [epsEmpRate, setEpsEmpRate] = useState(initialSalary?.eps_employer_rate || 8.33);
  const [edliRate, setEdliRate] = useState(initialSalary?.edli_employer_rate || 0.5);
  const [epfAdminRate, setEpfAdminRate] = useState(initialSalary?.epf_admin_rate || 0.5);
  const [esiEmpRate, setEsiEmpRate] = useState(initialSalary?.esi_employee_rate || 0.75);
  const [esiErRate, setEsiErRate] = useState(initialSalary?.esi_employer_rate || 3.25);

  const [customAdds, setCustomAdds] = useState<{ name: string; amount: number }[]>(
    initialSalary?.custom_additions || []
  );
  const [customDeds, setCustomDeds] = useState<{ name: string; amount: number }[]>(
    initialSalary?.custom_deductions || []
  );

  // Derived State (Auto-Calculated)
  const afterStdDed = Math.max(0, grossSalary - 75000); // Standard Deduction ₹75,000
  const monthly = afterStdDed / 12;
  const basic = monthly / 2;
  const hra = basic / 2;
  const personalAllowance =
    conveyance + educationAllowance + lta + medicalReimbursement + mobileInternet;

  // Custom additions total
  const customAddTotal = customAdds.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Total Earnings
  const totalEarnings = basic + hra + personalAllowance + customAddTotal;

  // Income Tax Calc (New Regime FY 2026-27)
  let incomeTaxAnnual = 0;
  if (taxRegime === "new") {
    const income = Math.max(0, grossSalary - 75000);
    let tax = 0;
    if (income > 400000) tax += Math.min(income - 400000, 400000) * 0.05;
    if (income > 800000) tax += Math.min(income - 800000, 400000) * 0.1;
    if (income > 1200000) tax += Math.min(income - 1200000, 400000) * 0.15;
    if (income > 1600000) tax += Math.min(income - 1600000, 400000) * 0.2;
    if (income > 2000000) tax += Math.min(income - 2000000, 400000) * 0.25;
    if (income > 2400000) tax += (income - 2400000) * 0.3;

    let rebate = 0;
    if (income <= 1200000) rebate = Math.min(tax, 60000);
    else if (income <= 1600000) {
      const excess = income - 1200000;
      if (tax > excess) rebate = tax - excess;
    }
    const afterRebate = tax - rebate;

    let surcharge = 0;
    if (income > 5000000 && income <= 10000000) surcharge = afterRebate * 0.1;
    else if (income > 10000000 && income <= 20000000) surcharge = afterRebate * 0.15;
    else if (income > 20000000) surcharge = afterRebate * 0.25;

    const cess = (afterRebate + surcharge) * 0.04;
    incomeTaxAnnual = afterRebate + surcharge + cess;
  }

  const monthlyIT = incomeTaxAnnual / 12;
  const monthlyPT = 2500 / 12;

  // EPF / ESI Deductions (Employee)
  const monthlyEPF = (basic * epfEmpRate) / 100;
  const monthlyESI = (basic * esiEmpRate) / 100;
  const customDedTotal = customDeds.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const totalDeductions = monthlyIT + monthlyPT + monthlyEPF + monthlyESI + customDedTotal;

  // Employer Cost
  const empEPS = (basic * epsEmpRate) / 100;
  const empEDLI = (basic * edliRate) / 100;
  const empAdmin = (basic * epfAdminRate) / 100;
  const empESI = (basic * esiErRate) / 100;
  const totalEmployerCost = empEPS + empEDLI + empAdmin + empESI;

  // Net Payable
  const netPayable = totalEarnings - totalDeductions - totalEmployerCost;

  // Format Helper
  const fmt = (num: number) => Math.round(num).toLocaleString("en-IN");

  const handleAddCustomAdd = () => {
    setCustomAdds([...customAdds, { name: "", amount: 0 }]);
  };
  const handleAddCustomDed = () => {
    setCustomDeds([...customDeds, { name: "", amount: 0 }]);
  };

  const updateCustomAdd = (index: number, field: string, value: string | number) => {
    const newAdds = [...customAdds];
    newAdds[index] = { ...newAdds[index], [field]: value };
    setCustomAdds(newAdds);
  };

  const updateCustomDed = (index: number, field: string, value: string | number) => {
    const newDeds = [...customDeds];
    newDeds[index] = { ...newDeds[index], [field]: value };
    setCustomDeds(newDeds);
  };

  if (!isEdit && initialSalary) {
    return (
      <>
        {/* VIEW MODE */}
        <div
          className="stats-grid"
          style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "20px" }}
        >
          <div className="stat-card">
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--brand)" }}>
                ₹{fmt(grossSalary / 12)}
              </div>
              <div className="stat-label">Monthly CTC</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--green-text)" }}>
                ₹{fmt(totalEarnings)}
              </div>
              <div className="stat-label">Total Earnings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--red)" }}>
                ₹{fmt(totalDeductions)}
              </div>
              <div className="stat-label">Emp. Deductions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--yellow)" }}>
                ₹{fmt(totalEmployerCost)}
              </div>
              <div className="stat-label">Employer Cost</div>
            </div>
          </div>
          <div
            className="stat-card"
            style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}
          >
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--brand)", fontSize: "20px" }}>
                ₹{fmt(netPayable)}
              </div>
              <div className="stat-label" style={{ fontWeight: 700 }}>
                Net Payable
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card">
            <div className="card-header">
              <h2>Earnings (Monthly)</h2>
            </div>
            <div className="card-body">
              <table style={{ width: "100%", fontSize: "13px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>Gross (Annual)</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brand)" }}>
                      ₹{fmt(grossSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>Standard Deduction</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                      − ₹75,000
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)", fontSize: "11px" }}>
                      After Std. Deduction (Annual)
                    </td>
                    <td style={{ textAlign: "right", fontSize: "11px", color: "var(--muted)" }}>
                      ₹{fmt(afterStdDed)} → Monthly: ₹{fmt(monthly)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>Basic Salary</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(basic)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>HRA</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(hra)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>Personal Allowance</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(personalAllowance)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)", fontSize: "11px", paddingLeft: "16px" }}>
                      — Conveyance
                    </td>
                    <td style={{ textAlign: "right", fontSize: "11px", color: "var(--muted)" }}>₹{fmt(conveyance)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)", fontSize: "11px", paddingLeft: "16px" }}>
                      — Education Allowance
                    </td>
                    <td style={{ textAlign: "right", fontSize: "11px", color: "var(--muted)" }}>₹{fmt(educationAllowance)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)", fontSize: "11px", paddingLeft: "16px" }}>
                      — LTA
                    </td>
                    <td style={{ textAlign: "right", fontSize: "11px", color: "var(--muted)" }}>₹{fmt(lta)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 0", color: "var(--muted)" }}>Bonus (Dec only)</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(bonus)}</td>
                  </tr>
                  {customAdds.map((ca, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "7px 0", color: "var(--muted)" }}>{ca.name}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green-text)" }}>
                        ₹{fmt(ca.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid var(--border)" }}>
                    <td style={{ padding: "10px 0", fontWeight: 700 }}>Total Earnings</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--green-text)" }}>
                      ₹{fmt(totalEarnings)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: "16px" }}>
              <div className="card-header">
                <h2>Employee Deductions (Monthly)</h2>
              </div>
              <div className="card-body">
                <table style={{ width: "100%", fontSize: "13px" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "7px 0", color: "var(--muted)" }}>
                        Income Tax (₹{fmt(incomeTaxAnnual)}/yr ÷ 12)
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                        ₹{fmt(monthlyIT)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 0", color: "var(--muted)" }}>
                        Professional Tax (₹2500/yr ÷ 12)
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                        ₹{fmt(monthlyPT)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 0", color: "var(--muted)" }}>
                        EPF Employee ({epfEmpRate}% of Basic)
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                        ₹{fmt(monthlyEPF)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 0", color: "var(--muted)" }}>
                        ESI Employee ({esiEmpRate}% of Basic)
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                        ₹{fmt(monthlyESI)}
                      </td>
                    </tr>
                    {customDeds.map((cd, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "7px 0", color: "var(--muted)" }}>{cd.name}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                          ₹{fmt(cd.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid var(--border)" }}>
                      <td style={{ padding: "10px 0", fontWeight: 700 }}>Total Deductions</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--red)" }}>
                        ₹{fmt(totalDeductions)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ background: "var(--brand-light)", borderColor: "var(--brand)" }}>
              <div className="card-body" style={{ padding: "20px" }}>
                <table style={{ width: "100%", fontSize: "14px" }}>
                  <tbody>
                    <tr>
                      <td style={{ color: "var(--muted)" }}>Total Earnings</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green-text)" }}>
                        ₹{fmt(totalEarnings)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: "var(--muted)" }}>− Employee Deductions</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                        ₹{fmt(totalDeductions)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: "var(--muted)" }}>− Employer Contributions</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--yellow)" }}>
                        ₹{fmt(totalEmployerCost)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid var(--brand)" }}>
                      <td style={{ paddingTop: "12px", fontWeight: 800, color: "var(--brand)", fontSize: "16px" }}>
                        NET PAYABLE
                      </td>
                      <td style={{ textAlign: "right", paddingTop: "12px", fontWeight: 800, color: "var(--brand)", fontSize: "20px" }}>
                        ₹{fmt(netPayable)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Link href="/admin/payroll" className="btn btn-secondary">
            ← Back to Payroll
          </Link>
        </div>
      </>
    );
  }

  // EDIT / ADD MODE
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("user_id", emp.uid.toString());
        // In a real app we'd map employee_id too if needed: formData.append("employee_id", emp.uid.toString());
        formData.append("gross_salary", grossSalary.toString());
        formData.append("basic_salary", basic.toString());
        formData.append("hra", hra.toString());
        formData.append("conveyance", conveyance.toString());
        formData.append("education_allowance", educationAllowance.toString());
        formData.append("lta", lta.toString());
        formData.append("medical_reimbursement", medicalReimbursement.toString());
        formData.append("mobile_internet", mobileInternet.toString());
        formData.append("bonus", bonus.toString());
        formData.append("tax_regime", taxRegime);
        formData.append("epf_employee_rate", epfEmpRate.toString());
        formData.append("eps_employer_rate", epsEmpRate.toString());
        formData.append("edli_employer_rate", edliRate.toString());
        formData.append("epf_admin_rate", epfAdminRate.toString());
        formData.append("esi_employee_rate", esiEmpRate.toString());
        formData.append("esi_employer_rate", esiErRate.toString());
        formData.append("custom_additions", JSON.stringify(customAdds));
        formData.append("custom_deductions", JSON.stringify(customDeds));

        startTransition(async () => {
          const res = await saveSalaryStructure(formData);
          if (res.success) {
            alert("Salary structure saved successfully!");
            router.push(`/admin/salary_structure?user_id=${emp.uid}`);
          } else {
            alert(res.error);
          }
        });
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Earnings Input */}
        <div className="card">
          <div className="card-header">
            <h2>Earnings</h2>
          </div>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label>Gross Salary (Annual CTC) <span className="req">*</span></label>
              <input
                type="number"
                className="form-control"
                required
                min="0"
                value={grossSalary}
                onChange={(e) => setGrossSalary(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                Auto-calculated (after ₹75,000 Standard Deduction):
              </div>
              <div style={{ fontSize: "13px" }}>
                Monthly: ₹<strong>{fmt(monthly)}</strong> · Basic: ₹<strong>{fmt(basic)}</strong> · HRA: ₹<strong>{fmt(hra)}</strong>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Conveyance</label>
              <input type="number" className="form-control" value={conveyance} onChange={(e) => setConveyance(parseFloat(e.target.value) || 0)} min="0" />
            </div>
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Education Allowance</label>
              <input type="number" className="form-control" value={educationAllowance} onChange={(e) => setEducationAllowance(parseFloat(e.target.value) || 0)} min="0" />
            </div>
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>LTA</label>
              <input type="number" className="form-control" value={lta} onChange={(e) => setLta(parseFloat(e.target.value) || 0)} min="0" />
            </div>
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Medical Reimbursement</label>
              <input type="number" className="form-control" value={medicalReimbursement} onChange={(e) => setMedicalReimbursement(parseFloat(e.target.value) || 0)} min="0" />
            </div>
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Mobile & Internet</label>
              <input type="number" className="form-control" value={mobileInternet} onChange={(e) => setMobileInternet(parseFloat(e.target.value) || 0)} min="0" />
            </div>

            <div style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "12px", margin: "14px 0" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Personal Allowance (auto-calculated):</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--brand)" }}>₹<span>{fmt(personalAllowance)}</span></div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>= Conveyance + Education + LTA + Medical Reimb. + Mobile & Internet</div>
            </div>

            <div style={{ background: "var(--brand-light)", borderRadius: "8px", padding: "12px", marginBottom: "14px", border: "1px solid var(--brand)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Total Earnings (Monthly):</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--brand)" }}>₹<span>{fmt(totalEarnings)}</span></div>
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Bonus (Yearly - Dec)</label>
              <input type="number" className="form-control" value={bonus} onChange={(e) => setBonus(parseFloat(e.target.value) || 0)} min="0" />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Other Additions (Monthly)</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddCustomAdd}>+ Add</button>
              </div>
              <div>
                {customAdds.map((ca, idx) => (
                  <div key={idx} style={{ display: "grid", marginBottom: "8px", gridTemplateColumns: "1fr auto", gap: "6px" }}>
                    <input type="text" className="form-control" value={ca.name} onChange={(e) => updateCustomAdd(idx, "name", e.target.value)} placeholder="Name" style={{ fontSize: "12.5px" }} />
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="number" className="form-control" value={ca.amount} onChange={(e) => updateCustomAdd(idx, "amount", parseFloat(e.target.value) || 0)} placeholder="₹" min="0" style={{ fontSize: "12.5px", width: "100px" }} />
                      <button type="button" className="btn btn-sm" style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5", padding: "4px 8px" }} onClick={() => setCustomAdds(customAdds.filter((_, i) => i !== idx))}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deductions Input */}
        <div className="card">
          <div className="card-header">
            <h2>Deductions & Contributions</h2>
          </div>
          <div className="card-body">
            <div style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Income Tax (New Regime FY 2026-27 - auto):</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--red)" }}>
                ₹<span>{fmt(incomeTaxAnnual)}</span>/yr → ₹<span>{fmt(monthlyIT)}</span>/mo
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label>Tax Regime</label>
              <select className="form-control" value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)}>
                <option value="new">New Regime</option>
                <option value="old">Old Regime</option>
              </select>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>EPF / ESI Rates</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group"><label>EPF Employee (%)</label><input type="number" className="form-control" value={epfEmpRate} onChange={(e) => setEpfEmpRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
                <div className="form-group"><label>EPS Employer (%)</label><input type="number" className="form-control" value={epsEmpRate} onChange={(e) => setEpsEmpRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
                <div className="form-group"><label>EDLI Employer (%)</label><input type="number" className="form-control" value={edliRate} onChange={(e) => setEdliRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
                <div className="form-group"><label>EPF Admin (%)</label><input type="number" className="form-control" value={epfAdminRate} onChange={(e) => setEpfAdminRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
                <div className="form-group"><label>ESI Employee (%)</label><input type="number" className="form-control" value={esiEmpRate} onChange={(e) => setEsiEmpRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
                <div className="form-group"><label>ESI Employer (%)</label><input type="number" className="form-control" value={esiErRate} onChange={(e) => setEsiErRate(parseFloat(e.target.value) || 0)} step="0.01" min="0" /></div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Custom Deductions</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddCustomDed}>+ Add</button>
              </div>
              <div>
                {customDeds.map((cd, idx) => (
                  <div key={idx} style={{ display: "grid", marginBottom: "8px", gridTemplateColumns: "1fr auto", gap: "6px" }}>
                    <input type="text" className="form-control" value={cd.name} onChange={(e) => updateCustomDed(idx, "name", e.target.value)} placeholder="Name" style={{ fontSize: "12.5px" }} />
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="number" className="form-control" value={cd.amount} onChange={(e) => updateCustomDed(idx, "amount", parseFloat(e.target.value) || 0)} placeholder="₹" min="0" style={{ fontSize: "12.5px", width: "100px" }} />
                      <button type="button" className="btn btn-sm" style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5", padding: "4px 8px" }} onClick={() => setCustomDeds(customDeds.filter((_, i) => i !== idx))}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fef2f2", borderRadius: "8px", padding: "12px", marginTop: "14px", border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Total Deductions (Monthly):</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--red)" }}>₹<span>{fmt(totalDeductions)}</span></div>
            </div>

            <div style={{ background: "var(--brand-light)", borderRadius: "8px", padding: "12px", marginTop: "10px", border: "1px solid var(--brand)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Net Payable (Monthly):</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--brand)" }}>₹<span>{fmt(netPayable)}</span></div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingBottom: "32px" }}>
        <Link href="/admin/payroll" className="btn btn-secondary">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Salary Structure"}
        </button>
      </div>
    </form>
  );
}
