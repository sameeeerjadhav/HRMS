import Topbar from "@/components/Topbar";
import PayslipsClientComponent from "@/components/PayslipsClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminPayslipsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const dbPayslips = await prisma.payslips.findMany({
    orderBy: { created_at: "desc" }
  });

  const dbEmployees = await prisma.employees.findMany({
    select: { user_code: true, employee_id: true, first_name: true, last_name: true, department_id: true }
  });

  const dbUsers = await prisma.users.findMany({
    select: { id: true, name: true }
  });

  const payslips = dbPayslips.map((p: any) => {
    // Find matching user and employee
    const user = dbUsers.find(u => u.id === p.user_id);
    const emp = dbEmployees.find(e => e.employee_id === `EMP-${p.user_id}` || e.user_code === String(p.user_id));
    
    return {
      id: p.id,
      user_id: p.user_id,
      emp_name: user?.name || "Unknown",
      emp_code: emp?.employee_id || `EMP-${p.user_id}`,
      dept_name: "Unassigned", // Can fetch from department relation if needed
      total_earnings: Number(p.total_earnings || 0),
      total_deductions: Number(p.total_deductions || 0),
      net_payable: Number(p.net_payable || 0),
      arrears_earning: Number(p.arrears_earning || 0),
      arrears_deduction: Number(p.arrears_deduction || 0),
      month: p.month,
      year: p.year,
      status: "paid", // Fallback for mock status since it's not in db
    };
  });

  return (
    <>
      <Topbar title="Payslips" breadcrumb="Generate & Manage" user="Admin User" role="Admin" />
      <div className="page-body">
        <PayslipsClientComponent
          initialPayslips={payslips}
          selMonth={currentMonth}
          selYear={currentYear}
        />
      </div>
    </>
  );
}
