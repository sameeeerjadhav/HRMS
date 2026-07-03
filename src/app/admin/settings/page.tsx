import Topbar from "@/components/Topbar";
import SettingsClientComponent from "@/components/SettingsClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const dbSettings = await prisma.app_settings.findMany();

  // Parse DB settings into the shape expected by SettingsClientComponent
  const initialSettings = {
    admin_name: dbSettings.find(s => s.setting_key === 'admin_name')?.setting_value || "Admin User",
    admin_email: dbSettings.find(s => s.setting_key === 'admin_email')?.setting_value || "admin@company.com",
    company_name: dbSettings.find(s => s.setting_key === 'company_name')?.setting_value || "Acme Corp",
    company_phone: dbSettings.find(s => s.setting_key === 'company_phone')?.setting_value || "+91 9876543210",
    company_email: dbSettings.find(s => s.setting_key === 'company_email')?.setting_value || "info@acmecorp.com",
    company_website: dbSettings.find(s => s.setting_key === 'company_website')?.setting_value || "https://acmecorp.com",
    company_address: dbSettings.find(s => s.setting_key === 'company_address')?.setting_value || "123 Business Rd, Tech City",
    company_logo: dbSettings.find(s => s.setting_key === 'company_logo')?.setting_value || "",
    work_hours_per_day: dbSettings.find(s => s.setting_key === 'work_hours_per_day')?.setting_value || "9",
    work_start_time: dbSettings.find(s => s.setting_key === 'work_start_time')?.setting_value || "09:30",
    late_threshold: dbSettings.find(s => s.setting_key === 'late_threshold')?.setting_value || "09:45",
    ot_threshold_hours: dbSettings.find(s => s.setting_key === 'ot_threshold_hours')?.setting_value || "2",
    currency_symbol: dbSettings.find(s => s.setting_key === 'currency_symbol')?.setting_value || "₹",
    financial_year_start: dbSettings.find(s => s.setting_key === 'financial_year_start')?.setting_value || "April",
    payslip_note: dbSettings.find(s => s.setting_key === 'payslip_note')?.setting_value || "Computer generated salary slip.",
    auto_generate_payslips: dbSettings.find(s => s.setting_key === 'auto_generate_payslips')?.setting_value === 'true',
    smtp_host: dbSettings.find(s => s.setting_key === 'smtp_host')?.setting_value || "smtp.gmail.com",
    smtp_port: dbSettings.find(s => s.setting_key === 'smtp_port')?.setting_value || "587",
    smtp_user: dbSettings.find(s => s.setting_key === 'smtp_user')?.setting_value || "hr@acmecorp.com",
    mfa_required_manager: dbSettings.find(s => s.setting_key === 'mfa_required_manager')?.setting_value === 'true',
    mfa_required_employee: dbSettings.find(s => s.setting_key === 'mfa_required_employee')?.setting_value === 'true',
  };

  return (
    <>
      <Topbar title="System Settings" breadcrumb="Configuration & Preferences" user="Admin User" role="Admin" />
      <div className="page-body">
        <SettingsClientComponent initialSettings={initialSettings} />
      </div>
    </>
  );
}
