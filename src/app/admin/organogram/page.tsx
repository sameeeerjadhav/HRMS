import Topbar from "@/components/Topbar";
import OrganogramClientComponent from "@/components/OrganogramClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminOrganogramPage() {
  const employees = await prisma.employees.findMany();

  // Convert the flat employees list into a nested tree structure
  const buildTree = (employees: any[], managerName: string | null): any[] => {
    return employees
      .filter(emp => (emp.direct_manager_name === managerName || (!managerName && !emp.direct_manager_name)))
      .map(emp => ({
        id: `u_${emp.id}`,
        name: `${emp.first_name} ${emp.last_name || ""}`.trim(),
        job_title: emp.job_title || "Employee",
        department_name: emp.department_id ? `Dept-${emp.department_id}` : "No Department",
        role: ((emp.job_title || "").toLowerCase().includes("ceo") ? "admin" : (emp.direct_manager_name ? "employee" : "manager")) as "admin" | "manager" | "employee",
        photo: null,
        manager_name: emp.direct_manager_name || null,
        children: buildTree(employees, `${emp.first_name} ${emp.last_name || ""}`.trim()),
      }));
  };

  // Find the CEO/Top level nodes (nodes with no manager, or where the manager does not exist in the list)
  const allNames = new Set(employees.map(emp => `${emp.first_name} ${emp.last_name || ""}`.trim()));
  const topLevelEmployees = employees.filter(emp => !emp.direct_manager_name || !allNames.has(emp.direct_manager_name));

  const initialTree = topLevelEmployees.map(top => ({
    id: `u_${top.id}`,
    name: `${top.first_name} ${top.last_name || ""}`.trim(),
    job_title: top.job_title || "Top Level",
    department_name: top.department_id ? `Dept-${top.department_id}` : "Executive",
    role: "admin" as "admin" | "manager" | "employee",
    photo: null,
    manager_name: null,
    children: buildTree(employees, `${top.first_name} ${top.last_name || ""}`.trim()),
  }));

  const initialFlat = employees.map(emp => ({
    id: `u_${emp.id}`,
    name: `${emp.first_name} ${emp.last_name || ""}`.trim(),
    job_title: emp.job_title || "Employee",
    department_name: emp.department_id ? `Dept-${emp.department_id}` : "No Department",
    role: ((emp.job_title || "").toLowerCase().includes("ceo") ? "admin" : "employee") as "admin" | "manager" | "employee",
    photo: null,
    manager_name: emp.direct_manager_name || null,
  }));

  return (
    <>
      <Topbar title="Organogram" breadcrumb="Company hierarchy & structure" user="Admin User" role="Admin" />
      <div className="page-body">
        <OrganogramClientComponent treeData={initialTree} flatData={initialFlat} />
      </div>
    </>
  );
}
