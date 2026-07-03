import Topbar from "@/components/Topbar";
import EmployeeDashboardClientComponent from "@/components/EmployeeDashboardClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeDashboardPage() {
  const user = await getUser();
  if (!user) {
    return null; // Or redirect
  }

  const userId = user.id;

  // Fetch balances
  const balances = await prisma.leave_balances.findMany({
    where: { user_id: userId },
    select: { balance: true }
  });
  const totalBalance = balances.reduce((sum, b) => sum + Number(b.balance), 0);

  // Fetch pending leaves
  const pendingLeavesCount = await prisma.leave_applications.count({
    where: { user_id: userId, status: "pending" }
  });

  // Fetch month attendance count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  
  const monthAttendCount = await prisma.attendance_logs.count({
    where: { 
      user_id: userId, 
      log_date: { gte: startOfMonth },
      status: { in: ["present", "late", "remote", "half_day"] }
    }
  });

  const stats = {
    leaveBalance: totalBalance,
    pendingLeaves: pendingLeavesCount,
    myTasks: 0, // Mocked for now until tasks table is ready
    monthAttend: monthAttendCount,
  };

  // Fetch tasks
  const openTasksCount = await prisma.task_assignments.count({
    where: { assigned_to: userId, status: { in: ["Pending", "In_Progress"] } }
  });

  stats.myTasks = openTasksCount;

  // Recent leaves
  const recentLeaveRows = await prisma.leave_applications.findMany({
    where: { user_id: userId },
    include: { leave_types: true },
    orderBy: { created_at: "desc" },
    take: 3
  });
  
  const recentLeaves = recentLeaveRows.map((r: any) => ({
    id: r.id,
    leave_type: r.leave_types?.name || "Leave",
    start_date: new Date(r.from_date).toISOString().split("T")[0],
    end_date: new Date(r.to_date).toISOString().split("T")[0],
    status: r.status,
  }));

  const upcomingTaskRows = await prisma.task_assignments.findMany({
    where: { assigned_to: userId, status: { in: ["Pending", "In_Progress"] } },
    include: { projects: true },
    orderBy: { to_date: "asc" },
    take: 3
  });

  const upcomingTasks = upcomingTaskRows.map(t => ({
    id: t.id,
    subtask: t.subtask,
    project_code: t.projects?.project_code || "N/A",
    to_date: t.to_date ? new Date(t.to_date).toISOString().split("T")[0] : ""
  }));

  const attendanceRows = await prisma.attendance_logs.findMany({
    where: { user_id: userId },
    orderBy: { log_date: "desc" },
    take: 5
  });

  const attendance = attendanceRows.map(a => ({
    id: a.id,
    log_date: new Date(a.log_date).toISOString().split("T")[0],
    clock_in: a.clock_in ? new Date(a.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
    clock_out: a.clock_out ? new Date(a.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
    work_seconds: a.work_seconds || 0,
    status: a.status
  }));

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = attendanceRows.find(a => new Date(a.log_date).toISOString().split("T")[0] === todayStr);
  const isClockedIn = todayLog ? (todayLog.clock_in !== null && todayLog.clock_out === null) : false;

  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Topbar title="My Dashboard" breadcrumb={currentDate} user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeDashboardClientComponent
          stats={stats}
          recentLeaves={recentLeaves}
          upcomingTasks={upcomingTasks}
          attendance={attendance}
          userId={userId}
          isClockedIn={isClockedIn}
        />
      </div>
    </>
  );
}
