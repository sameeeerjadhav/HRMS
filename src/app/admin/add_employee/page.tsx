import Topbar from "@/components/Topbar";
import AddEmployeeClientComponent from "@/components/AddEmployeeClientComponent";
import { prisma } from "@/lib/prisma";

export default async function AddEmployeePage() {
  const departments = await prisma.departments.findMany();

  const deptList = departments.map(d => ({
    id: d.id,
    name: d.name
  }));

  return (
    <>
      <Topbar title="Add Employee" breadcrumb="Employees / Add New Employee" user="Admin User" role="Admin" />
      <div className="page-body">
        <AddEmployeeClientComponent departments={deptList} />
      </div>
    </>
  );
}
