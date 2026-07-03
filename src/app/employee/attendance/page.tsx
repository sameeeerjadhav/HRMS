import Topbar from "@/components/Topbar";
import EmployeeAttendanceClientComponent from "@/components/EmployeeAttendanceClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeAttendancePage() {
  const user = await getUser();
  if (!user) return null;

  const dbLogs = await prisma.attendance_logs.findMany({
    where: { user_id: user.id },
    include: { attendance_locations: true },
    orderBy: { log_date: 'desc' },
  });

  const logs = dbLogs.map((log: any) => ({
    id: log.id,
    log_date: new Date(log.log_date).toISOString().split("T")[0],
    clock_in: log.clock_in ? new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
    clock_out: log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
    work_seconds: Number(log.work_seconds || 0),
    status: log.status,
    location: log.attendance_locations?.name || "Unknown",
    ip_address: log.note || "", // Mapping note to IP for mock UI display
  }));

  return (
    <>
      <Topbar title="Attendance Log" breadcrumb="My Timesheet" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeAttendanceClientComponent logs={logs} />
      </div>
    </>
  );
}
