import Topbar from "@/components/Topbar";
import AddProjectClientComponent from "@/components/AddProjectClientComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getUser();
  if (!user || user.role !== "admin") return null;

  const projectId = parseInt(params.id);
  if (isNaN(projectId)) redirect("/admin/projects");

  const dbProject = await prisma.projects.findUnique({
    where: { id: projectId }
  });

  if (!dbProject) redirect("/admin/projects");

  const users = await prisma.users.findMany({
    where: { role: "manager" }
  });

  const managers = users.map(u => ({ id: u.id, name: u.name }));

  const initialData = {
    ...dbProject,
    budget_hours: dbProject.budget_hours ? Number(dbProject.budget_hours) : 0,
    hr_rate: dbProject.hr_rate ? Number(dbProject.hr_rate) : 0,
    start_date: dbProject.start_date ? dbProject.start_date.toISOString() : null,
    deadline_date: dbProject.deadline_date ? dbProject.deadline_date.toISOString() : null
  };

  return (
    <>
      <Topbar title="Edit Project" breadcrumb="Projects > Edit Project" user={user.name} role={user.role} />
      <div className="page-body">
        <AddProjectClientComponent managers={managers} initialData={initialData} />
      </div>
    </>
  );
}
