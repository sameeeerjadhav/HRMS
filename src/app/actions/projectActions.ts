"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveProject(data: FormData) {
  try {
    const id = data.get("id") as string;
    const project_code = data.get("project_code") as string;
    const project_name = data.get("project_name") as string;
    const client_name = data.get("client_name") as string;
    const priority = data.get("priority") as "High" | "Medium" | "Low";
    const status = (data.get("status") || "Planning") as "Planning" | "Active" | "On_Hold" | "Completed" | "Cancelled";
    const manager_id = data.get("manager_id") ? Number(data.get("manager_id")) : null;
    const start_date = new Date(data.get("start_date") as string);
    const deadline_date = new Date(data.get("deadline_date") as string);
    const budget_hours = Number(data.get("budget_hours"));
    const hr_rate = Number(data.get("hr_rate"));
    const description = data.get("description") as string;

    const payload = {
      project_code,
      project_name,
      client_name,
      priority,
      status,
      manager_id,
      start_date,
      deadline_date,
      budget_hours,
      hr_rate,
      description,
    };

    if (id) {
      await prisma.projects.update({
        where: { id: Number(id) },
        data: payload,
      });
    } else {
      await prisma.projects.create({
        data: payload,
      });
    }

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving project:", error);
    if (error.code === 'P2002') {
       return { success: false, error: "A project with this Project Code already exists." };
    }
    return { success: false, error: "Internal server error." };
  }
}

export async function deleteProject(id: number) {
  try {
    await prisma.projects.delete({ where: { id } });
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete project." };
  }
}
