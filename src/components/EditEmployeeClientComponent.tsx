"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEmployee, uploadEmployeeDocument, deleteEmployeeDocument } from "@/app/actions/employeeActions";

export default function EditEmployeeClientComponent({
  employee,
  departments,
  documents
}: {
  employee: any;
  departments: { id: number; name: string }[];
  documents: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const formData = new FormData(e.target as HTMLFormElement);

    startTransition(async () => {
      const res = await updateEmployee(employee.id, formData);
      if (res.success) {
        setSuccessMsg("Employee updated successfully.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to update employee.");
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingDoc(true);
    const res = await uploadEmployeeDocument(employee.id, docType, file);
    if (res.success) {
      setSuccessMsg(`${docType} uploaded successfully.`);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to upload document.");
    }
    setUploadingDoc(false);
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    const res = await deleteEmployeeDocument(docId, employee.id);
    if (res.success) {
      setSuccessMsg("Document deleted successfully.");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to delete document.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {errorMsg && (
        <div className="alert alert-error" style={{ color: "var(--red)", background: "var(--red-bg)", padding: "10px", borderRadius: "6px" }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ color: "var(--green)", background: "var(--green-bg)", padding: "10px", borderRadius: "6px" }}>
          {successMsg}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h2>Personal Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" className="form-control" defaultValue={employee.first_name || ""} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" className="form-control" defaultValue={employee.last_name || ""} required />
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input type="email" name="email" className="form-control" defaultValue={employee.email || ""} required />
              </div>
              <div className="form-group">
                <label>Personal Email</label>
                <input type="email" name="personal_email" className="form-control" defaultValue={employee.personal_email || ""} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" className="form-control" defaultValue={employee.phone || ""} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" className="form-control" defaultValue={employee.date_of_birth || ""} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="form-control" defaultValue={employee.gender || ""}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <select name="department_id" className="form-control" defaultValue={employee.department_id || ""}>
                  <option value="">-- None --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" name="job_title" className="form-control" defaultValue={employee.job_title || ""} />
              </div>
              
              <div className="form-group">
                <label>Date of Joining</label>
                <input type="date" name="date_of_joining" className="form-control" defaultValue={employee.date_of_joining || ""} />
              </div>
              
              <div className="form-group">
                <label>Gross Salary</label>
                <input type="number" step="0.01" name="gross_salary" className="form-control" defaultValue={employee.gross_salary || ""} />
              </div>
            </div>
            <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Documents Section */}
      <div className="card">
        <div className="card-header">
          <h2>Documents</h2>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
            Upload employee documents (JPG, PNG, PDF). Max 5MB per file.
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {["ID Card", "Resume", "Contract", "Other"].map(docType => {
              const existingDoc = documents.find(d => d.document_type === docType);
              
              return (
                <div key={docType} style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>{docType}</h4>
                  
                  {existingDoc ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <a href={`/${existingDoc.file_path}`} target="_blank" style={{ color: "var(--brand)", textDecoration: "none", fontSize: "13px" }}>
                        View Document
                      </a>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: "4px 8px", fontSize: "12px", color: "var(--red)" }}
                        onClick={() => handleDeleteDoc(existingDoc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, docType)} 
                        disabled={uploadingDoc}
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
