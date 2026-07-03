"use client";

import { useRouter } from "next/navigation";

export default function PayslipViewClientComponent({
  payslip,
  employee
}: {
  payslip: any;
  employee: any;
}) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const fmt = (val: string | number) => Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <button className="btn btn-secondary" onClick={() => router.back()}>&larr; Back</button>
        <button className="btn btn-primary" onClick={handlePrint}>Print Payslip</button>
      </div>

      <div className="card payslip-container" style={{ padding: "40px", backgroundColor: "#fff", color: "#000" }}>
        <div style={{ textAlign: "center", borderBottom: "2px solid #ccc", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Company Name</h1>
          <div style={{ fontSize: "14px", color: "#555" }}>123 Business Road, Corporate City, CC 12345</div>
          <h2 style={{ marginTop: "15px", fontSize: "18px", color: "#333" }}>Payslip for {monthNames[payslip.month - 1]} {payslip.year}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px", fontSize: "14px" }}>
          <div>
            <strong>Employee Name:</strong> {employee.first_name} {employee.last_name}<br/>
            <strong>Employee ID:</strong> {employee.employee_id || `EMP-${employee.id}`}<br/>
            <strong>Designation:</strong> {employee.job_title || "Employee"}<br/>
          </div>
          <div>
            <strong>Days Payable:</strong> {payslip.days_payable}<br/>
            <strong>Generated On:</strong> {payslip.created_at.split('T')[0]}<br/>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Earnings</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: "8px" }}>Basic Salary</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.basic_salary)}</td></tr>
                <tr><td style={{ padding: "8px" }}>HRA</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.hra)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Special Allowance</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.special_allowance)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Conveyance</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.conveyance)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Medical Reimbursement</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.medical_reimbursement)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Bonus</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.bonus)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Arrears</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.arrears_earning)}</td></tr>
                <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                  <td style={{ padding: "8px" }}>Total Earnings</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.total_earnings)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Deductions</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: "8px" }}>Income Tax (TDS)</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.income_tax)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Professional Tax</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.professional_tax)}</td></tr>
                <tr><td style={{ padding: "8px" }}>EPF Contribution</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.epf_employee)}</td></tr>
                <tr><td style={{ padding: "8px" }}>ESI Contribution</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.esi_employee)}</td></tr>
                <tr><td style={{ padding: "8px" }}>Arrears Deduction</td><td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.arrears_deduction)}</td></tr>
                <tr><td style={{ padding: "8px" }}>&nbsp;</td><td style={{ padding: "8px", textAlign: "right" }}>&nbsp;</td></tr>
                <tr><td style={{ padding: "8px" }}>&nbsp;</td><td style={{ padding: "8px", textAlign: "right" }}>&nbsp;</td></tr>
                <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                  <td style={{ padding: "8px" }}>Total Deductions</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>{fmt(payslip.total_deductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: "30px", border: "2px solid #ccc", padding: "15px", backgroundColor: "#f9fafb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "20px", fontWeight: "bold" }}>
            <span>Net Payable</span>
            <span style={{ color: "var(--brand)" }}>₹{fmt(payslip.net_payable)}</span>
          </div>
        </div>
        
        <div style={{ marginTop: "40px", fontSize: "12px", color: "#888", textAlign: "center" }}>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .payslip-container, .payslip-container * {
            visibility: visible;
          }
          .payslip-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
