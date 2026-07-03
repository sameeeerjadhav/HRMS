"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus, logTaskHours } from "@/app/actions/taskActions";

type Task = {
  id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  subtask: string;
  from_date: string;
  to_date: string;
  assigned_by_name: string;
  hours: number;
  utilized_hours: number;
  status: string;
};

type ProjectOption = {
  id: number;
  name: string;
  code: string;
};

export default function MyTasksClientComponent({
  initialTasks,
  myProjects,
  userId,
}: {
  initialTasks: Task[];
  myProjects: ProjectOption[];
  userId: number;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filterProject, setFilterProject] = useState<string>("");
  const [mode, setMode] = useState<"day" | "all">("day");
  
  // Just use a static date for "today" in this mock setup for navigation purposes
  const [currentDate, setCurrentDate] = useState("2026-07-02");

  const handleDateChange = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: number, newStatus: string) => {
    // Optimistic Update
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    
    startTransition(async () => {
      const res = await updateTaskStatus(id, newStatus as any);
      if (!res.success) {
        alert(res.error);
        // On error, a real app would revert the optimistic update
      }
    });
  };

  const handleLogTime = (taskId: number) => {
    // In a real app, open a modal to input hours
    alert(`Log time for task ${taskId} would open here`);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchProject = !filterProject || t.project_id.toString() === filterProject;
    
    const taskFrom = new Date(t.from_date);
    const taskTo = new Date(t.to_date);
    const curr = new Date(currentDate);

    const matchDate =
      mode === "all" || (taskFrom <= curr && taskTo >= curr);

    return matchProject && matchDate;
  });

  return (
    <>
      {/* Filters */}
      <div
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
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "6px 10px" }}
          onClick={() => {
            setMode("day");
            handleDateChange(-1);
          }}
        >
          ←
        </button>
        <input
          type="date"
          className="form-control"
          style={{ fontSize: "12.5px", padding: "7px 10px", width: "auto", fontWeight: 600 }}
          value={currentDate}
          onChange={(e) => {
            setMode("day");
            setCurrentDate(e.target.value);
          }}
        />
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "6px 10px" }}
          onClick={() => {
            setMode("day");
            handleDateChange(1);
          }}
        >
          →
        </button>
        <button
          className={`btn btn-sm ${mode === "day" && currentDate === "2026-07-02" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setMode("day");
            setCurrentDate("2026-07-02");
          }}
        >
          Today
        </button>
        <button
          className={`btn btn-sm ${mode === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setMode("all")}
        >
          All
        </button>
      </div>

      {myProjects.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
          <select
            className="form-control"
            style={{ fontSize: "13px", padding: "7px 12px", minWidth: "220px", width: "auto" }}
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {myProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.code})
              </option>
            ))}
          </select>
          <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>
            {filteredTasks.length} task(s) shown
          </span>
        </div>
      )}

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "60px 20px" }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted-light)"
              strokeWidth="1.5"
              style={{ display: "block", margin: "0 auto 16px" }}
            >
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              No tasks for {mode === "day" ? new Date(currentDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "this period"}
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              Try selecting a different date or view all tasks.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredTasks.map((t) => {
            const today = new Date("2026-07-02");
            const taskTo = new Date(t.to_date);
            const isOverdue = taskTo < today;
            const daysLeft = Math.ceil((taskTo.getTime() - today.getTime()) / 86400000);
            const utilized = t.utilized_hours;
            const assigned = t.hours;
            const pct = assigned > 0 ? Math.min(100, Math.round((utilized / assigned) * 100)) : 0;
            const barColor = pct >= 100 ? "var(--green)" : "var(--blue)";

            return (
              <div key={t.id} className="card" style={isOverdue ? { borderColor: "#fca5a5" } : {}}>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <code
                          style={{
                            fontSize: "11px",
                            background: "var(--surface-2)",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            color: "var(--muted)",
                          }}
                        >
                          {t.project_code}
                        </code>
                        <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>
                          {t.project_name}
                        </span>
                        {isOverdue && (
                          <span className="badge badge-red" style={{ fontSize: "10.5px" }}>
                            Overdue
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "var(--text)",
                          marginBottom: "6px",
                        }}
                      >
                        {t.subtask}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          flexWrap: "wrap",
                          fontSize: "12.5px",
                          color: "var(--muted)",
                        }}
                      >
                        <span>
                          {new Date(t.from_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} →{" "}
                          {new Date(t.to_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        <span>Assigned by {t.assigned_by_name}</span>
                        {!isOverdue && daysLeft >= 0 && (
                          <span
                            style={{
                              color:
                                daysLeft <= 2
                                  ? "var(--red)"
                                  : daysLeft <= 5
                                  ? "var(--yellow)"
                                  : "var(--muted)",
                              fontWeight: 600,
                            }}
                          >
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "6px",
                        flexShrink: 0,
                        minWidth: "150px",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: utilized > assigned ? "var(--red)" : "var(--green-text)",
                            fontSize: "16px",
                          }}
                        >
                          {utilized.toFixed(1)}
                        </span>
                        <span>/ {assigned.toFixed(1)} hrs</span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "var(--border)",
                          borderRadius: "3px",
                          overflow: "hidden",
                          width: "140px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: utilized > assigned ? "var(--red)" : barColor,
                            borderRadius: "3px",
                          }}
                        ></div>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: utilized > assigned ? "var(--red)" : "var(--muted)",
                        }}
                      >
                        {utilized > assigned ? (
                          `${pct}% · +${(utilized - assigned).toFixed(1)} hrs extra`
                        ) : (
                          `${pct}% done`
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Update Form */}
                  {t.status !== "Completed" ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const hrs = Number(formData.get("logHrs"));
                        const status = formData.get("status") as string;
                        
                        startTransition(async () => {
                          const logRes = await logTaskHours(t.id, userId, hrs, new Date().toISOString().split("T")[0]);
                          if (!logRes.success) {
                            alert(logRes.error + " Are you clocked in?");
                            return;
                          }
                          const statusRes = await updateTaskStatus(t.id, status as any);
                          if (!statusRes.success) {
                            alert(statusRes.error);
                          } else {
                            // Quick optimistic update
                            setTasks(tasks.map(task => task.id === t.id ? { ...task, utilized_hours: task.utilized_hours + hrs, status } : task));
                          }
                        });
                      }}
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
                          Log Hrs:
                        </label>
                        <input
                          type="number"
                          name="logHrs"
                          className="form-control"
                          style={{
                            width: "70px",
                            fontSize: "12px",
                            padding: "6px 8px",
                            textAlign: "center",
                          }}
                          min="0.5"
                          step="0.5"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
                          Status:
                        </label>
                        <select
                          className="form-control"
                          name="status"
                          style={{ fontSize: "12px", padding: "6px 10px", width: "auto" }}
                          defaultValue={t.status}
                        >
                          <option value="In_Progress">In Progress</option>
                          <option value="On_Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                        {isPending ? "..." : "Update"}
                      </button>
                    </form>
                  ) : (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "var(--green-text)",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
