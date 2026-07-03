import Topbar from "@/components/Topbar";
import EmployeesClientComponent from "@/components/EmployeesClientComponent";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const dbEmployees = await prisma.employees.findMany();
  const dbDepartments = await prisma.departments.findMany();

  const active = dbEmployees.filter(e => e.status === "Active").length;
  const fte = dbEmployees.filter(e => e.employee_type === "FTE").length;
  const external = dbEmployees.filter(e => e.employee_type !== "FTE").length;

  const stats = {
    total: dbEmployees.length,
    active,
    fte,
    external,
  };

  const departments = dbDepartments.map(d => d.name);

  const employees = dbEmployees.map((e: any) => {
    const dept = dbDepartments.find(d => d.id === e.department_id);
    return {
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      email: e.email,
      department: dept?.name || "Unassigned",
      job_title: e.job_title || "Unknown",
      type: e.employee_type,
      status: (e.status || "Active").toLowerCase(),
      joined: e.date_of_joining ? new Date(e.date_of_joining).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A",
    };
  });

  return (
    <>
      <Topbar title="Employees" breadcrumb="Workforce Directory" user="Admin User" role="Admin" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Employee Directory</h1>
            <p>Manage your workforce — view profiles, track headcount, and onboard new hires.</p>
          </div>
          <div className="page-header-actions">
            <Link href="/admin/add_employee" className="btn btn-primary">
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Employee
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#eef2ff", color: "var(--brand)" }}>
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
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
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.fte}</div>
              <div className="stat-label">FTE</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-value">{stats.external}</div>
              <div className="stat-label">External</div>
            </div>
          </div>
        </div>

        <EmployeesClientComponent initialEmployees={employees} departments={departments} />
      </div>
    </>
  );
}
