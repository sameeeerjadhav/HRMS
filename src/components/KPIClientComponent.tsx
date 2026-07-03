"use client";

import { useState } from "react";

type Department = {
  id: number;
  name: string;
};

type KPIEmployee = {
  id: number;
  user_id: number;
  employee_id: string;
  name: string;
  dept_name: string;
};

export default function KPIClientComponent({
  initialEmployees,
  departments,
}: {
  initialEmployees: KPIEmployee[];
  departments: Department[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("0");
  const [period, setPeriod] = useState("3m");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter employees
  const filteredEmployees = initialEmployees.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.employee_id.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== "0" && e.dept_name !== departments.find(d => d.id === Number(deptFilter))?.name) return false;
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((emp) => emp.user_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (userId: number) => {
    if (selectedIds.includes(userId)) {
      setSelectedIds(selectedIds.filter((id) => id !== userId));
    } else {
      setSelectedIds([...selectedIds, userId]);
    }
  };

  const generateCSV = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    // Generate mock CSV data
    const headers = ["Employee Name", "Employee ID", "Department", "Period", "Attendance Score (%)", "Task Completion (%)", "Leave Score (%)", "Overtime Score (%)", "Final KPI Score (%)"];
    const rows = selectedIds.map(uid => {
      const emp = initialEmployees.find(e => e.user_id === uid);
      if (!emp) return [];
      
      // Randomize scores for demonstration
      const att = (80 + Math.random() * 20).toFixed(2);
      const tasks = (70 + Math.random() * 30).toFixed(2);
      const leave = (90 + Math.random() * 10).toFixed(2);
      const ot = (50 + Math.random() * 50).toFixed(2);
      
      const final = ((parseFloat(att) * 0.3) + (parseFloat(tasks) * 0.5) + (parseFloat(leave) * 0.1) + (parseFloat(ot) * 0.1)).toFixed(2);

      return [
        `"${emp.name}"`, 
        `"${emp.employee_id}"`, 
        `"${emp.dept_name}"`, 
        `"${period}"`,
        att, 
        tasks, 
        leave, 
        ot, 
        final
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KPI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "1", flexWrap: "wrap" }}>
          <div className="search-box" style={{ minWidth: "200px", flex: "0 1 260px" }}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or ID..." />
          </div>
          <select className="form-control" style={{ width: "auto", fontSize: "13px", padding: "9px 12px" }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="0">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select className="form-control" style={{ width: "auto", fontSize: "13px", padding: "9px 12px" }} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1m">Last 1 Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
          {(search || deptFilter !== "0") && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setDeptFilter("0"); }}>Clear</button>
          )}
        </div>
        <button type="button" className="btn btn-sm" style={{ background: "var(--green-bg)", color: "var(--green-text)", border: "1px solid #a7f3d0", fontWeight: 700 }} onClick={generateCSV}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Selected
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>Employees <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>({filteredEmployees.length})</span></h2>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "36px" }}>
                <input 
                  type="checkbox" 
                  style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }} 
                  onChange={handleSelectAll} 
                  checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                />
              </th>
              <th>Employee</th>
              <th>ID</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr className="empty-row"><td colSpan={4}>No employees found.</td></tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.user_id}>
                  <td>
                    <input 
                      type="checkbox" 
                      style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }} 
                      checked={selectedIds.includes(emp.user_id)}
                      onChange={() => handleSelectOne(emp.user_id)}
                    />
                  </td>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{emp.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{emp.employee_id}</td>
                  <td className="text-sm text-muted">{emp.dept_name || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
