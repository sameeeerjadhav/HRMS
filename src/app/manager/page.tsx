import Topbar from "@/components/Topbar";
import ManagerDashboardClientComponent from "@/components/ManagerDashboardClientComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerDashboardPage() {
  const user = await getUser();
  if (!user) return null;

  // 1. Get Team Members
  const teamEmployees = await prisma.employees.findMany({
    where: { direct_manager_name: user.name }
  });

  // Since employees don't have user_id natively, we find them by email
  const teamEmails = teamEmployees.map(e => e.email);
  const teamUsers = await prisma.users.findMany({
    where: { email: { in: teamEmails } }
  });
  const teamUserIds = teamUsers.map(u => u.id);
  const teamIds = teamUserIds;
  const teamMembers = teamEmployees;

  // 2. Get Team Leaves
  const teamLeavesDb = await prisma.leave_applications.findMany({
    where: { user_id: { in: teamUserIds } },
    include: { leave_types: true, users: true },
    orderBy: { created_at: "desc" },
    take: 5
  });

  const teamLeavesMapped = teamLeavesDb.map(l => ({
    id: l.id,
    name: l.users?.name || "Unknown",
    leave_type: l.leave_types?.name || "Leave",
    start_date: new Date(l.from_date).toISOString().split("T")[0],
    end_date: new Date(l.to_date).toISOString().split("T")[0],
    status: (l.status.toLowerCase() === "cancelled" ? "rejected" : l.status.toLowerCase()) as "pending" | "approved" | "rejected",
  }));

  const teamMembersMapped = teamEmployees.map(e => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    email: e.email,
    status: (e.status?.toLowerCase() === 'active' ? "active" : "inactive") as "active" | "inactive",
  }));

  const pendingLvs = await prisma.leave_applications.count({
    where: { user_id: { in: teamUserIds }, status: "pending" }
  });

  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,999);

  const todayPresent = await prisma.attendance_logs.count({
    where: { 
      user_id: { in: teamIds }, 
      log_date: { gte: startOfToday, lte: endOfToday },
      status: { in: ["present", "late", "remote", "half_day"] }
    }
  });

  const openTasks = await prisma.task_assignments.count({
    where: { assigned_by: user.id, status: { in: ["Pending", "In_Progress"] } }
  });

  const stats = {
    myTeam: teamMembers.length,
    pendingLvs,
    todayPresent,
    openTasks: openTasks,
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Topbar title="Manager Dashboard" breadcrumb={currentDate} user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerDashboardClientComponent
          stats={stats}
          teamLeaves={teamLeavesMapped}
          teamMembers={teamMembersMapped}
        />
      </div>
    </>
  );
}
