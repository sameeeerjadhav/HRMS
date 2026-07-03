"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitRegularizationRequest(
  userId: number,
  date: string,
  clockInStr: string,
  clockOutStr: string,
  reason: string
) {
  try {
    const logDate = new Date(date);
    
    // Convert time strings (HH:mm) to valid date-times for the given date
    const reqIn = new Date(`${date}T${clockInStr}:00`);
    const reqOut = new Date(`${date}T${clockOutStr}:00`);

    await prisma.attendance_regularizations.create({
      data: {
        user_id: userId,
        log_date: logDate,
        req_clock_in: reqIn,
        req_clock_out: reqOut,
        reason: reason,
        status: "pending",
        escalated: false,
      }
    });

    revalidatePath("/employee/regularizations");
    revalidatePath("/manager");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting regularization:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function approveRegularization(id: number, managerId: number) {
  try {
    const request = await prisma.attendance_regularizations.findUnique({
      where: { id }
    });

    if (!request || request.status !== "pending") {
      return { success: false, error: "Request not found or not pending." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update request status
      await tx.attendance_regularizations.update({
        where: { id },
        data: {
          status: "approved",
          reviewed_by: managerId,
          reviewed_at: new Date(),
          escalated: false,
        }
      });

      // 2. Patch or create the attendance_logs row
      const existingLog = await tx.attendance_logs.findFirst({
        where: { user_id: request.user_id, log_date: request.log_date }
      });

      const workSeconds = Math.floor((request.req_clock_out.getTime() - request.req_clock_in.getTime()) / 1000);

      if (existingLog) {
        await tx.attendance_logs.update({
          where: { id: existingLog.id },
          data: {
            clock_in: request.req_clock_in,
            clock_out: request.req_clock_out,
            work_seconds: workSeconds,
            status: "present", // Regularized to present
          }
        });
      } else {
        await tx.attendance_logs.create({
          data: {
            user_id: request.user_id,
            log_date: request.log_date,
            clock_in: request.req_clock_in,
            clock_out: request.req_clock_out,
            work_seconds: workSeconds,
            status: "present",
          }
        });
      }
    });

    revalidatePath("/manager");
    revalidatePath("/admin/regularizations");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving regularization:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function rejectRegularization(id: number, managerId: number, note: string) {
  try {
    await prisma.attendance_regularizations.update({
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
    revalidatePath("/admin/regularizations");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting regularization:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function clockIn(userId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.attendance_logs.findFirst({
      where: { user_id: userId, log_date: { gte: today } },
    });

    if (existingLog && existingLog.clock_in) {
      return { success: false, error: "Already clocked in today." };
    }

    const now = new Date();
    
    if (existingLog) {
      await prisma.attendance_logs.update({
        where: { id: existingLog.id },
        data: { clock_in: now, status: "present" }
      });
    } else {
      await prisma.attendance_logs.create({
        data: {
          user_id: userId,
          log_date: today,
          clock_in: now,
          status: "present",
        }
      });
    }
    
    revalidatePath("/employee");
    revalidatePath("/employee/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error clocking in:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function clockOut(userId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.attendance_logs.findFirst({
      where: { user_id: userId, log_date: { gte: today } },
    });

    if (!existingLog || !existingLog.clock_in) {
      return { success: false, error: "Not clocked in today." };
    }

    if (existingLog.clock_out) {
      return { success: false, error: "Already clocked out today." };
    }

    const now = new Date();
    const workSeconds = Math.floor((now.getTime() - new Date(existingLog.clock_in).getTime()) / 1000) + (existingLog.work_seconds || 0);

    await prisma.attendance_logs.update({
      where: { id: existingLog.id },
      data: { clock_out: now, work_seconds: workSeconds }
    });

    revalidatePath("/employee");
    revalidatePath("/employee/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error clocking out:", error);
    return { success: false, error: "Internal server error." };
  }
}

