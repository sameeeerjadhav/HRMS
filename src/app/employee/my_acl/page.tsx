import Topbar from "@/components/Topbar";
import EmployeeACLClientComponent from "@/components/EmployeeACLClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeACLPage() {
  const user = await getUser();
  if (!user) return null;

  const dbRegs = await prisma.acl_requests.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' }
  });

  const requests = dbRegs.map(r => ({
    id: r.id,
    work_date: new Date(r.work_date).toISOString().split("T")[0],
    reason: r.reason,
    hours: Number(r.hours),
    status: r.status,
    created_at: new Date(r.created_at).toISOString().split("T")[0],
  }));

  return (
    <>
      <Topbar title="My ACL" breadcrumb="Compensatory Leaves" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeACLClientComponent initialRequests={requests} />
      </div>
    </>
  );
}
