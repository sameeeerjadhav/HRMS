"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequest(
  userId: number,
  leaveTypeId: number,
  fromDate: string,
  toDate: string,
  days: number,
  reason: string
) {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Validate balance
    const balanceRecord = await prisma.leave_balances.findFirst({
      where: {
        user_id: userId,
        leave_type_id: leaveTypeId,
      }
    });

    if (!balanceRecord || Number(balanceRecord.balance) < days) {
      return { success: false, error: "Insufficient leave balance." };
    }

    // Insert leave application
    await prisma.leave_applications.create({
      data: {
        user_id: userId,
        leave_type_id: leaveTypeId,
        from_date: from,
        to_date: to,
        days: days,
        reason: reason,
        status: "pending",
        escalated: false,
      }
    });

    revalidatePath("/employee/my_leaves");
    revalidatePath("/manager");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting leave:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function approveLeave(id: number, managerId: number) {
  try {
    const leave = await prisma.leave_applications.findUnique({
      where: { id }
    });

    if (!leave || leave.status !== "pending") {
      return { success: false, error: "Leave not found or not pending." };
    }

    // Wrap in transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // 1. Update application
      await tx.leave_applications.update({
        where: { id },
        data: {
          status: "approved",
          reviewed_by: managerId,
          reviewed_at: new Date(),
          escalated: false,
        }
      });

      // 2. Deduct from balance and add to used
      const balanceRecord = await tx.leave_balances.findFirst({
        where: {
          user_id: leave.user_id,
          leave_type_id: leave.leave_type_id,
        }
      });

      if (balanceRecord) {
        await tx.leave_balances.update({
          where: { id: balanceRecord.id },
          data: {
            balance: Number(balanceRecord.balance) - Number(leave.days),
            used: Number(balanceRecord.used) + Number(leave.days)
          }
        });
      }
    });

    revalidatePath("/manager");
    revalidatePath("/admin/leave_requests");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving leave:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function rejectLeave(id: number, managerId: number, note: string) {
  try {
    await prisma.leave_applications.update({
      where: { id },
      data: {
        status: "rejected",
        reviewed_by: managerId,
        reviewed_at: new Date(),
        review_note: note,
        escalated: false,
      }
    });

    revalidatePath("/manager");
    revalidatePath("/admin/leave_requests");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting leave:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function saveLeaveType(formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const days_per_credit = Number(formData.get("days_per_credit") || 0);
    const credit_cycle = (formData.get("credit_cycle") as string) || "yearly";
    const max_carry_fwd = Number(formData.get("max_carry_fwd") || 0);
    const color = (formData.get("color") as string) || "#6366f1";

    if (id) {
      await prisma.leave_types.update({
        where: { id: Number(id) },
        data: {
          name,
          days_per_credit,
          credit_cycle: credit_cycle as any,
          max_carry_fwd,
          color,
        },
      });
    } else {
      await prisma.leave_types.create({
        data: {
          name,
          days_per_credit,
          credit_cycle: credit_cycle as any,
          max_carry_fwd,
          color,
          is_active: true,
          credit_day: 1
        },
      });
    }
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save leave type." };
  }
}

export async function toggleLeaveType(id: number, currentStatus: boolean) {
  try {
    await prisma.leave_types.update({
      where: { id },
      data: { is_active: !currentStatus },
    });
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
