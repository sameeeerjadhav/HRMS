"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEmployeeProfile(userId: number, formData: FormData) {
  try {
    // Find the employee record linked to this user. We rely on the email match since we didn't add user_id directly to employees table in schema
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found." };
    
    const employee = await prisma.employees.findFirst({
      where: { email: user.email }
    });

    if (!employee) {
      return { success: false, error: "Employee profile not found." };
    }

    const data = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      phone: formData.get("phone") as string,
      personal_email: formData.get("personal_email") as string,
      date_of_birth: formData.get("date_of_birth") ? new Date(formData.get("date_of_birth") as string) : null,
      gender: formData.get("gender") as any,
      blood_group: formData.get("blood_group") as string,
      emergency_contact_no: formData.get("emergency_contact_no") as string,
      address_line1: formData.get("address_line1") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
    };

    await prisma.employees.update({
      where: { id: employee.id },
      data
    });

    revalidatePath("/employee/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Internal server error." };
  }
}
