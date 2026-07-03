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

export async function updateEmployee(id: number, formData: FormData) {
  try {
    const data: any = {};
    for (const [key, value] of formData.entries()) {
      if (value !== "" && key !== "id") {
        data[key] = value;
      }
    }
    
    // Convert dates
    if (data.date_of_birth) data.date_of_birth = new Date(data.date_of_birth as string);
    if (data.date_of_joining) data.date_of_joining = new Date(data.date_of_joining as string);
    if (data.date_of_exit) data.date_of_exit = new Date(data.date_of_exit as string);
    if (data.date_of_confirmation) data.date_of_confirmation = new Date(data.date_of_confirmation as string);
    if (data.passport_date_of_issue) data.passport_date_of_issue = new Date(data.passport_date_of_issue as string);
    if (data.passport_date_of_expiry) data.passport_date_of_expiry = new Date(data.passport_date_of_expiry as string);
    if (data.department_id) data.department_id = Number(data.department_id);
    if (data.gross_salary) data.gross_salary = Number(data.gross_salary);

    await prisma.employees.update({
      where: { id },
      data
    });

    revalidatePath("/admin/employees");
    revalidatePath(`/admin/edit_employee/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Internal server error." };
  }
}

import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function uploadEmployeeDocument(employeeId: number, documentType: string, file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${employeeId}_${documentType}_${Date.now()}_${file.name}`;
    const uploadDir = join(process.cwd(), "public/uploads/documents");
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const docKey = documentType.toLowerCase().replace(/ /g, '_');
    const relPath = `uploads/documents/${fileName}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO employee_documents 
       (employee_id, doc_type, doc_key, file_path, original_name, mime_type, file_size) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      employeeId, documentType, docKey, relPath, file.name, file.type, file.size
    );

    revalidatePath(`/admin/edit_employee/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return { success: false, error: "Failed to upload document." };
  }
}

export async function deleteEmployeeDocument(documentId: number, employeeId: number) {
  try {
    const docs: any[] = await prisma.$queryRawUnsafe(
      `SELECT file_path FROM employee_documents WHERE id = ?`,
      documentId
    );
    if (docs && docs.length > 0) {
      const filePath = join(process.cwd(), "public", docs[0].file_path);
      try {
        await unlink(filePath);
      } catch (e) {
        console.error("File not found on disk, continuing deletion from DB");
      }
      await prisma.$executeRawUnsafe(
        `DELETE FROM employee_documents WHERE id = ?`,
        documentId
      );
    }
    
    revalidatePath(`/admin/edit_employee/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document." };
  }
}
