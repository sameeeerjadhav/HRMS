import Topbar from "@/components/Topbar";
import AddProjectClientComponent from "@/components/AddProjectClientComponent";
import { prisma } from "@/lib/prisma";

export default async function AddProjectPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  const dbUsers = await prisma.users.findMany({
    where: { role: { in: ["manager", "admin"] } }
  });

  const managers = dbUsers.map(u => ({
    id: u.id,
    name: u.name
  }));

  let project = null;
  if (searchParams.id) {
    const rawProj = await prisma.projects.findUnique({
      where: { id: Number(searchParams.id) }
    });
    
    if (rawProj) {
      project = {
        ...rawProj,
        start_date: rawProj.start_date.toISOString(),
        deadline_date: rawProj.deadline_date.toISOString(),
        budget_hours: rawProj.budget_hours.toString(),
        hr_rate: rawProj.hr_rate.toString(),
        total_hours: rawProj.total_hours.toString(),
      };
    }
  }

  return (
    <>
      <Topbar title={project ? "Edit Project" : "Add Project"} breadcrumb="Projects / Add New Project" user="Admin User" role="Admin" />
      <div className="page-body">
        <AddProjectClientComponent managers={managers} initialData={project} />
      </div>
    </>
  );
}
