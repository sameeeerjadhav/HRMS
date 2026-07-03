"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTask(
  managerId: number,
  projectId: number,
  assignedToUserId: number,
  subtaskName: string,
  fromDate: string,
  toDate: string,
  hours: number
) {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    await prisma.task_assignments.create({
      data: {
        project_id: projectId,
        assigned_to: assignedToUserId,
        assigned_by: managerId,
        subtask: subtaskName,
        from_date: from,
        to_date: to,
        hours: hours,
        status: "Pending",
      }
    });

    revalidatePath("/manager/tasks");
    revalidatePath("/employee/my_tasks");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating task:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function updateTaskStatus(id: number, status: "Pending" | "In_Progress" | "Completed" | "On_Hold") {
  try {
    await prisma.task_assignments.update({
      where: { id },
      data: {
        status: status
      }
    });

    revalidatePath("/manager/tasks");
    revalidatePath("/employee/my_tasks");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating task status:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function logTaskHours(taskId: number, userId: number, hoursWorked: number, logDate: string) {
    try {
        const attendanceRecord = await prisma.attendance_logs.findFirst({
            where: {
                user_id: userId,
                log_date: new Date(logDate),
            }
        });

        if (!attendanceRecord) {
            return { success: false, error: "Attendance log required for the date." };
        }

        await prisma.task_progress_logs.create({
            data: {
                task_id: taskId,
                user_id: userId,
                attendance_id: attendanceRecord.id,
                log_date: new Date(logDate),
                hours_worked: hoursWorked,
                progress: "In_Progress"
            }
        });
        
        revalidatePath("/employee/my_tasks");
        return { success: true };
    } catch (error: any) {
        console.error("Error logging task hours:", error);
        return { success: false, error: "Internal server error." };
    }
}
