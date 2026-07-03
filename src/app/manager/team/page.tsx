import Topbar from "@/components/Topbar";
import MyTeamClientComponent from "@/components/MyTeamClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function MyTeamPage() {
  const user = await getUser();
  if (!user) return null;

  // Find manager's employee record to get department
  const managerEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const dept = managerEmp?.department_id
    ? await prisma.departments.findFirst({ where: { id: managerEmp.department_id } })
    : null;

  const dbTeam = managerEmp?.department_id 
    ? await prisma.employees.findMany({
        where: { department_id: managerEmp.department_id }
      })
    : [];

  const teamMembers = dbTeam.map((emp: any) => ({
    id: emp.id,
    first_name: emp.first_name,
    last_name: emp.last_name || "",
    email: emp.email,
    phone: emp.phone || "",
    job_title: emp.job_title || "Employee",
    employee_type: emp.employee_type || "FTE",
    status: emp.status || "Active",
    date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split("T")[0] : "N/A",
    location: "Unknown", // Add if locations are linked to employees
  }));

  const deptName = dept?.name || "Unassigned";

  return (
    <>
      <Topbar title="My Team" breadcrumb={`${deptName} Department`} user={user.name} role={user.role} />
      <div className="page-body">
        <MyTeamClientComponent teamMembers={teamMembers} deptName={deptName} />
      </div>
    </>
  );
}
