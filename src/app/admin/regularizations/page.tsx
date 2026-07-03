import Topbar from "@/components/Topbar";
import RegularizationsClientComponent from "@/components/RegularizationsClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminRegularizationsPage() {
  const rawRequests = await prisma.attendance_regularizations.findMany({
    include: {
      users: true
    },
    orderBy: { created_at: "desc" }
  });

  const allEmployees = await prisma.employees.findMany();

  const dbRequests = rawRequests.map((r: any) => {
    const emp = allEmployees.find(e => e.email === r.users?.email);
    return {
      id: r.id,
      user_id: r.user_id,
      emp_name: r.users?.name || `Emp ${r.user_id}`,
      emp_email: r.users?.email || "",
      emp_role: r.users?.role || "Employee",
      employee_id: emp?.employee_id || `EMP-${r.user_id}`,
      manager_name: emp?.direct_manager_name || "Unassigned",
      date: r.log_date ? new Date(r.log_date).toISOString().split('T')[0] : "",
      log_date: r.log_date ? new Date(r.log_date).toISOString().split('T')[0] : "",
    request_clock_in: "09:00",
    request_clock_out: "18:00",
    req_clock_in: r.req_clock_in ? new Date(r.req_clock_in).toISOString() : "09:00",
    req_clock_out: r.req_clock_out ? new Date(r.req_clock_out).toISOString() : "18:00",
    actual_clock_in: null,
    actual_clock_out: null,
    reason: r.reason,
    status: (r.status.toLowerCase() === "pending" || r.status.toLowerCase() === "approved" || r.status.toLowerCase() === "rejected") ? r.status.toLowerCase() as "pending" | "approved" | "rejected" : "pending" as "pending" | "approved" | "rejected",
      escalated: false,
      created_at: new Date().toISOString(),
      escalated_at: null,
    };
  });

  return (
    <>
      <Topbar title="Regularizations" breadcrumb="Manager requests & escalated employee corrections" user="Admin User" role="Admin" />
      <div className="page-body">
        <RegularizationsClientComponent initialRegs={dbRequests} />
      </div>
    </>
  );
}
