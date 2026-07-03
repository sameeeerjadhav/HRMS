import Topbar from "@/components/Topbar";
import GanttChartClientComponent from "@/components/GanttChartClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function GanttChartPage({ searchParams }: { searchParams: { project_id?: string } }) {
  const user = await getUser();
  if (!user) return null;

  const dbProjects = await prisma.projects.findMany({
    orderBy: { start_date: 'desc' },
  });

  const projects = dbProjects.map(p => ({
    id: p.id,
    project_code: p.project_code || `PRJ-${p.id}`,
    project_name: p.project_name,
    start_date: p.start_date ? new Date(p.start_date).toISOString().split("T")[0] : "",
    deadline_date: p.deadline_date ? new Date(p.deadline_date).toISOString().split("T")[0] : "",
    status: (p.status || "active").toLowerCase().replace(" ", "_")
  }));

  const selectedProjectId = searchParams.project_id ? parseInt(searchParams.project_id) : (projects[0]?.id || 0);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const dbTasks = await prisma.task_assignments.findMany({
    where: { project_id: selectedProject?.id },
    include: { users_task_assignments_assigned_toTousers: true },
    orderBy: { from_date: 'asc' }
  });

  const tasks = dbTasks.map(t => ({
    id: t.id,
    task_name: t.subtask,
    emp_name: t.users_task_assignments_assigned_toTousers?.name || "Unassigned",
    from_date: t.from_date ? new Date(t.from_date).toISOString().split("T")[0] : "",
    to_date: t.to_date ? new Date(t.to_date).toISOString().split("T")[0] : "",
    task_worked: 0 // Mocked since we don't have this in task_assignments
  }));

  return (
    <>
      <Topbar title="Gantt Chart" breadcrumb="Project Schedule" user={user.name} role={user.role} />
      <div className="page-body">
        <GanttChartClientComponent
          projects={projects}
          selectedProject={selectedProject}
          tasks={tasks}
        />
      </div>
    </>
  );
}
