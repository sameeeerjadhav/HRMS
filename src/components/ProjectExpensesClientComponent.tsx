"use client";

import { useState } from "react";

type Project = {
  id: number;
  project_name: string;
  project_code: string;
};

type Expense = {
  id: number;
  project_id: number;
  project_code: string;
  category: "Travel" | "Food" | "Hotel" | "Other";
  amount: number;
  expense_date: string;
  description: string;
};

export default function ProjectExpensesClientComponent({
  projects,
  initialExpenses,
}: {
  projects: Project[];
  initialExpenses: Expense[];
}) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // Form State
  const [projectId, setProjectId] = useState<number | "">("");
  const [category, setCategory] = useState<"Travel" | "Food" | "Hotel" | "Other">("Other");
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  // Filters State
  const [filterProject, setFilterProject] = useState<number | "">("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !amount || !expenseDate) {
      alert("Project, amount, and date are required.");
      return;
    }

    const proj = projects.find((p) => p.id === Number(projectId));
    if (!proj) return;

    const newExpense: Expense = {
      id: Date.now(),
      project_id: proj.id,
      project_code: proj.project_code,
      category,
      amount: Number(amount),
      expense_date: expenseDate,
      description,
    };

    setExpenses([newExpense, ...expenses]);
    setAmount("");
    setDescription("");
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Delete this expense?")) {
      setExpenses(expenses.filter((ex) => ex.id !== id));
    }
  };

  // Filter Logic
  const filteredExpenses = expenses.filter((ex) => {
    if (filterProject && ex.project_id !== Number(filterProject)) return false;
    if (filterCategory && ex.category !== filterCategory) return false;
    if (filterDateFrom && ex.expense_date < filterDateFrom) return false;
    if (filterDateTo && ex.expense_date > filterDateTo) return false;
    return true;
  });

  // Calculate Totals for Stats
  let total = 0;
  let tTravel = 0;
  let tFood = 0;
  let tHotel = 0;
  let tOther = 0;

  filteredExpenses.forEach((ex) => {
    total += ex.amount;
    if (ex.category === "Travel") tTravel += ex.amount;
    else if (ex.category === "Food") tFood += ex.amount;
    else if (ex.category === "Hotel") tHotel += ex.amount;
    else if (ex.category === "Other") tOther += ex.amount;
  });

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
      {/* Add Expense Form */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h2>Add Expense</h2>
        </div>
        <div className="card-body">
          <form
            onSubmit={handleAddExpense}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}
          >
            <div className="form-group" style={{ minWidth: "180px" }}>
              <label>Project <span className="req">*</span></label>
              <select
                className="form-control"
                value={projectId}
                onChange={(e) => setProjectId(Number(e.target.value) || "")}
                required
              >
                <option value="">Select</option>
                {projects.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.project_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: "120px" }}>
              <label>Category <span className="req">*</span></label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense["category"])}
                required
              >
                <option>Travel</option>
                <option>Food</option>
                <option>Hotel</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group" style={{ width: "110px" }}>
              <label>Amount (₹) <span className="req">*</span></label>
              <input
                type="number"
                className="form-control"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || "")}
                required
              />
            </div>
            <div className="form-group" style={{ width: "140px" }}>
              <label>Date <span className="req">*</span></label>
              <input
                type="date"
                className="form-control"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: "180px", flex: 1 }}>
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: "38px" }}>
              + Add
            </button>
          </form>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5,1fr)", marginBottom: "16px" }}>
        <div className="stat-card" style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}>
          <div className="stat-body">
            <div className="stat-value" style={{ color: "var(--brand)" }}>
              ₹{fmt(total)}
            </div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">₹{fmt(tTravel)}</div>
            <div className="stat-label">Travel</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">₹{fmt(tFood)}</div>
            <div className="stat-label">Food</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">₹{fmt(tHotel)}</div>
            <div className="stat-label">Hotel</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">₹{fmt(tOther)}</div>
            <div className="stat-label">Other</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <select
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto", minWidth: "180px" }}
          value={filterProject}
          onChange={(e) => setFilterProject(Number(e.target.value) || "")}
        >
          <option value="">All Projects</option>
          {projects.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.project_name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Travel">Travel</option>
          <option value="Food">Food</option>
          <option value="Hotel">Hotel</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
        />
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>to</span>
        <input
          type="date"
          className="form-control"
          style={{ fontSize: "12px", padding: "7px 10px", width: "auto" }}
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setFilterProject("");
            setFilterCategory("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn btn-sm"
          style={{
            marginLeft: "auto",
            background: "var(--green-bg)",
            color: "var(--green-text)",
            border: "1px solid #a7f3d0",
            fontWeight: 700,
          }}
          onClick={() => alert("Mock export expenses to CSV.")}
        >
          Export
        </button>
      </form>

      {/* Expenses Table */}
      <div
        className="card"
        style={{
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          minHeight: "250px",
          overflow: "hidden",
        }}
      >
        <div
          className="card-header"
          style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}
        >
          <h2 style={{ fontSize: "15px" }}>Expenses ({filteredExpenses.length})</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table>
            <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={6}>No expenses match your filters.</td>
                </tr>
              ) : (
                filteredExpenses.map((ex) => (
                  <tr key={ex.id}>
                    <td className="font-semibold text-sm">{formatDate(ex.expense_date)}</td>
                    <td>
                      <code
                        style={{
                          fontSize: "11px",
                          background: "var(--surface-2)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {ex.project_code}
                      </code>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ex.category === "Travel"
                            ? "badge-blue"
                            : ex.category === "Food"
                            ? "badge-green"
                            : ex.category === "Hotel"
                            ? "badge-yellow"
                            : "badge-gray"
                        }`}
                      >
                        {ex.category}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{ex.description || "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brand)" }}>
                      ₹{ex.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                        onClick={() => handleDeleteExpense(ex.id)}
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
      </div>
    </>
  );
}
