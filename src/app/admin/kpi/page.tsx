import Topbar from "@/components/Topbar";
import KPIClientComponent from "@/components/KPIClientComponent";

import { prisma } from "@/lib/prisma";

export default async function KPIPage() {
  const dbDepartments = await prisma.departments.findMany();
  const dbEmployees = await prisma.employees.findMany();
  const dbUsers = await prisma.users.findMany();

  const departments = dbDepartments.map(d => ({
    id: d.id,
    name: d.name,
  }));

  const employees = dbEmployees.map(e => {
    const user = dbUsers.find(u => u.email === e.email);
    return {
      id: e.id,
      user_id: user?.id || 0,
      employee_id: e.employee_id || `EMP-${e.id}`,
      name: `${e.first_name} ${e.last_name || ""}`.trim(),
      dept_name: e.department_id ? `Dept-${e.department_id}` : "Development",
    };
  });

  return (
    <>
      <Topbar title="Employee KPIs" breadcrumb="Performance Tracking" user="Admin User" role="Admin" />
      <div className="page-body">
        <KPIClientComponent initialEmployees={employees} departments={departments} />
      </div>
    </>
  );
}
