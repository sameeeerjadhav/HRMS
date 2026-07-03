import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const totalEmployees = await prisma.employees.count();
  const activeEmployees = await prisma.employees.count({ where: { status: 'Active' } });
  
  const fteEmployees = await prisma.employees.count({ where: { employee_type: 'FTE' } });
  const externalEmployees = await prisma.employees.count({ where: { employee_type: { not: 'FTE' } } });

  const stats = {
    total: totalEmployees,
    active: activeEmployees,
    fte: fteEmployees,
    external: externalEmployees,
  };

  const dbRecent = await prisma.employees.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });

  const recentEmployees = dbRecent.map(e => ({
    name: `${e.first_name} ${e.last_name || ''}`.trim(),
    email: e.email,
    status: e.status || "Active",
    created_at: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
  }));

  return (
    <>
      <Topbar title="Dashboard" breadcrumb="Welcome back, Admin" user="Admin User" role="Admin" />

      <div className="page-body">
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
              <div className="stat-label">Total Employees</div>
              <div className="stat-sub">All records</div>
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
              <div className="stat-sub">Currently active</div>
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
              <div className="stat-label">Full-Time (FTE)</div>
              <div className="stat-sub">Permanent staff</div>
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
              <div className="stat-label">External / Contract</div>
              <div className="stat-sub">Non-permanent</div>
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <h2>Recent Employees</h2>
            <Link href="/admin/employees" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={3}>
                    No employees yet.{" "}
                    <Link href="/admin/add_employee" style={{ color: "var(--brand)" }}>
                      Add one →
                    </Link>
                  </td>
                </tr>
              ) : (
                recentEmployees.map((e, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="td-user">
                        <div className="td-avatar">
                          {e.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="td-name">{e.name}</div>
                          <div className="td-sub">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          e.status.toLowerCase() === "active" ? "badge-green" : "badge-red"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(e.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
