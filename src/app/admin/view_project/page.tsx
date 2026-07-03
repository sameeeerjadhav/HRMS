import Topbar from "@/components/Topbar";
import ViewProjectClientComponent from "@/components/ViewProjectClientComponent";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ViewProjectPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  if (!searchParams.id) return notFound();

  const project = await prisma.projects.findUnique({
    where: { id: Number(searchParams.id) }
  });

  if (!project) return notFound();

  const tasks = await prisma.task_assignments.findMany({
    where: { project_id: project.id }
  });

  const expenses = await prisma.project_expenses.findMany({
    where: { project_id: project.id }
  });

  // Serialize payload
  const serializedProject = {
    ...project,
    start_date: project.start_date.toISOString(),
    deadline_date: project.deadline_date.toISOString(),
    total_hours: project.total_hours.toString(),
    budget_hours: project.budget_hours.toString(),
    hr_rate: project.hr_rate.toString(),
  };

  const serializedTasks = tasks.map(t => ({
    ...t,
    utilized_hours: t.hours.toString(),
    created_at: t.created_at.toISOString(),
  }));

  const serializedExpenses = expenses.map(e => ({
    ...e,
    amount: e.amount.toString(),
    expense_date: e.expense_date.toISOString(),
    created_at: e.created_at.toISOString(),
  }));

  return (
    <>
      <Topbar title="Project Details" breadcrumb={`Projects / ${project.project_code}`} user="Admin User" role="Admin" />
      <div className="page-body">
        <ViewProjectClientComponent 
          project={serializedProject} 
          tasks={serializedTasks} 
          expenses={serializedExpenses} 
        />
      </div>
    </>
  );
}
