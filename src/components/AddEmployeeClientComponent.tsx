"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/app/actions/adminActions";

export default function AddEmployeeClientComponent({
  departments
}: {
  departments: { id: number; name: string }[]
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.target as HTMLFormElement);

    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "employee" | "manager" | "admin";
    const deptId = formData.get("department_id") as string;
    const jobTitle = formData.get("job_title") as string;

    startTransition(async () => {
      const res = await createEmployee(
        firstName,
        lastName,
        email,
        role,
        deptId ? Number(deptId) : null,
        jobTitle
      );

      if (res.success) {
        router.push("/admin/employees");
      } else {
        setErrorMsg(res.error || "Failed to create employee.");
      }
    });
  };

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card-header">
        <h2>Employee Details</h2>
      </div>
      <div className="card-body">
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: "20px", color: "var(--red)", background: "var(--red-bg)", padding: "10px", borderRadius: "6px" }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" name="job_title" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department_id" className="form-control" required>
                <option value="">-- Select Department --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>System Role</label>
              <select name="role" className="form-control" required>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
