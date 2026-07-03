"use client";

import { useState } from "react";

type Project = {
  id: number;
  project_name: string;
  project_code: string;
  total_hours: number;
  hr_rate: number;
};

type Invoice = {
  id: number;
  invoice_no: string;
  project_id: number;
  project_name: string;
  project_code: string;
  invoice_date: string;
  due_date: string;
  total_hours: number;
  utilized_hours: number;
  rate_per_hour: number;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  status: "draft" | "sent" | "paid";
};

export default function InvoicesClientComponent({
  projects,
  initialInvoices,
}: {
  projects: Project[];
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  // Form State
  const [projectId, setProjectId] = useState<number | "">("");
  const [utilizedHrs, setUtilizedHrs] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Filter State
  const [filterProject, setFilterProject] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const handleProjectSelect = (id: number) => {
    setProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj && proj.hr_rate) {
      setRate(proj.hr_rate);
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !utilizedHrs || rate === "") {
      alert("Project, hours, and rate are required.");
      return;
    }

    const proj = projects.find((p) => p.id === Number(projectId));
    if (!proj) return;

    const sub = Number(utilizedHrs) * Number(rate);
    const taxAmt = Math.round(sub * (taxPercent / 100));
    const totalAmt = sub + taxAmt;

    const newInvoice: Invoice = {
      id: Date.now(),
      invoice_no: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      project_id: proj.id,
      project_name: proj.project_name,
      project_code: proj.project_code,
      invoice_date: invoiceDate,
      due_date: dueDate,
      total_hours: proj.total_hours,
      utilized_hours: Number(utilizedHrs),
      rate_per_hour: Number(rate),
      subtotal: sub,
      tax_percent: taxPercent,
      tax_amount: taxAmt,
      total_amount: totalAmt,
      notes,
      status: "draft",
    };

    setInvoices([newInvoice, ...invoices]);
    setUtilizedHrs("");
    setNotes("");
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete invoice?")) {
      setInvoices(invoices.filter((i) => i.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: Invoice["status"]) => {
    setInvoices(
      invoices.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
    );
  };

  // Auto-calculated fields for the form display
  const formSub = Number(utilizedHrs || 0) * Number(rate || 0);
  const formTotal = formSub + (formSub * taxPercent) / 100;

  // Filter Logic
  const filteredInvoices = invoices.filter((inv) => {
    if (filterProject && inv.project_id !== Number(filterProject)) return false;
    if (filterStatus && inv.status !== filterStatus) return false;
    if (
      search &&
      !inv.invoice_no.toLowerCase().includes(search.toLowerCase()) &&
      !inv.project_name.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate Stats
  let totalRevenue = 0;
  let paidAmount = 0;

  filteredInvoices.forEach((inv) => {
    totalRevenue += inv.total_amount;
    if (inv.status === "paid") paidAmount += inv.total_amount;
  });
  const pendingAmount = totalRevenue - paidAmount;

  const fmt = (num: number) => Math.round(num).toLocaleString("en-IN");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h2>Create Invoice</h2>
        </div>
        <div className="card-body">
          <form
            onSubmit={handleCreateInvoice}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}
          >
            <div className="form-group" style={{ minWidth: "180px" }}>
              <label>Project <span className="req">*</span></label>
              <select
                className="form-control"
                value={projectId}
                onChange={(e) => handleProjectSelect(Number(e.target.value))}
                required
              >
                <option value="">— Select —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name} ({p.project_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: "100px" }}>
              <label>Utilized Hrs <span className="req">*</span></label>
              <input
                type="number"
                className="form-control"
                min="0.5"
                step="0.5"
                value={utilizedHrs}
                onChange={(e) => setUtilizedHrs(Number(e.target.value) || "")}
                required
              />
            </div>
            <div className="form-group" style={{ width: "100px" }}>
              <label>Rate/Hr (₹) <span className="req">*</span></label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || "")}
                required
              />
            </div>
            <div className="form-group" style={{ width: "80px" }}>
              <label>Tax %</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max="100"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ width: "130px" }}>
              <label>Invoice Date</label>
              <input
                type="date"
                className="form-control"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: "130px" }}>
              <label>Due Date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: "150px", flex: 1 }}>
              <label>Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "100px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Total</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--brand)" }}>
                ₹{fmt(formTotal)}
              </span>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: "38px" }}>
              Create
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: "16px" }}>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{filteredInvoices.length}</div>
            <div className="stat-label">Invoices</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--brand)" }}>₹{fmt(totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--green-text)" }}>₹{fmt(paidAmount)}</div>
            <div className="stat-label">Paid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--yellow)" }}>₹{fmt(pendingAmount)}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto", minWidth: "180px" }}
          value={filterProject}
          onChange={(e) => setFilterProject(Number(e.target.value) || "")}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
        <div className="search-box" style={{ minWidth: "160px", flex: "0 1 200px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-sm"
          style={{
            marginLeft: "auto",
            background: "var(--green-bg)",
            color: "var(--green-text)",
            border: "1px solid #a7f3d0",
            fontWeight: 700,
          }}
          onClick={() => alert("Mock Export Invoices")}
        >
          Export
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Invoices{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({filteredInvoices.length})
            </span>
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Project</th>
              <th>Date</th>
              <th style={{ textAlign: "center" }}>Hours</th>
              <th style={{ textAlign: "center" }}>Rate</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Status</th>
              <th style={{ width: "130px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>No invoices yet.</td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-semibold" style={{ fontFamily: "monospace" }}>
                    {inv.invoice_no}
                  </td>
                  <td>
                    <code
                      style={{
                        fontSize: "11px",
                        background: "var(--surface-2)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {inv.project_code}
                    </code>{" "}
                    <span className="text-sm">{inv.project_name}</span>
                  </td>
                  <td className="text-sm">{formatDate(inv.invoice_date)}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {inv.utilized_hours.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </td>
                  <td style={{ textAlign: "center" }}>₹{fmt(inv.rate_per_hour)}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--brand)" }}>
                    ₹{fmt(inv.total_amount)}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ fontSize: "11px", padding: "4px 8px", width: "auto" }}
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value as any)}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: "var(--red-bg)",
                        color: "var(--red)",
                        border: "1px solid #fca5a5",
                        fontSize: "11px",
                      }}
                      onClick={() => handleDelete(inv.id)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
