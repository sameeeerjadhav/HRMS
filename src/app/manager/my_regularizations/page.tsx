import Topbar from "@/components/Topbar";
import EmployeeRegularizationsClientComponent from "@/components/EmployeeRegularizationsClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeRegularizationsPage() {
  const user = await getUser();
  if (!user) return null;

  const dbRegs = await prisma.attendance_regularizations.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' }
  });

  const requests = dbRegs.map(r => ({
    id: r.id,
    reg_date: new Date(r.log_date).toISOString().split("T")[0],
    reason: r.reason,
    status: r.status,
    created_at: new Date(r.created_at).toISOString().split("T")[0],
  }));

  return (
    <>
      <Topbar title="My Regularizations" breadcrumb="My Portal / Regularizations" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeRegularizationsClientComponent initialRequests={requests} userId={user.id} />
      </div>
    </>
  );
}
