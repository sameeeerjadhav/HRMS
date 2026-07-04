"use client";

import { useState, useTransition } from "react";
import { createCustomField, deleteCustomField } from "@/app/actions/customFieldsActions";
import styles from "./CustomFields.module.css";

type CustomField = {
  id: number;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean | null;
};

export default function CustomFieldsClientComponent({
  initialFields
}: {
  initialFields: CustomField[]
}) {
  const [fields, setFields] = useState(initialFields);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCustomField(formData);
      if (res.success) {
        form.reset();
        // Optimistic refresh can be done via router.refresh, but let's just let the page reload or fetch
        window.location.reload(); 
      } else {
        setErrorMsg(res.error || "Failed to add field.");
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this custom field? Existing data in employee profiles will not be removed from the database, but it will no longer display on the forms.")) return;
    
    startTransition(async () => {
      const res = await deleteCustomField(id);
      if (res.success) {
        setFields(fields.filter(f => f.id !== id));
      } else {
        alert(res.error || "Failed to delete field.");
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Custom Fields</h1>
        <p>Extend employee profiles with additional fields that appear on all forms dynamically.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Panel: Form */}
        <div className={styles.leftPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Add New Field</h2>
            <p className={styles.cardSubtitle}>Fields appear on employee forms immediately</p>
            
            {errorMsg && <div className={styles.error}>{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Field Label <span className={styles.required}>*</span></label>
                <input type="text" name="field_label" className={styles.input} placeholder="e.g. Blood Group, Shirt Size" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Field Type</label>
                <select name="field_type" className={styles.select} required>
                  <optgroup label="Text Inputs">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="textarea">Textarea (Long Text)</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="yesno">Yes / No</option>
                    <option value="url">URL / Link</option>
                  </optgroup>
                  <optgroup label="File Uploads (Documents section)">
                    <option value="image">Image (JPG, PNG, WebP)</option>
                    <option value="document">Document (PDF, DOC, DOCX)</option>
                    <option value="file">Image or Document (any)</option>
                  </optgroup>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Show in Section</label>
                <select name="section" className={styles.select} defaultValue="Custom Fields">
                  <option value="Custom Fields">Custom Fields (default)</option>
                  <option value="Documents">Documents</option>
                </select>
                <p className={styles.helpText}>For file-type fields, section is automatically set to Documents.</p>
              </div>

              <div className={styles.checkboxWrap}>
                <input type="checkbox" name="is_required" id="req" className={styles.checkbox} />
                <label htmlFor="req" className={styles.checkboxLabel}>Mark as Required</label>
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                {isPending ? "Adding..." : "+ Add Field"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Data Table */}
        <div className={styles.rightPanel}>
          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <h2 className={styles.cardTitle}>Active Custom Fields ({fields.length})</h2>
            </div>
            
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>LABEL</th>
                    <th>COLUMN NAME</th>
                    <th>TYPE</th>
                    <th>SECTION</th>
                    <th>*</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.field_label}</td>
                      <td><code className={styles.code}>{f.field_name}</code></td>
                      <td>{f.field_type}</td>
                      <td>Custom Fields</td>
                      <td>{f.is_required ? "Yes" : ""}</td>
                      <td className={styles.actionsCell}>
                        <button className={styles.btnEdit} disabled>Edit</button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(f.id)} disabled={isPending}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {fields.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>No custom fields added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
