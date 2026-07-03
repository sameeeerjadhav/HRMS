import Topbar from "@/components/Topbar";
import SalaryStructureClientComponent from "@/components/SalaryStructureClientComponent";

import { prisma } from "@/lib/prisma";

// Next.js searchParams are available to page components.
// We use them to determine the mode (edit or view) and user_id.
export default async function AdminSalaryStructurePage({
  searchParams,
}: {
  searchParams: { user_id?: string; edit?: string };
}) {
  const isEdit = searchParams.edit === "1";
  
  // Await searchParams in Next 15+
  const userId = searchParams.user_id ? parseInt(searchParams.user_id) : 1; 

  const dbEmp = await prisma.employees.findFirst({
    where: { id: userId },
  });

  if (!dbEmp) {
    return <div>Employee not found</div>;
  }

  const dept = dbEmp.department_id 
    ? await prisma.departments.findFirst({ where: { id: dbEmp.department_id } })
    : null;

  const emp = {
    uid: userId,
    full_name: `${dbEmp.first_name} ${dbEmp.last_name}`,
    employee_id: dbEmp.employee_id || `EMP-${dbEmp.id}`,
    job_title: dbEmp.job_title || "Employee",
    dept_name: dept?.name || "Unassigned",
  };

  const dbSalary = await prisma.salary_structures.findFirst({
    where: { user_id: userId }
  });

  const initialSalary = dbSalary ? {
    gross_salary: Number(dbSalary.gross_salary),
    basic_salary: Number(dbSalary.basic_salary),
    hra: Number(dbSalary.hra),
    conveyance: Number(dbSalary.conveyance),
    education_allowance: Number(dbSalary.education_allowance),
    lta: Number(dbSalary.lta),
    medical_reimbursement: Number(dbSalary.medical_reimbursement),
    mobile_internet: Number(dbSalary.mobile_internet),
    bonus: Number(dbSalary.bonus),
    tax_regime: dbSalary.tax_regime || "new",
    epf_employee_rate: Number(dbSalary.epf_employee_rate || 3.67),
    eps_employer_rate: Number(dbSalary.eps_employer_rate || 8.33),
    edli_employer_rate: Number(dbSalary.edli_employer_rate || 0.5),
    epf_admin_rate: Number(dbSalary.epf_admin_rate || 0.5),
    esi_employee_rate: Number(dbSalary.esi_employee_rate || 0.75),
    esi_employer_rate: Number(dbSalary.esi_employer_rate || 3.25),
    custom_additions: JSON.parse(dbSalary.custom_additions?.toString() || "[]"),
    custom_deductions: JSON.parse(dbSalary.custom_deductions?.toString() || "[]"),
  } : {
    gross_salary: 0,
    basic_salary: 0,
    hra: 0,
    conveyance: 0,
    education_allowance: 0,
    lta: 0,
    medical_reimbursement: 0,
    mobile_internet: 0,
    bonus: 0,
    tax_regime: "new",
    epf_employee_rate: 3.67,
    eps_employer_rate: 8.33,
    edli_employer_rate: 0.5,
    epf_admin_rate: 0.5,
    esi_employee_rate: 0.75,
    esi_employer_rate: 3.25,
    custom_additions: [],
    custom_deductions: [],
  };

  return (
    <>
      <Topbar
        title="Salary Structure"
        breadcrumb={`Payroll / ${emp.full_name}`}
        user="Admin User"
        role="Admin"
      />
      <div className="page-body">
        {/* Employee Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--brand), var(--brand-mid))",
            borderRadius: "12px",
            padding: "18px 24px",
            color: "#fff",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            {emp.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800 }}>{emp.full_name}</div>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>
              {emp.employee_id} · {emp.job_title} · {emp.dept_name}
            </div>
          </div>
        </div>

        <SalaryStructureClientComponent emp={emp} initialSalary={initialSalary} isEdit={isEdit} />
      </div>
    </>
  );
}
