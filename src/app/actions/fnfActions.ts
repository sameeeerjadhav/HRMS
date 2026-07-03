"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettlement(data: {
  id?: number;
  user_id: number;
  last_working_day: string;
  days_worked: number;
  working_days_month: number;
  pl_days: number;
  pl_encashment: number;
  bonus: number;
  notice_period: number;
  notice_served: number;
  notice_shortfall_deduction: number;
  outstanding_recovery: number;
  custom_items: string; // JSON string
  total_earnings: number;
  total_deductions: number;
  net_settlement: number;
}) {
  try {
    if (data.id) {
      await prisma.fnf_settlements.update({
        where: { id: data.id },
        data: {
          last_working_day: new Date(data.last_working_day),
          days_worked: data.days_worked,
          working_days_month: data.working_days_month,
          pl_days: data.pl_days,
          pl_encashment: data.pl_encashment,
          bonus: data.bonus,
          notice_period: data.notice_period,
          notice_served: data.notice_served,
          notice_shortfall_deduction: data.notice_shortfall_deduction,
          outstanding_recovery: data.outstanding_recovery,
          custom_items: data.custom_items,
          total_earnings: data.total_earnings,
          total_deductions: data.total_deductions,
          net_settlement: data.net_settlement,
        },
      });
    } else {
      await prisma.fnf_settlements.create({
        data: {
          user_id: data.user_id,
          last_working_day: new Date(data.last_working_day),
          days_worked: data.days_worked,
          working_days_month: data.working_days_month,
          pl_days: data.pl_days,
          pl_encashment: data.pl_encashment,
          bonus: data.bonus,
          notice_period: data.notice_period,
          notice_served: data.notice_served,
          notice_shortfall_deduction: data.notice_shortfall_deduction,
          outstanding_recovery: data.outstanding_recovery,
          custom_items: data.custom_items,
          total_earnings: data.total_earnings,
          total_deductions: data.total_deductions,
          net_settlement: data.net_settlement,
        },
      });
    }

    revalidatePath("/admin/fnf_settlement");
    return { success: true };
  } catch (error: any) {
    console.error("F&F error:", error);
    return { success: false, error: "Failed to save F&F settlement" };
  }
}

export async function deleteSettlement(id: number) {
  try {
    await prisma.fnf_settlements.delete({
      where: { id }
    });
    revalidatePath("/admin/fnf_settlement");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete" };
  }
}
