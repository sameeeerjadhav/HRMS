import Topbar from "@/components/Topbar";
import GanttChartClientComponent from "@/components/GanttChartClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeGanttChartPage({ searchParams }: { searchParams: { project_id?: string } }) {
  const user = await getUser();
  if (!user) return null;

  // Find all projects where this user has tasks assigned
  const userTasks = await prisma.task_assignments.findMany({
    where: { assigned_to: user.id },
    select: { project_id: true }
  });
  
  const projectIds = Array.from(new Set(userTasks.map(t => t.project_id)));

  const dbProjects = await prisma.projects.findMany({
    where: { id: { in: projectIds } },
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
    where: { 
      project_id: selectedProject?.id,
      assigned_to: user.id
    },
    include: { users_task_assignments_assigned_toTousers: true },
    orderBy: { from_date: 'asc' }
  });

  const tasks = dbTasks.map(t => ({
    id: t.id,
    task_name: t.subtask,
    emp_name: t.users_task_assignments_assigned_toTousers?.name || "Unassigned",
    from_date: t.from_date ? new Date(t.from_date).toISOString().split("T")[0] : "",
    to_date: t.to_date ? new Date(t.to_date).toISOString().split("T")[0] : "",
    task_worked: 0 
  }));

  return (
    <>
      <Topbar title="My Gantt Chart" breadcrumb="My Schedule" user={user.name} role={user.role} />
      <div className="page-body">
        {projects.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <p>You have no tasks assigned in any project.</p>
            </div>
          </div>
        ) : (
          <GanttChartClientComponent
            projects={projects}
            selectedProject={selectedProject}
            tasks={tasks}
          />
        )}
      </div>
    </>
  );
}
