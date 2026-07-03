import Topbar from "@/components/Topbar";
import ManagerProjectsClientComponent from "@/components/ManagerProjectsClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerProjectsPage() {
  const user = await getUser();
  if (!user) return null;

  const dbProjects = await prisma.projects.findMany({
    orderBy: { start_date: 'desc' },
  });

  const projects = dbProjects.map((p: any) => ({
    id: p.id,
    project_code: p.project_code || `PRJ-${p.id}`,
    project_name: p.project_name,
    client_name: p.client_name || "Internal",
    start_date: p.start_date ? new Date(p.start_date).toISOString().split("T")[0] : "",
    deadline_date: p.deadline_date ? new Date(p.deadline_date).toISOString().split("T")[0] : "",
    total_hours: Number(p.total_hours || 0),
    worked_hours: Math.floor(Math.random() * Number(p.total_hours || 100)), // mock worked hours for now
  }));

  const total = projects.length;
  const totalHrs = projects.reduce((sum, p) => sum + p.total_hours, 0);
  const totalWorked = projects.reduce((sum, p) => sum + p.worked_hours, 0);
  const totalExtra = projects.reduce((sum, p) => sum + Math.max(0, p.worked_hours - p.total_hours), 0);
  const deadlineNear = projects.filter((p) => {
    const deadlineTime = new Date(p.deadline_date).getTime();
    const nowTime = new Date().getTime();
    const daysLeft = (deadlineTime - nowTime) / (1000 * 3600 * 24);
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  const stats = { total, totalHrs, totalWorked, totalExtra, deadlineNear };

  return (
    <>
      <Topbar title="My Projects" breadcrumb="Projects assigned to you" user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerProjectsClientComponent initialProjects={projects} stats={stats} />
      </div>
    </>
  );
}
