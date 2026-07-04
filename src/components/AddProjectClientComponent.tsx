"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "@/app/actions/projectActions";
import styles from "./AddProject.module.css";

export default function AddProjectClientComponent({
  managers,
  initialData
}: {
  managers: { id: number; name: string }[];
  initialData?: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [projectCode, setProjectCode] = useState(initialData?.project_code || "");
  const [startDate, setStartDate] = useState(initialData?.start_date?.split('T')[0] || "");
  const [deadlineDate, setDeadlineDate] = useState(initialData?.deadline_date?.split('T')[0] || "");
  const [budgetHours, setBudgetHours] = useState(initialData?.budget_hours?.toString() || "");
  const [hrRate, setHrRate] = useState(initialData?.hr_rate?.toString() || "");
  const [totalWorkingHours, setTotalWorkingHours] = useState(0);

  // Generate a random project code PRJ + 4 digits
  const generateCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setProjectCode(`PRJ${randomNum}`);
  };

  useEffect(() => {
    if (!initialData && !projectCode) {
      generateCode();
    }
  }, [initialData]);

  // Calculate working hours between dates (excluding Sundays)
  const calculateWorkingHours = () => {
    if (!startDate || !deadlineDate) return;
    const start = new Date(startDate);
    const end = new Date(deadlineDate);
    
    if (end < start) {
      setTotalWorkingHours(0);
      return;
    }

    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      // 0 is Sunday
      if (current.getDay() !== 0) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    // Assume 9 working hours per day
    setTotalWorkingHours(days * 9);
  };

  useEffect(() => {
    calculateWorkingHours();
  }, [startDate, deadlineDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.target as HTMLFormElement);

    startTransition(async () => {
      const res = await saveProject(formData);

      if (res.success) {
        router.push("/admin/projects");
      } else {
        setErrorMsg(res.error || "Failed to save project.");
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{initialData ? "Edit Project" : "New Project"}</h1>
        <p>Projects / {initialData ? "Edit" : "New"}</p>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: "20px", color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", border: "1px solid #FCA5A5", fontSize: "13px" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        
        {/* Project Details Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Project Details</h2>
          <div className={styles.grid4}>
            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>Project Name <span className={styles.required}>*</span></label>
              <input type="text" name="project_name" className={styles.input} placeholder="e.g. Website Redesign" defaultValue={initialData?.project_name || ""} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Project Code <span className={styles.required}>*</span></label>
              <div className={styles.inputWrap}>
                <input type="text" name="project_code" className={styles.input} value={projectCode} onChange={e => setProjectCode(e.target.value)} required />
                <button type="button" className={`${styles.btnSecondary} ${styles.iconBtn}`} onClick={generateCode} title="Regenerate Code">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-2.36"/>
                  </svg>
                </button>
              </div>
              <p className={styles.helpText}>Auto-generated. You can customise it.</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Client Name</label>
              <input type="text" name="client_name" className={styles.input} placeholder="e.g. Acme Corp" defaultValue={initialData?.client_name || ""} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Assign Manager</label>
              <select name="manager_id" className={styles.select} defaultValue={initialData?.manager_id || ""}>
                <option value="">— No Manager —</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>Priority</label>
              <select name="priority" className={styles.select} defaultValue={initialData?.priority || "Medium"} required>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline & Hours Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Timeline & Hours</h2>
          <p className={styles.cardSubtitle}>Working hours are auto-calculated excluding Sundays and company holidays. Budget hours can be set manually.</p>
          
          <div className={styles.grid4}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Start Date <span className={styles.required}>*</span></label>
              <input type="date" name="start_date" className={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Deadline Date <span className={styles.required}>*</span></label>
              <input type="date" name="deadline_date" className={styles.input} value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Total Working Hours</label>
              <div className={styles.inputWrap}>
                <input type="number" className={styles.input} value={totalWorkingHours} disabled />
                <button type="button" className={styles.btnSecondary} onClick={calculateWorkingHours}>Recalculate</button>
              </div>
              <p className={styles.helpText}>9 hrs/day × working days (excl. Sundays & holidays)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Budget Hours</label>
              <input type="number" step="0.01" name="budget_hours" className={styles.input} value={budgetHours} onChange={e => setBudgetHours(e.target.value)} required />
              <p className={styles.helpText}>Manual budget hours for cost estimation</p>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>HR Rate (₹/hr)</label>
              <input type="number" step="0.01" name="hr_rate" className={styles.input} value={hrRate} onChange={e => setHrRate(e.target.value)} required />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>Estimated Cost</label>
              <input type="text" className={styles.input} value={`₹ ${(Number(budgetHours || 0) * Number(hrRate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} disabled style={{ background: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0", fontWeight: 600 }} />
              <p className={styles.helpText}>Budget Hours × HR Rate</p>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Description</h2>
          <div className={styles.formGroup}>
            <textarea name="description" className={styles.textarea} placeholder="Project description, scope, notes..." defaultValue={initialData?.description || ""}></textarea>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className={styles.btnSave} disabled={isPending}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {isPending ? "Saving..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
