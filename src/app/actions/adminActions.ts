"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateAppSetting(key: string, value: string) {
  try {
    await prisma.app_settings.upsert({
      where: { setting_key: key },
      update: { setting_value: value, updated_at: new Date() },
      create: { setting_key: key, setting_value: value },
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating setting:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function createEmployee(
  firstName: string,
  lastName: string,
  email: string,
  role: "employee" | "manager" | "admin",
  departmentId: number | null,
  jobTitle: string
) {
  try {
    // 1. Create Login User
    const hashedPassword = await bcrypt.hash("Buhler@123", 10);
    const user = await prisma.users.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: email,
        password: hashedPassword,
        role: role,
        status: "active",
      }
    });

    // 2. Create Employee Profile
    await prisma.employees.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        department_id: departmentId,
        job_title: jobTitle,
        status: "Active",
      }
    });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating employee:", error);
    if (error.code === 'P2002') {
        return { success: false, error: "An employee with this email already exists." };
    }
    return { success: false, error: "Internal server error." };
  }
}

export async function deleteEmployee(id: number) {
  try {
    await prisma.users.delete({ where: { id } });
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
