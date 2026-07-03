import Topbar from "@/components/Topbar";
import ManagerLeavesClientComponent from "@/components/ManagerLeavesClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerLeavesPage() {
  const user = await getUser();
  if (!user) return null;

  const managerEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const deptTeam = managerEmp?.department_id 
    ? await prisma.employees.findMany({ where: { department_id: managerEmp.department_id } })
    : [];
  const deptEmails = deptTeam.map(e => e.email);

  const dbRequests = await prisma.leave_applications.findMany({
    include: {
      users: true,
      leave_types: true,
    },
    orderBy: { created_at: "desc" }
  });

  const requests = dbRequests
    .filter((r: any) => deptEmails.includes(r.users?.email))
    .map((r: any) => ({
      id: r.id,
      emp_name: r.users?.name || "Unknown",
      leave_type: r.leave_types?.name || "Leave",
      start_date: new Date(r.from_date).toISOString().split("T")[0],
      end_date: new Date(r.to_date).toISOString().split("T")[0],
      reason: r.reason,
      status: r.status,
    }));

  return (
    <>
      <Topbar title="Leave Requests" breadcrumb="Team time off" user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerLeavesClientComponent initialRequests={requests} managerId={user.id} />
      </div>
    </>
  );
}
