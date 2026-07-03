"use client";

import { useRouter } from "next/navigation";

export default function ViewProjectClientComponent({
  project,
  tasks,
  expenses
}: {
  project: any;
  tasks: any[];
  expenses: any[];
}) {
  const router = useRouter();

  // Basic KPI calculations
  const totalBudget = Number(project.budget_hours) * Number(project.hr_rate);
  const totalCost = Number(project.total_hours) * Number(project.hr_rate);
  const expenseCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalActualCost = totalCost + expenseCost;
  const isOverBudget = totalActualCost > totalBudget;
  const margin = totalBudget - totalActualCost;

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{project.project_name} ({project.project_code})</h2>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>Back</button>
           <button className="btn btn-primary btn-sm" onClick={() => router.push(`/admin/add_project?id=${project.id}`)}>Edit Project</button>
        </div>
      </div>
      
      <div className="card-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          
          <div style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Status</div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
          </div>
          
          <div style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Timeline</div>
            <div style={{ fontSize: "16px", fontWeight: 600 }}>
              {project.start_date.split('T')[0]} <span style={{color: "var(--text-muted)"}}>to</span> {project.deadline_date.split('T')[0]}
            </div>
          </div>
          
          <div style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
             <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Task Progress</div>
             <div style={{ fontSize: "18px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
               {progress}% 
               <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand)" }}></div>
               </div>
             </div>
          </div>

        </div>

        <h3 style={{ marginTop: "30px", marginBottom: "15px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>Financial Health</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div className="card" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Total Budget</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>₹{totalBudget.toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>{project.budget_hours} hrs @ ₹{project.hr_rate}/hr</div>
          </div>
          
          <div className="card" style={{ padding: "20px", textAlign: "center" }}>
             <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Actual Cost</div>
             <div style={{ fontSize: "24px", fontWeight: 800 }}>₹{totalActualCost.toLocaleString()}</div>
             <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>{project.total_hours} hrs logged + ₹{expenseCost.toLocaleString()} expenses</div>
          </div>

          <div className="card" style={{ padding: "20px", textAlign: "center", border: isOverBudget ? "2px solid var(--red)" : "2px solid var(--green)" }}>
             <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>{isOverBudget ? "Loss Margin" : "Profit Margin"}</div>
             <div style={{ fontSize: "24px", fontWeight: 800, color: isOverBudget ? "var(--red)" : "var(--green-text)" }}>
                ₹{Math.abs(margin).toLocaleString()}
             </div>
             <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>{isOverBudget ? "Over Budget" : "Under Budget"}</div>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "40px" }}>
          <div>
            <h3 style={{ marginBottom: "15px" }}>Task Breakdown</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Status</th>
                    <th>Hours Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center" }}>No tasks found.</td></tr>
                  ) : tasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.task_name}</td>
                      <td><span className={`status-badge status-${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span></td>
                      <td>{t.utilized_hours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
             <h3 style={{ marginBottom: "15px" }}>Expense Breakdown</h3>
             <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center" }}>No expenses found.</td></tr>
                  ) : expenses.map(e => (
                    <tr key={e.id}>
                      <td>{e.expense_date.split('T')[0]}</td>
                      <td>{e.category}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(e.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
