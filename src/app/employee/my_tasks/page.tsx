import Topbar from "@/components/Topbar";
import MyTasksClientComponent from "@/components/MyTasksClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function MyTasksPage() {
  const user = await getUser();
  if (!user) return null;

  const dbProjects = await prisma.projects.findMany();
  // Fetch tasks assigned to this user
  const dbTasks = await prisma.task_assignments.findMany({
    where: { assigned_to: user.id },
    orderBy: { from_date: 'desc' }
  });

  const myProjects = dbProjects.map(p => ({
    id: p.id,
    name: p.project_name,
    code: p.project_code || `PRJ-${p.id}`,
  }));

  const tasks = await Promise.all(dbTasks.map(async t => {
    const proj = myProjects.find(p => p.id === t.project_id);
    
    const logs = await prisma.task_progress_logs.findMany({
      where: { task_id: t.id, user_id: user.id }
    });
    const utilized_hours = logs.reduce((sum, l) => sum + Number(l.hours_worked || 0), 0);

    return {
      id: t.id,
      project_id: t.project_id,
      project_code: proj?.code || "N/A",
      project_name: proj?.name || "Unknown",
      subtask: t.subtask,
      from_date: t.from_date ? new Date(t.from_date).toISOString().split('T')[0] : "",
      to_date: t.to_date ? new Date(t.to_date).toISOString().split('T')[0] : "",
      assigned_by_name: "Manager", // In a real system, join with employees table to find the assigner
      hours: Number(t.hours || 0),
      utilized_hours,
      status: t.status || "Pending",
    };
  }));

  const totalHrsAssigned = tasks.reduce((sum: number, t: any) => sum + t.hours, 0);
  const trackedHrs = tasks.reduce((sum: number, t: any) => sum + t.utilized_hours, 0);
  const extraConsumed = tasks.reduce((sum: number, t: any) => sum + (t.utilized_hours > t.hours ? t.utilized_hours - t.hours : 0), 0);

  const stats = {
    totalTasks: tasks.length,
    totalHrsAssigned,
    trackedHrs,
    extraConsumed,
  };

  return (
    <>
      <Topbar title="My Tasks" breadcrumb="Today" user={user.name} role={user.role} />
      <div className="page-body">
        {/* Stats */}
        <div
          className="stats-grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "16px" }}
        >
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
              <svg viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.totalHrsAssigned.toFixed(1)}</div>
              <div className="stat-label">Total Hrs Assigned</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.trackedHrs.toFixed(1)}</div>
              <div className="stat-label">Hrs Worked</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: "var(--red)" }}>
                {stats.extraConsumed.toFixed(1)}
              </div>
              <div className="stat-label">Extra Consumed</div>
            </div>
          </div>
        </div>

        <MyTasksClientComponent initialTasks={tasks} myProjects={myProjects} userId={user.id} />
      </div>
    </>
  );
}
