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

export async function createEmployee(formData: FormData) {
  try {
    // Basic Fields
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const personalEmail = (formData.get("personal_email") as string) || null;
    const phone = (formData.get("phone") as string) || null;
    const jobTitle = (formData.get("job_title") as string) || null;
    const deptId = formData.get("department_id") ? Number(formData.get("department_id")) : null;

    // Enums and specific types
    const gender = (formData.get("gender") as any) || null;
    const maritalStatus = (formData.get("marital_status") as any) || null;
    const employeeType = (formData.get("employee_type") as any) || "FTE";
    const status = (formData.get("status") as any) || "Active";
    const accountType = (formData.get("account_type") as any) || null;
    const aclEligible = formData.get("acl_eligible") === "on";
    const exemptFromTax = formData.get("exempt_from_tax") === "on";

    // Dates
    const dob = formData.get("date_of_birth") ? new Date(formData.get("date_of_birth") as string) : null;
    const doj = formData.get("date_of_joining") ? new Date(formData.get("date_of_joining") as string) : null;
    const doc = formData.get("date_of_confirmation") ? new Date(formData.get("date_of_confirmation") as string) : null;
    const passportIssue = formData.get("passport_date_of_issue") ? new Date(formData.get("passport_date_of_issue") as string) : null;
    const passportExpiry = formData.get("passport_date_of_expiry") ? new Date(formData.get("passport_date_of_expiry") as string) : null;

    // Decimal
    const grossSalary = formData.get("gross_salary") ? Number(formData.get("gross_salary")) : 0;

    // String fields
    const directManager = (formData.get("direct_manager_name") as string) || null;
    const location = (formData.get("location") as string) || null;
    const baseLocation = (formData.get("base_location") as string) || null;
    const addressLine1 = (formData.get("address_line1") as string) || null;
    const addressLine2 = (formData.get("address_line2") as string) || null;
    const city = (formData.get("city") as string) || null;
    const state = (formData.get("state") as string) || null;
    const zipCode = (formData.get("zip_code") as string) || null;
    const country = (formData.get("country") as string) || null;
    const permAddressLine1 = (formData.get("permanent_address_line1") as string) || null;
    const permAddressLine2 = (formData.get("permanent_address_line2") as string) || null;
    const permCity = (formData.get("permanent_city") as string) || null;
    const permState = (formData.get("permanent_state") as string) || null;
    const permZip = (formData.get("permanent_zip_code") as string) || null;
    
    const accountNumber = (formData.get("account_number") as string) || null;
    const ifsc = (formData.get("ifsc_code") as string) || null;
    const pan = (formData.get("pan") as string) || null;
    const aadhar = (formData.get("aadhar_no") as string) || null;
    const uan = (formData.get("uan_number") as string) || null;
    const pfAccount = (formData.get("pf_account_number") as string) || null;
    const empPf = (formData.get("employee_provident_fund") as string) || null;
    const profTax = (formData.get("professional_tax") as string) || null;
    const esi = (formData.get("esi_number") as string) || null;
    
    const passportNo = (formData.get("passport_no") as string) || null;
    const placeOfIssue = (formData.get("place_of_issue") as string) || null;
    const placeOfBirth = (formData.get("place_of_birth") as string) || null;
    const nationality = (formData.get("nationality") as string) || null;
    const bloodGroup = (formData.get("blood_group") as string) || null;
    const emergencyContact = (formData.get("emergency_contact_no") as string) || null;
    const photo = (formData.get("photo") as string) || null;
    const indian = (formData.get("indian") as string) || null;

    // Custom Fields (Dynamic JSON)
    const customFields: Record<string, string> = {};
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith("custom_")) {
        const fieldName = key.replace("custom_", "");
        customFields[fieldName] = value as string;
      }
    }

    // 1. Create Login User
    const hashedPassword = await bcrypt.hash("Buhler@123", 10);
    const user = await prisma.users.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: email,
        password: hashedPassword,
        role: "employee", // Default to employee, we removed role select from the new UI for simplicity
        status: "active",
      }
    });

    // 2. Create Employee Profile
    await prisma.employees.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        personal_email: personalEmail,
        phone: phone,
        department_id: deptId,
        job_title: jobTitle,
        gender: gender,
        marital_status: maritalStatus,
        employee_type: employeeType,
        status: status,
        account_type: accountType,
        acl_eligible: aclEligible,
        exempt_from_tax: exemptFromTax,
        date_of_birth: dob,
        date_of_joining: doj,
        date_of_confirmation: doc,
        passport_date_of_issue: passportIssue,
        passport_date_of_expiry: passportExpiry,
        gross_salary: grossSalary,
        direct_manager_name: directManager,
        location: location,
        base_location: baseLocation,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
        permanent_address_line1: permAddressLine1,
        permanent_address_line2: permAddressLine2,
        permanent_city: permCity,
        permanent_state: permState,
        permanent_zip_code: permZip,
        account_number: accountNumber,
        ifsc_code: ifsc,
        pan: pan,
        aadhar_no: aadhar,
        uan_number: uan,
        pf_account_number: pfAccount,
        employee_provident_fund: empPf,
        professional_tax: profTax,
        esi_number: esi,
        passport_no: passportNo,
        place_of_issue: placeOfIssue,
        place_of_birth: placeOfBirth,
        nationality: nationality,
        blood_group: bloodGroup,
        emergency_contact_no: emergencyContact,
        photo: photo,
        indian: indian,
        custom_fields: customFields
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
