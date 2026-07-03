import Topbar from "@/components/Topbar";
import EditEmployeeClientComponent from "@/components/EditEmployeeClientComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || user.role !== "admin") return null;

  const employeeId = parseInt(params.id);
  if (isNaN(employeeId)) redirect("/admin/employees");

  const dbEmployee = await prisma.employees.findUnique({
    where: { id: employeeId }
  });

  if (!dbEmployee) {
    redirect("/admin/employees");
  }

  const employee_documents = await prisma.$queryRawUnsafe(
    `SELECT * FROM employee_documents WHERE employee_id = ?`,
    employeeId
  );

  const departments = await prisma.departments.findMany();

  // Parse decimals to numbers for client components
  const employee = {
    ...dbEmployee,
    gross_salary: dbEmployee.gross_salary ? Number(dbEmployee.gross_salary) : null,
    employee_provident_fund: dbEmployee.employee_provident_fund ? Number(dbEmployee.employee_provident_fund) : null,
    professional_tax: dbEmployee.professional_tax ? Number(dbEmployee.professional_tax) : null,
    date_of_birth: dbEmployee.date_of_birth ? dbEmployee.date_of_birth.toISOString().split("T")[0] : null,
    date_of_joining: dbEmployee.date_of_joining ? dbEmployee.date_of_joining.toISOString().split("T")[0] : null,
    date_of_exit: dbEmployee.date_of_exit ? dbEmployee.date_of_exit.toISOString().split("T")[0] : null,
    date_of_confirmation: dbEmployee.date_of_confirmation ? dbEmployee.date_of_confirmation.toISOString().split("T")[0] : null,
    passport_date_of_issue: dbEmployee.passport_date_of_issue ? dbEmployee.passport_date_of_issue.toISOString().split("T")[0] : null,
    passport_date_of_expiry: dbEmployee.passport_date_of_expiry ? dbEmployee.passport_date_of_expiry.toISOString().split("T")[0] : null,
  };

  return (
    <>
      <Topbar title="Edit Employee" breadcrumb="Employees > Edit Employee" user={user.name} role={user.role} />
      <div className="page-body">
        <EditEmployeeClientComponent 
          employee={employee} 
          departments={departments} 
          documents={employee_documents as any[]} 
        />
      </div>
    </>
  );
}
