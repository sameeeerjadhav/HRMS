import Topbar from "@/components/Topbar";
import ManagerACLRequestsClientComponent from "@/components/ManagerACLRequestsClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerACLRequestsPage() {
  const user = await getUser();
  if (!user) return null;

  const managerEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const deptTeam = managerEmp?.department_id 
    ? await prisma.employees.findMany({ where: { department_id: managerEmp.department_id } })
    : [];
  const deptEmails = deptTeam.map(e => e.email);

  const dbRegs = await prisma.acl_requests.findMany({
    orderBy: { created_at: "desc" }
  });

  const dbUsers = await prisma.users.findMany();

  const requests = dbRegs
    .filter(r => {
      const u = dbUsers.find(user => user.id === r.user_id);
      return deptEmails.includes(u?.email || "");
    })
    .map(r => {
      const u = dbUsers.find(user => user.id === r.user_id);
      return {
        id: r.id,
        emp_name: u?.name || "Unknown",
        work_date: new Date(r.work_date).toISOString().split("T")[0],
        reason: r.reason,
        hours: Number(r.hours),
        status: r.status,
      };
    });

  return (
    <>
      <Topbar title="Team ACL Requests" breadcrumb="Approve/reject employee holiday work requests" user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerACLRequestsClientComponent initialRequests={requests} />
      </div>
    </>
  );
}
