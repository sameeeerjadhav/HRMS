import Topbar from "@/components/Topbar";
import LeaveRequestsClientComponent from "@/components/LeaveRequestsClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminLeaveRequestsPage() {
  const dbRequests = await prisma.leave_applications.findMany({
    include: {
      users: {
        select: { name: true, email: true, role: true }
      },
      leave_types: {
        select: { name: true, color: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const requests = dbRequests.map((r: any) => ({
    id: r.id,
    emp_name: r.users?.name || "Unknown",
    emp_email: r.users?.email || "",
    emp_role: r.users?.role || "employee",
    manager_name: r.reviewed_by ? `User #${r.reviewed_by}` : "Pending Review",
    type_name: r.leave_types?.name || "Leave",
    color: r.leave_types?.color || "#6366f1",
    from_date: new Date(r.from_date).toISOString().split("T")[0],
    to_date: new Date(r.to_date).toISOString().split("T")[0],
    days: Number(r.days),
    remaining_balance: 0, // Compute if needed
    reason: r.reason,
    status: r.status,
    created_at: new Date(r.created_at).toISOString().split("T")[0],
    escalated: r.escalated,
    escalated_at: r.escalated_at ? new Date(r.escalated_at).toISOString().split("T")[0] : null,
  }));

  return (
    <>
      <Topbar title="Leave Requests" breadcrumb="Manager leave requests & escalated employee leaves" user="Admin User" role="Admin" />
      <div className="page-body">
        <LeaveRequestsClientComponent initialRequests={requests} />
      </div>
    </>
  );
}
