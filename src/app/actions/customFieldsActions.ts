"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomField(formData: FormData) {
  try {
    const fieldLabel = formData.get("field_label") as string;
    const fieldType = formData.get("field_type") as string;
    const isRequired = formData.get("is_required") === "on";
    
    if (!fieldLabel || !fieldType) {
      return { success: false, error: "Field Label and Field Type are required." };
    }

    // Generate a field name slug (e.g., "Blood Group" -> "blood_group")
    const fieldName = fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

    await prisma.custom_field_meta.create({
      data: {
        field_label: fieldLabel,
        field_name: fieldName,
        field_type: fieldType,
        is_required: isRequired,
      }
    });

    revalidatePath("/admin/custom_fields");
    revalidatePath("/admin/add_employee");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating custom field:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "A custom field with this label/name already exists." };
    }
    return { success: false, error: "Internal server error." };
  }
}

export async function deleteCustomField(id: number) {
  try {
    await prisma.custom_field_meta.delete({ where: { id } });
    revalidatePath("/admin/custom_fields");
    revalidatePath("/admin/add_employee");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting custom field:", error);
    return { success: false, error: "Internal server error." };
  }
}
