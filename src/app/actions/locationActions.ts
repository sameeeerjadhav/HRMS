"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveLocation(formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string || null;
    const latitude = Number(formData.get("latitude") || 0);
    const longitude = Number(formData.get("longitude") || 0);
    const radius_m = Number(formData.get("radius_m") || 200);
    const is_remote = formData.get("is_remote") === "on";

    if (id) {
      await prisma.attendance_locations.update({
        where: { id: Number(id) },
        data: {
          name,
          address,
          latitude,
          longitude,
          radius_m,
          is_remote,
        },
      });
    } else {
      await prisma.attendance_locations.create({
        data: {
          name,
          address,
          latitude,
          longitude,
          radius_m,
          is_remote,
          is_active: true,
        },
      });
    }

    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error: any) {
    console.error("Save Location Error:", error);
    return { success: false, error: error.message || "Failed to save location." };
  }
}

export async function toggleLocationStatus(id: number, currentStatus: boolean) {
  try {
    await prisma.attendance_locations.update({
      where: { id },
      data: { is_active: !currentStatus },
    });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteLocation(id: number) {
  try {
    await prisma.attendance_locations.delete({
      where: { id }
    });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete location." };
  }
}
