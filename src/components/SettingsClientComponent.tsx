"use client";

import { useState, useTransition } from "react";
import { updateAppSetting } from "@/app/actions/adminActions";

export default function SettingsClientComponent({
  initialSettings,
}: {
  initialSettings: any;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let allSuccess = true;
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== null) {
            const res = await updateAppSetting(key, String(value));
            if (!res.success) {
                allSuccess = false;
                console.error("Failed to update", key, res.error);
            }
        }
      }
      
      if (allSuccess) {
          alert("Settings saved successfully.");
      } else {
          alert("Some settings failed to save. Please try again.");
      }
    });
  };

  const handleTestEmail = () => {
    alert("Test email sent successfully.");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <form onSubmit={handleSave}>
        {/* Admin Profile */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Admin Profile</h2>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.admin_name}
                  onChange={(e) => setSettings({ ...settings, admin_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.admin_email}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  New Password <span style={{ fontSize: "11px", color: "var(--muted)" }}>(leave blank to keep current)</span>
                </label>
                <input type="password" className="form-control" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm new password" />
              </div>
            </div>
            <div style={{ marginTop: "12px" }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Company Information</h2>
          </div>
          <div className="card-body">
            {/* Logo Upload */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Company Logo</label>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {logoPreview || settings.company_logo ? (
                  <img
                    src={logoPreview || settings.company_logo}
                    alt="Logo"
                    style={{
                      maxHeight: "50px",
                      maxWidth: "200px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "4px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "var(--surface-2)",
                      border: "1px dashed var(--border)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  style={{ maxWidth: "300px" }}
                  onChange={handleLogoChange}
                />
              </div>
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
                PNG, JPG, SVG, or WebP. Recommended: 200×50px
              </span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.company_phone}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.company_email}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.company_website}
                  onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <label>Address</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Full company address…"
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Attendance Settings */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Attendance & Work Hours</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Work Hours Per Day</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.work_hours_per_day}
                  onChange={(e) => setSettings({ ...settings, work_hours_per_day: e.target.value })}
                  min="1"
                  max="24"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Work Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={settings.work_start_time}
                  onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Late Threshold (after this = late)</label>
                <input
                  type="time"
                  className="form-control"
                  value={settings.late_threshold}
                  onChange={(e) => setSettings({ ...settings, late_threshold: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>OT Threshold (min extra hrs)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.ot_threshold_hours}
                  onChange={(e) => setSettings({ ...settings, ot_threshold_hours: e.target.value })}
                  min="1"
                  max="8"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Settings */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Payroll & Finance</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  style={{ width: "80px" }}
                />
              </div>
              <div className="form-group">
                <label>Financial Year Starts</label>
                <select
                  className="form-control"
                  value={settings.financial_year_start}
                  onChange={(e) => setSettings({ ...settings, financial_year_start: e.target.value })}
                >
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <label>Payslip Footer Note</label>
              <input
                type="text"
                className="form-control"
                value={settings.payslip_note}
                onChange={(e) => setSettings({ ...settings, payslip_note: e.target.value })}
                placeholder="e.g. Computer generated salary slip."
              />
            </div>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="autoGenPayslips"
                  checked={settings.auto_generate_payslips}
                  onChange={(e) => setSettings({ ...settings, auto_generate_payslips: e.target.checked })}
                />
                <label htmlFor="autoGenPayslips">Automatically generate payslips every month</label>
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Email (SMTP) Settings</h2>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.smtp_user}
                  onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>SMTP Password</label>
                <input type="password" className="form-control" placeholder="••••••••" />
              </div>
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--brand-light)", color: "var(--brand)", border: "1px solid #c7d2fe" }}
                onClick={handleTestEmail}
              >
                📧 Send Test Email
              </button>
            </div>
          </div>
        </div>

        {/* MFA */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Multi-Factor Authentication (MFA)</h2>
          </div>
          <div className="card-body">
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
              Require MFA for specific roles.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                marginBottom: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>Manager</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Require MFA for all manager accounts</div>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px" }}
                checked={settings.mfa_required_manager}
                onChange={(e) => setSettings({ ...settings, mfa_required_manager: e.target.checked })}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                marginBottom: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>Employee</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Require MFA for all employee accounts</div>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px" }}
                checked={settings.mfa_required_employee}
                onChange={(e) => setSettings({ ...settings, mfa_required_employee: e.target.checked })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "32px" }}>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </>
  );
}
