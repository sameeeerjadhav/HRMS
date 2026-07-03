import Topbar from "@/components/Topbar";
import PayslipViewClientComponent from "@/components/PayslipViewClientComponent";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PayslipViewPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  if (!searchParams.id) return notFound();

  const payslip = await prisma.payslips.findUnique({
    where: { id: Number(searchParams.id) }
  });

  if (!payslip) return notFound();

  const employee = await prisma.employees.findFirst({
    where: { email: { in: [await prisma.users.findUnique({ where: { id: payslip.user_id } }).then(u => u?.email || "")] } }
  }) || await prisma.employees.findFirst(); // Fallback

  if (!employee) return notFound();

  const serializeDecimal = (val: any) => val ? val.toString() : "0";

  const serializedPayslip = {
    ...payslip,
    gross_salary: serializeDecimal(payslip.gross_salary),
    basic_salary: serializeDecimal(payslip.basic_salary),
    hra: serializeDecimal(payslip.hra),
    special_allowance: serializeDecimal(payslip.special_allowance),
    conveyance: serializeDecimal(payslip.conveyance),
    education_allowance: serializeDecimal(payslip.education_allowance),
    lta: serializeDecimal(payslip.lta),
    mediclaim_insurance: serializeDecimal(payslip.mediclaim_insurance),
    medical_reimbursement: serializeDecimal(payslip.medical_reimbursement),
    mobile_internet: serializeDecimal(payslip.mobile_internet),
    personal_allowance: serializeDecimal(payslip.personal_allowance),
    bonus: serializeDecimal(payslip.bonus),
    arrears_earning: serializeDecimal(payslip.arrears_earning),
    total_earnings: serializeDecimal(payslip.total_earnings),
    income_tax: serializeDecimal(payslip.income_tax),
    professional_tax: serializeDecimal(payslip.professional_tax),
    epf_employee: serializeDecimal(payslip.epf_employee),
    esi_employee: serializeDecimal(payslip.esi_employee),
    eps_employer: serializeDecimal(payslip.eps_employer),
    edli_employer: serializeDecimal(payslip.edli_employer),
    epf_admin: serializeDecimal(payslip.epf_admin),
    esi_employer: serializeDecimal(payslip.esi_employer),
    arrears_deduction: serializeDecimal(payslip.arrears_deduction),
    total_deductions: serializeDecimal(payslip.total_deductions),
    total_employer_cost: serializeDecimal(payslip.total_employer_cost),
    net_payable: serializeDecimal(payslip.net_payable),
    days_payable: serializeDecimal(payslip.days_payable),
    created_at: payslip.created_at.toISOString(),
  };

  const serializedEmployee = {
    ...employee,
    date_of_birth: employee.date_of_birth ? employee.date_of_birth.toISOString() : null,
    date_of_joining: employee.date_of_joining ? employee.date_of_joining.toISOString() : null,
    date_of_exit: employee.date_of_exit ? employee.date_of_exit.toISOString() : null,
  };

  return (
    <>
      <Topbar title="Payslip" breadcrumb={`Payslips / View`} user="Employee User" role="Employee" />
      <div className="page-body">
        <PayslipViewClientComponent payslip={serializedPayslip} employee={serializedEmployee} />
      </div>
    </>
  );
}
