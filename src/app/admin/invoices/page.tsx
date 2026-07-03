import Topbar from "@/components/Topbar";
import InvoicesClientComponent from "@/components/InvoicesClientComponent";
import { prisma } from "@/lib/prisma";

export default async function AdminInvoicesPage() {
  const dbProjects = await prisma.projects.findMany();
  
  // The table is actually called project_invoices
  const dbInvoices = await prisma.project_invoices.findMany({
    orderBy: { invoice_date: 'desc' }
  });

  const projects = dbProjects.map(p => ({
    id: p.id,
    project_name: p.project_name,
    project_code: p.project_code || `PRJ-${p.id}`,
    total_hours: Number(p.total_hours || 0),
    hr_rate: Number(p.hr_rate || 0)
  }));

  const invoices = dbInvoices.map((inv: any) => {
    const proj = projects.find(p => p.id === inv.project_id);
    return {
      id: inv.id,
      invoice_no: inv.invoice_no,
      project_id: inv.project_id,
      project_name: proj?.project_name || "Unknown",
      project_code: proj?.project_code || `PRJ-${inv.project_id}`,
      invoice_date: new Date(inv.invoice_date).toISOString().split("T")[0],
      due_date: inv.due_date ? new Date(inv.due_date).toISOString().split("T")[0] : "",
      total_hours: Number(proj?.total_hours || 0),
      utilized_hours: Number(inv.utilized_hours || 0),
      rate_per_hour: Number(inv.rate_per_hour || 0),
      subtotal: Number(inv.subtotal || 0),
      tax_percent: Number(inv.tax_percent || 0),
      tax_amount: Number(inv.tax_amount || 0),
      total_amount: Number(inv.total_amount || 0),
      notes: inv.notes || "",
      status: inv.status || "Pending",
    };
  });

  return (
    <>
      <Topbar title="Invoices" breadcrumb="Project billing" user="Admin User" role="Admin" />
      <div className="page-body">
        <InvoicesClientComponent projects={projects} initialInvoices={invoices} />
      </div>
    </>
  );
}
