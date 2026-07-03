import Topbar from "@/components/Topbar";
import EmployeeIDCardClientComponent from "@/components/EmployeeIDCardClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeIDCardPage() {
  const user = await getUser();
  if (!user) return null;

  const dbEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const dept = dbEmp?.department_id 
    ? await prisma.departments.findFirst({ where: { id: dbEmp.department_id } })
    : null;

  const firstName = dbEmp?.first_name || user.name.split(" ")[0];
  const lastName = dbEmp?.last_name || user.name.split(" ")[1] || "";
  const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : "")).toUpperCase();

  const data = {
    fullName: dbEmp ? `${dbEmp.first_name} ${dbEmp.last_name}` : user.name,
    employeeId: dbEmp?.employee_id || `EMP-${user.id}`,
    jobTitle: dbEmp?.job_title || "Employee",
    departmentName: dept?.name || "Unassigned",
    dateOfJoining: dbEmp?.date_of_joining ? new Date(dbEmp.date_of_joining).toISOString().split("T")[0] : "N/A",
    initials,
  };

  return (
    <>
      <Topbar title="ID Card" breadcrumb="Digital Identity" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeIDCardClientComponent data={data} />
      </div>
    </>
  );
}
