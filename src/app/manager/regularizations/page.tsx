import Topbar from "@/components/Topbar";
import ManagerRegularizationsClientComponent from "@/components/ManagerRegularizationsClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerRegularizationsPage() {
  const user = await getUser();
  if (!user) return null;

  const managerEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const deptTeam = managerEmp?.department_id 
    ? await prisma.employees.findMany({ where: { department_id: managerEmp.department_id } })
    : [];
  const deptEmails = deptTeam.map(e => e.email);

  const dbRegs = await prisma.attendance_regularizations.findMany({
    include: {
      users: true,
    },
    orderBy: { created_at: "desc" }
  });

  const requests = dbRegs
    .filter(r => deptEmails.includes(r.users?.email))
    .map(r => ({
      id: r.id,
      emp_name: r.users?.name || "Unknown",
      reg_date: new Date(r.log_date).toISOString().split("T")[0],
      reason: r.reason,
      status: r.status,
    }));

  return (
    <>
      <Topbar title="Regularizations" breadcrumb="Team Requests" user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerRegularizationsClientComponent initialRequests={requests} managerId={user.id} />
      </div>
    </>
  );
}
