import Topbar from "@/components/Topbar";
import ProjectExpensesClientComponent from "@/components/ProjectExpensesClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminProjectExpensesPage() {
  const dbProjects = await prisma.projects.findMany();
  const dbExpenses = await prisma.project_expenses.findMany({
    orderBy: { expense_date: 'desc' }
  });

  const projects = dbProjects.map(p => ({
    id: p.id,
    project_name: p.project_name,
    project_code: p.project_code || `PRJ-${p.id}`,
  }));

  const expenses = dbExpenses.map(e => {
    const proj = projects.find(p => p.id === e.project_id);
    return {
      id: e.id,
      project_id: e.project_id,
      project_code: proj?.project_code || `PRJ-${e.project_id}`,
      expense_date: e.expense_date ? new Date(e.expense_date).toISOString().split('T')[0] : "",
      category: e.category as "Travel" | "Food" | "Hotel" | "Other" || "Other",
      amount: Number(e.amount),
      description: e.description || "",
    };
  });

  return (
    <>
      <Topbar title="Project Expenses" breadcrumb="Track project costs" user="Admin User" role="Admin" />
      <div className="page-body">
        <ProjectExpensesClientComponent projects={projects} initialExpenses={expenses} />
      </div>
    </>
  );
}
