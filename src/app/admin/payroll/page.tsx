import Topbar from "@/components/Topbar";
import PayrollClientComponent from "@/components/PayrollClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminPayrollPage() {
  const dbEmployees = await prisma.employees.findMany();
  const dbUsers = await prisma.users.findMany();

  // Since salary_structure is isolated, let's fetch it too.
  const dbSalaryStructure = await prisma.salary_structures.findMany();

  const employees = dbEmployees.map(e => {
    const user = dbUsers.find(u => u.email === e.email);
    const salary = dbSalaryStructure.find((s: any) => s.user_id === user?.id);
    return {
      id: e.id,
      user_id: user?.id || 0,
      emp_code: e.employee_id || `EMP-${e.id}`,
      full_name: `${e.first_name} ${e.last_name || ""}`.trim(),
      dept_name: e.department_id ? `Dept-${e.department_id}` : "Unassigned",
      job_title: e.job_title || "Employee",
      salary_id: salary?.id || null,
      gross_salary: salary?.gross_salary ? Number(salary.gross_salary) : 0,
      basic_salary: salary?.basic_salary ? Number(salary.basic_salary) : 0,
    };
  });

  const totalEmps = employees.length;
  const withSalary = employees.filter((e) => e.salary_id).length;
  const withoutSalary = totalEmps - withSalary;

  return (
    <>
      <Topbar title="Payroll" breadcrumb="Salary Structure Management" user="Admin User" role="Admin" />
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{totalEmps}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
              <svg viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{withSalary}</div>
              <div className="stat-label">Salary Added</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{withoutSalary}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        <PayrollClientComponent initialEmployees={employees} />
      </div>
    </>
  );
}
