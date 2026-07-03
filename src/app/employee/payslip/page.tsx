import Topbar from "@/components/Topbar";
import EmployeePayslipClientComponent from "@/components/EmployeePayslipClientComponent";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export default async function EmployeePayslipPage() {
  const user = await getUser();
  if (!user) return null;

  const dbPayslips = await prisma.payslips.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' }
  });

  const payslips = dbPayslips.map(p => ({
    id: p.id,
    month: `${p.year}-${String(p.month).padStart(2, '0')}`,
    generated_on: new Date(p.created_at).toISOString().split("T")[0],
    net_pay: Number(p.net_payable || 0),
  }));

  return (
    <>
      <Topbar title="Payslips" breadcrumb="Salary Records" user={user.name} role={user.role} />
      <div className="page-body">
        <EmployeePayslipClientComponent payslips={payslips} />
      </div>
    </>
  );
}
