import Topbar from "@/components/Topbar";
import ManagerTasksClientComponent from "@/components/ManagerTasksClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function ManagerTasksPage() {
  const user = await getUser();
  if (!user) return null;

  const dbTasks = await prisma.task_assignments.findMany({
    include: {
      projects: true,
      users_task_assignments_assigned_toTousers: true,
    },
    orderBy: { to_date: "asc" }
  });

  const tasks = dbTasks.map((t: any) => ({
    id: t.id,
    project_name: t.projects?.project_name || "Unknown",
    task_name: t.subtask,
    status: (t.status?.toLowerCase().replace(" ", "_") || "todo") as "todo" | "in_progress" | "review" | "done",
    priority: "medium" as "medium" | "low" | "high",
    assignee: t.users_task_assignments_assigned_toTousers?.name || "Unassigned",
    due_date: t.to_date ? new Date(t.to_date).toISOString().split("T")[0] : "",
  }));

  const dbProjects = await prisma.projects.findMany();
  const projects = dbProjects.map(p => ({ id: p.id, name: p.project_name }));

  const managerEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const dbTeam = managerEmp?.department_id 
    ? await prisma.employees.findMany({ where: { department_id: managerEmp.department_id } })
    : [];
  
  const teamMembers = dbTeam.map(emp => ({ id: emp.id, name: `${emp.first_name} ${emp.last_name || ''}`.trim() }));

  return (
    <>
      <Topbar title="Tasks" breadcrumb="Track and manage work" user={user.name} role={user.role} />
      <div className="page-body">
        <ManagerTasksClientComponent
          initialTasks={tasks}
          projects={projects}
          teamMembers={teamMembers}
          managerId={user.id}
        />
      </div>
    </>
  );
}
