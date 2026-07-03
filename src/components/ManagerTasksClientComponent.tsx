"use client";

import { useState, useTransition } from "react";
import { createTask, updateTaskStatus } from "@/app/actions/taskActions";

type Task = {
  id: number;
  project_name: string;
  task_name: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee: string | null;
  due_date: string | null;
};

export default function ManagerTasksClientComponent({
  initialTasks,
  projects,
  teamMembers,
  managerId,
}: {
  initialTasks: Task[];
  projects: { id: number; name: string }[];
  teamMembers: { id: number; name: string }[];
  managerId: number;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"list" | "board">("board");
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newHours, setNewHours] = useState("");

  const filteredTasks = tasks.filter(
    (t) =>
      !search ||
      t.task_name.toLowerCase().includes(search.toLowerCase()) ||
      t.project_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newProjectId || !newStartDate || !newEndDate || !newHours) return alert("All fields are required.");
    
    startTransition(async () => {
      const res = await createTask(
        managerId,
        Number(newProjectId),
        Number(newAssignee) || 0, // Should be valid user ID
        newTaskName,
        newStartDate,
        newEndDate,
        Number(newHours)
      );
      
      if (res.success) {
        setIsModalOpen(false);
        setNewTaskName("");
        setNewProjectId("");
        setNewAssignee("");
        setNewPriority("medium");
        setNewStartDate("");
        setNewEndDate("");
        setNewHours("");
        // Revalidation will refresh tasks, but we can also do optimistic update
        // We'll let server component refresh handle it for now
      } else {
        alert(res.error);
      }
    });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    // Optimistic Update
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    
    startTransition(async () => {
      let mappedStatus = newStatus;
      if (mappedStatus === 'todo') mappedStatus = 'Pending';
      if (mappedStatus === 'in_progress') mappedStatus = 'In_Progress';
      if (mappedStatus === 'review') mappedStatus = 'Completed'; // Mapped
      if (mappedStatus === 'done') mappedStatus = 'Completed';

      const res = await updateTaskStatus(id, mappedStatus as any);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  const getPriorityColor = (p: string) => {
    if (p === "high") return "var(--red)";
    if (p === "medium") return "var(--yellow)";
    return "var(--green)";
  };

  // Kanban Columns
  const cols = [
    { key: "todo", title: "To Do" },
    { key: "in_progress", title: "In Progress" },
    { key: "review", title: "Review" },
    { key: "done", title: "Done" },
  ] as const;

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Tasks Management</h1>
          <p>Assign tasks, track progress, and manage workloads.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Task
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <div className="search-box" style={{ minWidth: "200px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="view-toggle" style={{ marginLeft: "auto", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            style={{ padding: "7px 16px", border: "none", background: view === "list" ? "var(--brand)" : "var(--surface)", color: view === "list" ? "#fff" : "var(--muted)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
          >
            List
          </button>
          <button
            className={view === "board" ? "active" : ""}
            onClick={() => setView("board")}
            style={{ padding: "7px 16px", border: "none", borderLeft: "1px solid var(--border)", background: view === "board" ? "var(--brand)" : "var(--surface)", color: view === "board" ? "#fff" : "var(--muted)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
          >
            Kanban
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>No tasks found.</td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.task_name}</td>
                    <td className="text-muted text-sm">{t.project_name}</td>
                    <td>
                      {t.assignee ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "var(--brand-light)",
                              color: "var(--brand)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {t.assignee.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">{t.assignee}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--muted-light)" }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getPriorityColor(t.priority) }}></div>
                        <span style={{ fontSize: "12px", textTransform: "capitalize", color: "var(--text-2)" }}>{t.priority}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ fontSize: "12px", padding: "4px 8px", width: "auto" }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      >
                        {cols.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "board" && (
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "20px", minHeight: "500px" }}>
          {cols.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} style={{ flex: "1", minWidth: "280px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", borderRadius: "10px 10px 0 0" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>{col.title}</div>
                  <div style={{ background: "var(--border)", color: "var(--text-2)", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                    {colTasks.length}
                  </div>
                </div>
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                          {t.project_name}
                        </div>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getPriorityColor(t.priority) }} title={`${t.priority} priority`}></div>
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", lineHeight: "1.4" }}>
                        {t.task_name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border-light)", paddingTop: "10px" }}>
                        <select
                          className="form-control"
                          style={{ fontSize: "11px", padding: "2px 6px", height: "auto", width: "auto", background: "transparent", border: "none", color: "var(--brand)" }}
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        >
                          {cols.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                        </select>
                        {t.assignee ? (
                          <div
                            title={t.assignee}
                            style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--brand-light)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}
                          >
                            {t.assignee.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div style={{ fontSize: "11px", color: "var(--muted-light)" }}>Unassigned</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--muted-light)", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Project <span className="req">*</span></label>
                  <select className="form-control" value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} required>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Task Name <span className="req">*</span></label>
                  <input type="text" className="form-control" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} required />
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label>Assign To</label>
                    <select className="form-control" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                      <option value="">Unassigned</option>
                      {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  <div className="form-group">
                    <label>Start Date <span className="req">*</span></label>
                    <input type="date" className="form-control" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>End Date <span className="req">*</span></label>
                    <input type="date" className="form-control" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Hours <span className="req">*</span></label>
                    <input type="number" className="form-control" value={newHours} onChange={(e) => setNewHours(e.target.value)} required min="1" step="0.5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
