"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "@/app/actions/projectActions";

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
    <div className="card" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="card-header">
        <h2>{initialData ? "Edit Project" : "New Project Details"}</h2>
      </div>
      <div className="card-body">
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: "20px", color: "var(--red)", background: "var(--red-bg)", padding: "10px", borderRadius: "6px" }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {initialData && <input type="hidden" name="id" value={initialData.id} />}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label>Project Code</label>
              <input type="text" name="project_code" className="form-control" defaultValue={initialData?.project_code || ""} required />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" name="project_name" className="form-control" defaultValue={initialData?.project_name || ""} required />
            </div>
            
            <div className="form-group">
              <label>Client Name</label>
              <input type="text" name="client_name" className="form-control" defaultValue={initialData?.client_name || ""} required />
            </div>
            <div className="form-group">
              <label>Project Manager</label>
              <select name="manager_id" className="form-control" defaultValue={initialData?.manager_id || ""} required>
                <option value="">-- Select Manager --</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="start_date" className="form-control" defaultValue={initialData?.start_date?.split('T')[0] || ""} required />
            </div>
            <div className="form-group">
              <label>Deadline Date</label>
              <input type="date" name="deadline_date" className="form-control" defaultValue={initialData?.deadline_date?.split('T')[0] || ""} required />
            </div>

            <div className="form-group">
              <label>Budgeted Hours</label>
              <input type="number" step="0.01" name="budget_hours" className="form-control" defaultValue={initialData?.budget_hours || "0"} required />
            </div>
            <div className="form-group">
              <label>Hourly Rate (₹)</label>
              <input type="number" step="0.01" name="hr_rate" className="form-control" defaultValue={initialData?.hr_rate || "0"} required />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" className="form-control" defaultValue={initialData?.priority || "Medium"} required>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-control" defaultValue={initialData?.status || "Planning"} required>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On_Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label>Project Description</label>
            <textarea name="description" className="form-control" rows={4} defaultValue={initialData?.description || ""}></textarea>
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
