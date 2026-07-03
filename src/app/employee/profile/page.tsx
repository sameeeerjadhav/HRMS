import Topbar from "@/components/Topbar";
import EmployeeProfileClientComponent from "@/components/EmployeeProfileClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeeProfilePage() {
  const user = await getUser();
  if (!user) return null;

  const dbEmp = await prisma.employees.findFirst({
    where: { email: user.email }
  });

  const dept = dbEmp?.department_id 
    ? await prisma.departments.findFirst({ where: { id: dbEmp.department_id } })
    : null;

  const profile = {
    first_name: dbEmp?.first_name || user.name.split(" ")[0],
    last_name: dbEmp?.last_name || user.name.split(" ")[1] || "",
    job_title: dbEmp?.job_title || "Employee",
    department_name: dept?.name || "Unassigned",
    employee_id: dbEmp?.employee_id || `EMP-${user.id}`,
    email: dbEmp?.email || user.email,
    phone: dbEmp?.phone || "",
    personal_email: dbEmp?.personal_email || "",
    date_of_birth: dbEmp?.date_of_birth ? new Date(dbEmp.date_of_birth).toISOString().split("T")[0] : "",
    gender: dbEmp?.gender || "",
    marital_status: dbEmp?.marital_status || "",
    blood_group: dbEmp?.blood_group || "",
    nationality: dbEmp?.nationality || "",
    place_of_birth: dbEmp?.place_of_birth || "",
    emergency_contact_no: dbEmp?.emergency_contact_no || "",
    
    address_line1: dbEmp?.address_line1 || "",
    address_line2: dbEmp?.address_line2 || "",
    city: dbEmp?.city || "",
    state: dbEmp?.state || "",
    zip_code: dbEmp?.zip_code || "",
    country: dbEmp?.country || "",

    passport_no: dbEmp?.passport_no || "",
    place_of_issue: dbEmp?.place_of_issue || "",
    passport_date_of_issue: dbEmp?.passport_date_of_issue ? new Date(dbEmp.passport_date_of_issue).toISOString().split("T")[0] : "",
    passport_date_of_expiry: dbEmp?.passport_date_of_expiry ? new Date(dbEmp.passport_date_of_expiry).toISOString().split("T")[0] : "",
  };

  return (
    <>
      <Topbar title="My Profile" breadcrumb="View Details" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeeProfileClientComponent profileData={profile} userId={user.id} />
      </div>
    </>
  );
}
