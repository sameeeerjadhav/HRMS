import Topbar from "@/components/Topbar";
import ProjectsClientComponent from "@/components/ProjectsClientComponent";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProjectsPage() {
  const dbProjects = await prisma.projects.findMany({
    include: { users: true },
    orderBy: { created_at: 'desc' }
  });

  const projects = dbProjects.map(p => ({
    id: p.id,
    project_code: p.project_code || `PRJ-${p.id}`,
    project_name: p.project_name,
    client_name: p.client_name || "Internal",
    manager_name: p.users?.name || "Unassigned",
    deadline_date: p.deadline_date ? new Date(p.deadline_date).toISOString().split('T')[0] : "",
    total_hours: Number(p.total_hours || 0),
    worked_hours: Number(p.budget_hours || 0), // Use budget_hours as a mock for worked_hours since there is no worked_hours column
    status: p.status || "Active",
  }));

  const stats = {
    total: projects.length,
    deadlinePassed: projects.filter(p => new Date(p.deadline_date) < new Date() && p.status !== "Completed").length,
    completed: projects.filter(p => p.status === "Completed").length,
  };



  return (
    <>
      <Topbar title="Projects" breadcrumb="Project Management" user="Admin User" role="Admin" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Projects</h1>
            <p>Manage client projects, assign managers, and track progress.</p>
          </div>
          <div className="page-header-actions">
            <Link href="/admin/add_project" className="btn btn-primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
              <svg viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.deadlinePassed}</div>
              <div className="stat-label">Deadline Passed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
              <svg viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <ProjectsClientComponent initialProjects={projects} />
      </div>
    </>
  );
}
