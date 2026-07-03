"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSalaryStructure(formData: FormData) {
  try {
    const userId = Number(formData.get("user_id"));
    const employeeId = Number(formData.get("employee_id") || 0);

    const payload = {
      gross_salary: Number(formData.get("gross_salary") || 0),
      basic_salary: Number(formData.get("basic_salary") || 0),
      hra: Number(formData.get("hra") || 0),
      conveyance: Number(formData.get("conveyance") || 0),
      education_allowance: Number(formData.get("education_allowance") || 0),
      lta: Number(formData.get("lta") || 0),
      medical_reimbursement: Number(formData.get("medical_reimbursement") || 0),
      mobile_internet: Number(formData.get("mobile_internet") || 0),
      bonus: Number(formData.get("bonus") || 0),
      tax_regime: (formData.get("tax_regime") as string || "new") as any,
      epf_employee_rate: Number(formData.get("epf_employee_rate") || 0),
      eps_employer_rate: Number(formData.get("eps_employer_rate") || 0),
      edli_employer_rate: Number(formData.get("edli_employer_rate") || 0),
      epf_admin_rate: Number(formData.get("epf_admin_rate") || 0),
      esi_employee_rate: Number(formData.get("esi_employee_rate") || 0),
      esi_employer_rate: Number(formData.get("esi_employer_rate") || 0),
      custom_additions: formData.get("custom_additions") ? String(formData.get("custom_additions")) : "[]",
      custom_deductions: formData.get("custom_deductions") ? String(formData.get("custom_deductions")) : "[]",
    };

    await prisma.salary_structures.upsert({
      where: { user_id: userId },
      update: payload,
      create: {
        user_id: userId,
        employee_id: employeeId || userId, // Fallback if no specific emp id passed
        ...payload,
      }
    });

    revalidatePath("/admin/salary_structure");
    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("Save Salary Structure error:", error);
    return { success: false, error: "Failed to save salary structure." };
  }
}

export async function applySalaryTemplate(userIds: number[], templateName: string) {
  try {
    // In a real application, you'd fetch the template from a `salary_templates` table
    // For this demonstration, we'll apply a mock template update based on the string name.
    
    // As a mock, we'll just bump up their basic salary to simulate template application
    for (const id of userIds) {
      await prisma.salary_structures.upsert({
        where: { user_id: id },
        update: {
          tax_regime: (templateName.includes("New") ? "new" : "old") as any
        },
        create: {
          user_id: id,
          employee_id: id,
          tax_regime: (templateName.includes("New") ? "new" : "old") as any
        }
      });
    }

    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("Apply template error:", error);
    return { success: false, error: "Failed to apply template." };
  }
}

export async function generatePayslips(month: number, year: number) {
  try {
    // Fetch all active salary structures
    const structures = await prisma.salary_structures.findMany();
    
    for (const str of structures) {
      // Check if payslip already exists
      const existing = await prisma.payslips.findFirst({
        where: { user_id: str.user_id, month, year }
      });

      if (!existing) {
        // Create new payslip
        const earnings = Number(str.basic_salary) + Number(str.hra) + Number(str.conveyance); // Simplified
        const deductions = Number(str.basic_salary) * (Number(str.epf_employee_rate) / 100);

        await prisma.payslips.create({
          data: {
            user_id: str.user_id,
            month,
            year,
            gross_salary: str.gross_salary,
            basic_salary: str.basic_salary,
            hra: str.hra,
            conveyance: str.conveyance,
            total_earnings: earnings,
            epf_employee: deductions,
            total_deductions: deductions,
            net_payable: earnings - deductions,
          }
        });
      }
    }

    revalidatePath("/admin/payslips");
    return { success: true };
  } catch (error: any) {
    console.error("Generate payslips error:", error);
    return { success: false, error: "Failed to generate payslips." };
  }
}

export async function savePayslipArrears(userId: number, month: number, year: number, amount: number) {
  try {
    const existing = await prisma.payslips.findFirst({
      where: { user_id: userId, month, year }
    });
    
    if (existing) {
      await prisma.payslips.update({
        where: { id: existing.id },
        data: {
          arrears_earning: amount,
          total_earnings: Number(existing.total_earnings) + amount,
          net_payable: Number(existing.net_payable) + amount
        }
      });
    }
    
    revalidatePath("/admin/payslips");
    return { success: true };
  } catch (error: any) {
    console.error("Save Arrears error:", error);
    return { success: false, error: "Failed to save arrears." };
  }
}
