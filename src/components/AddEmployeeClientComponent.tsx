"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/app/actions/adminActions";
import styles from "./AddEmployee.module.css";

export default function AddEmployeeClientComponent({
  departments,
  customFields = []
}: {
  departments: { id: number; name: string }[];
  customFields?: { id: number; field_name: string; field_label: string; field_type: string; is_required: boolean | null }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.target as HTMLFormElement);

    startTransition(async () => {
      const res = await createEmployee(formData);

      if (res.success) {
        router.push("/admin/employees");
      } else {
        setErrorMsg(res.error || "Failed to create employee.");
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Employee</h1>
        <p>Fill in the profile details or use bulk upload to onboard multiple employees at once.</p>
      </div>

      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${activeTab === 'single' ? styles.tabActive : ''}`} onClick={() => setActiveTab('single')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Single Entry
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === 'bulk' ? styles.tabActive : ''}`} onClick={() => setActiveTab('bulk')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Bulk Upload
        </button>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: "20px", color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", border: "1px solid #FCA5A5" }}>
          {errorMsg}
        </div>
      )}

      {activeTab === 'bulk' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Step Instructions */}
          <div className={styles.grid3} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            <div className={styles.card} style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ background: "#EEF2FF", color: "#4F46E5", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", margin: "0 auto 16px", fontSize: "18px" }}>1</div>
              <h3 style={{ fontSize: "15px", marginBottom: "8px", color: "#111827" }}>Download Template</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: "1.5" }}>Get the CSV with all columns including custom fields and a sample row.</p>
              <button type="button" className={styles.btnSecondary} onClick={() => alert("Downloading CSV...")} style={{ margin: "0 auto", padding: "0 20px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", marginRight: "8px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download CSV
              </button>
            </div>
            
            <div className={styles.card} style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ background: "#D1FAE5", color: "#059669", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", margin: "0 auto 16px", fontSize: "18px" }}>2</div>
              <h3 style={{ fontSize: "15px", marginBottom: "8px", color: "#111827" }}>Fill in Data</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.5" }}>Fill employee rows. Remove the sample row before uploading. Keep headers unchanged.</p>
            </div>
            
            <div className={styles.card} style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ background: "#FEF3C7", color: "#D97706", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", margin: "0 auto 16px", fontSize: "18px" }}>3</div>
              <h3 style={{ fontSize: "15px", marginBottom: "8px", color: "#111827" }}>Upload & Import</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.5" }}>Upload the filled CSV. Valid rows import; rows with errors are skipped and reported.</p>
            </div>
          </div>

          {/* Upload Zone */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Upload CSV File</h2>
            <p className={styles.cardSubtitle}>Only .csv files accepted. Max size depends on your server's upload_max_filesize.</p>
            
            <div style={{ border: "2px dashed #E5E7EB", borderRadius: "12px", padding: "60px 20px", textAlign: "center", background: "#F9FAFB", marginBottom: "24px", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "32px", height: "32px", margin: "0 auto 12px" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>
              <p style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>Click to select a CSV file</p>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>or drag and drop here</p>
            </div>
            
            <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
              <button type="button" className={styles.btnSecondary} onClick={() => alert("Downloading Template...")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", marginRight: "8px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Template
              </button>
              <button type="button" className={styles.btnPrimary} style={{ background: "#10B981", width: "auto", padding: "0 24px" }} onClick={() => alert("Bulk import...")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", marginRight: "8px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Import CSV
              </button>
            </div>
          </div>

          {/* Field Reference */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Field Reference</h2>
            <p className={styles.cardSubtitle}>Accepted values for key columns</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>DEPARTMENT</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {["Admin", "Engineering Design", "Finance", "HR", "Project Management", "Sales", "SCM & Stores", "Site Supervision"].map(d => (
                    <span key={d} style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>{d}</span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>EMPLOYEE_TYPE</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>FTE</span>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>External</span>
                  </div>
                </div>
                <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>EXEMPT_FROM_TAX</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>0 = No</span>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>1 = Yes</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>STATUS</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>active</span>
                  <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>inactive</span>
                  <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>terminated</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>GENDER</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>Male</span>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>Female</span>
                    <span style={{ background: "#F3F4F6", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", color: "#4B5563" }}>Other</span>
                  </div>
                </div>
                <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#111827", textTransform: "uppercase", marginBottom: "12px" }}>DATE FIELDS</h4>
                  <p style={{ fontSize: "12px", color: "#6B7280" }}>Format: YYYY-MM-DD<br/>e.g. 2024-01-15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: activeTab === 'single' ? 'block' : 'none' }}>
        {/* Card 1: Custom Fields */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Custom Fields</h2>
          <p className={styles.cardSubtitle}>Fields defined in your Custom Fields settings</p>
          <div className={styles.grid2}>
            {/* Legacy physical columns */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Photo</label>
              <input type="text" name="photo" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Indian?</label>
              <select name="indian" className={styles.select}>
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            {/* Dynamic Custom Fields */}
            {customFields.map(field => (
              <div key={field.id} className={styles.formGroup}>
                <label className={styles.label}>
                  {field.field_label} {field.is_required && <span className={styles.required}>*</span>}
                </label>
                {field.field_type === "dropdown" ? (
                  <select name={`custom_${field.field_name}`} className={styles.select} required={field.is_required || false}>
                    <option value="">-- Select --</option>
                    {/* If we had field options, we'd map them here */}
                    <option value="Option 1">Option 1</option>
                    <option value="Option 2">Option 2</option>
                  </select>
                ) : field.field_type === "yesno" ? (
                  <select name={`custom_${field.field_name}`} className={styles.select} required={field.is_required || false}>
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : field.field_type === "textarea" ? (
                  <textarea name={`custom_${field.field_name}`} className={styles.input} style={{ height: "auto" }} rows={3} required={field.is_required || false}></textarea>
                ) : ['image', 'document', 'file'].includes(field.field_type) ? (
                  <input type="file" name={`custom_${field.field_name}`} className={styles.input} style={{ paddingTop: "8px" }} accept={field.field_type === 'image' ? 'image/jpeg,image/png,image/webp' : field.field_type === 'document' ? '.pdf,.doc,.docx' : undefined} required={field.is_required || false} />
                ) : (
                  <input 
                    type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'url' ? 'url' : 'text'} 
                    name={`custom_${field.field_name}`} 
                    className={styles.input} 
                    required={field.is_required || false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Personal Information */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          <div className={styles.grid4} style={{ marginTop: "24px" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name <span className={styles.required}>*</span></label>
              <input type="text" name="first_name" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name <span className={styles.required}>*</span></label>
              <input type="text" name="last_name" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Work Email <span className={styles.required}>*</span></label>
              <input type="email" name="email" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Personal Email</label>
              <input type="email" name="personal_email" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input type="text" name="phone" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Birth</label>
              <input type="date" name="date_of_birth" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select name="gender" className={styles.select}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Marital Status</label>
              <select name="marital_status" className={styles.select}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Blood Group</label>
              <input type="text" name="blood_group" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nationality</label>
              <input type="text" name="nationality" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Place of Birth</label>
              <input type="text" name="place_of_birth" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Emergency Contact</label>
              <input type="text" name="emergency_contact_no" className={styles.input} />
            </div>
          </div>
        </div>

        {/* Card 3: Employment Details */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Employment Details</h2>
          <div className={styles.grid4} style={{ marginTop: "24px" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee ID</label>
              <input type="text" disabled placeholder="Auto-generated on save" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Job Title</label>
              <input type="text" name="job_title" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Department</label>
              <select name="department_id" className={styles.select}>
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee Type</label>
              <select name="employee_type" className={styles.select}>
                <option value="FTE">FTE</option>
                <option value="External">External</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Joining</label>
              <input type="date" name="date_of_joining" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Confirmation</label>
              <input type="date" name="date_of_confirmation" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Direct Manager</label>
              <input type="text" name="direct_manager_name" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <input type="text" name="location" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Base Location</label>
              <input type="text" name="base_location" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select name="status" className={styles.select}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <div className={styles.checkboxWrap}>
                <input type="checkbox" name="acl_eligible" id="acl" className={styles.checkbox} defaultChecked />
                <label htmlFor="acl" className={styles.checkboxLabel}>
                  Allow ACL (Compensatory Leave) for this employee
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Address */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Address</h2>
          
          <h3 className={styles.cardTitle} style={{ marginTop: "24px", fontSize: "14px" }}>Current Address</h3>
          <div className={styles.grid4}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address Line 1</label>
              <input type="text" name="address_line1" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address Line 2</label>
              <input type="text" name="address_line2" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input type="text" name="city" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>State</label>
              <input type="text" name="state" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Zip Code</label>
              <input type="text" name="zip_code" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country</label>
              <input type="text" name="country" className={styles.input} />
            </div>
          </div>

          <h3 className={styles.cardTitle} style={{ marginTop: "32px", fontSize: "14px" }}>Permanent Address</h3>
          <div className={styles.grid4}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address Line 1</label>
              <input type="text" name="permanent_address_line1" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address Line 2</label>
              <input type="text" name="permanent_address_line2" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input type="text" name="permanent_city" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>State</label>
              <input type="text" name="permanent_state" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Zip Code</label>
              <input type="text" name="permanent_zip_code" className={styles.input} />
            </div>
          </div>
        </div>

        {/* Card 5: Financial & Statutory */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Financial & Statutory</h2>
          <div className={styles.grid4} style={{ marginTop: "24px" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Gross Salary</label>
              <input type="number" step="0.01" name="gross_salary" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Account Type</label>
              <select name="account_type" className={styles.select}>
                <option value="">Select</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Account Number</label>
              <input type="text" name="account_number" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>IFSC Code</label>
              <input type="text" name="ifsc_code" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PAN Number</label>
              <input type="text" name="pan" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Aadhar Number</label>
              <input type="text" name="aadhar_no" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>UAN Number</label>
              <input type="text" name="uan_number" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>PF Account Number</label>
              <input type="text" name="pf_account_number" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Employee PF</label>
              <input type="text" name="employee_provident_fund" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Professional Tax</label>
              <input type="text" name="professional_tax" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ESI Number</label>
              <input type="text" name="esi_number" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.checkboxWrap}>
                <input type="checkbox" name="exempt_from_tax" id="tax" className={styles.checkbox} />
                <label htmlFor="tax" className={styles.checkboxLabel}>Exempt from Tax</label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Passport Details */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Passport Details</h2>
          <div className={styles.grid4} style={{ marginTop: "24px" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Passport Number</label>
              <input type="text" name="passport_no" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Place of Issue</label>
              <input type="text" name="place_of_issue" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Issue</label>
              <input type="date" name="passport_date_of_issue" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Expiry</label>
              <input type="date" name="passport_date_of_expiry" className={styles.input} />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className={styles.btnSave} disabled={isPending}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {isPending ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
