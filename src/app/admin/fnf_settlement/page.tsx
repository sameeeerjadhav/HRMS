import Topbar from "@/components/Topbar";
import FnFClientComponent from "@/components/FnfClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminFnfSettlementPage() {
  const settlements = await prisma.fnf_settlements.findMany({
    orderBy: { created_at: "desc" },
  });

  const termEmployees = await prisma.employees.findMany({
    where: { status: "Terminated" },
  });
  
  const dbDepartments = await prisma.departments.findMany();

  const employees = await Promise.all(termEmployees.map(async (e) => {
    let u = undefined;
    if (e.email) {
      u = await prisma.users.findFirst({ where: { email: e.email } });
    }
    const dept = dbDepartments.find(d => d.id === e.department_id);
    return {
      id: e.id,
      name: `${e.first_name} ${e.last_name || ""}`.trim(),
      user_id: u?.id || 0,
      department: dept?.name || "Unknown",
      resignation_date: e.date_of_exit ? new Date(e.date_of_exit).toISOString().split('T')[0] : "N/A",
      last_working_day: e.date_of_exit ? new Date(e.date_of_exit).toISOString().split('T')[0] : "N/A",
      employee_id: e.employee_id || `EMP-${e.id}`,
      date_of_exit: e.date_of_exit ? new Date(e.date_of_exit).toISOString().split('T')[0] : "N/A",
    };
  }));

  const formattedSettlements = settlements.map((f: any) => ({
    id: f.id,
    user_id: f.employee_id,
    emp_name: `${f.employees?.first_name} ${f.employees?.last_name || ""}`.trim(),
    emp_code: f.employees?.employee_id || `EMP-${f.employee_id}`,
    last_working_day: f.exit_date ? new Date(f.exit_date).toISOString().split('T')[0] : "",
    total_earnings: Number(f.leave_encashment_amount || 0) + Number(f.gratuity_amount || 0),
    total_deductions: Number(f.deductions || 0),
    net_settlement: Number(f.net_payable || 0),
    days_worked: 30, // Mock
    working_days_month: 30, // Mock
    pl_days: Number(f.leave_encashment_days || 0),
    pl_encashment: Number(f.leave_encashment_amount || 0),
    bonus: 0,
    notice_period: 30,
    notice_served: f.notice_period_served ? 30 : 0,
    outstanding_recovery: Number(f.deductions || 0),
    custom_items: [],
  }));

  return (
    <>
      <Topbar title="F&F Settlement" breadcrumb="Full & Final Process" user="Admin User" role="Admin" />
      <div className="page-body">
        <FnFClientComponent employees={employees} settlements={formattedSettlements} />
      </div>
    </>
  );
}
