import Topbar from "@/components/Topbar";
import EmployeeLeavesClientComponent from "@/components/EmployeeLeavesClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeLeavesPage() {
  const user = await getUser();
  if (!user) return null;

  const dbLeaves = await prisma.leave_applications.findMany({
    where: { user_id: user.id },
    include: { leave_types: true },
    orderBy: { created_at: "desc" }
  });

  const balances = await prisma.leave_balances.findMany({
    where: { user_id: user.id },
    select: { balance: true }
  });
  const totalBalance = balances.reduce((sum, b) => sum + Number(b.balance), 0);

  const leaves = dbLeaves.map(l => ({
    id: l.id,
    leave_type: l.leave_types?.name || "Leave",
    start_date: new Date(l.from_date).toISOString().split("T")[0],
    end_date: new Date(l.to_date).toISOString().split("T")[0],
    reason: l.reason || "",
    status: l.status as any,
    created_at: new Date(l.created_at).toISOString().split("T")[0],
  }));

  const leaveTypes = await prisma.leave_types.findMany();

  return (
    <>
      <Topbar title="My Leaves" breadcrumb="Employee Portal / My Leaves" user={user.name} role="Employee" />
      <div className="page-body">
        <EmployeeLeavesClientComponent 
          initialLeaves={leaves} 
          leaveBalance={totalBalance}
          userId={user.id}
          leaveTypes={leaveTypes.map(lt => ({ id: lt.id, name: lt.name }))}
        />
      </div>
    </>
  );
}
