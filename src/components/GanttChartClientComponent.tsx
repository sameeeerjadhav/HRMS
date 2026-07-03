"use client";

import { useState } from "react";

type GanttTask = {
  id: number;
  task_name: string;
  emp_name: string;
  from_date: string;
  to_date: string;
  task_worked: number;
};

type GanttProject = {
  id: number;
  project_code: string;
  project_name: string;
  start_date: string;
  deadline_date: string;
  status: string;
};

export default function GanttChartClientComponent({
  projects,
  selectedProject,
  tasks,
}: {
  projects: GanttProject[];
  selectedProject: GanttProject | null;
  tasks: GanttTask[];
}) {
  const [selectedId, setSelectedId] = useState<number>(selectedProject?.id || 0);

  // Helper to generate calendar days for the Gantt Chart
  const generateDays = (startDate: string, endDate: string) => {
    const days = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    // Add some padding
    current.setDate(current.getDate() - 2);
    end.setDate(end.getDate() + 5);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const ganttDays = selectedProject ? generateDays(selectedProject.start_date, selectedProject.deadline_date) : [];

  const handleProjectSelect = (id: number) => {
    setSelectedId(id);
    // In a real app, this would route to ?id=id or fetch new data.
    // For now, we simulate a full page reload if we were routing, 
    // but here we just rely on Next.js passing new props if navigated.
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Project Timeline</h1>
          <p>Visualize task schedules and progress across your projects.</p>
        </div>
        <div className="page-header-actions">
          <select 
            className="form-control" 
            value={selectedId} 
            onChange={(e) => handleProjectSelect(Number(e.target.value))}
            style={{ minWidth: "250px" }}
          >
            <option value={0}>Select a project to view...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.project_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject ? (
        <div className="card" style={{ overflowX: "auto", padding: "20px" }}>
          <div style={{ minWidth: "800px" }}>
            <div style={{ display: "flex", borderBottom: "2px solid var(--border)", paddingBottom: "10px", marginBottom: "10px" }}>
              <div style={{ width: "250px", fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>
                Tasks
              </div>
              <div style={{ display: "flex", flex: 1, borderLeft: "1px solid var(--border-light)" }}>
                {ganttDays.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        flex: 1, 
                        minWidth: "30px", 
                        textAlign: "center", 
                        fontSize: "10px", 
                        color: isWeekend ? "var(--muted-light)" : "var(--muted)",
                        background: isWeekend ? "var(--surface-2)" : "transparent",
                        borderRight: "1px solid var(--border-light)"
                      }}
                    >
                      <div>{d.toLocaleDateString('en-GB', { month: 'short' })}</div>
                      <div style={{ fontWeight: 700, color: isWeekend ? "var(--muted-light)" : "var(--text-2)" }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {tasks.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                No tasks assigned to this project yet.
              </div>
            ) : (
              tasks.map((task) => {
                const start = new Date(task.from_date);
                const end = new Date(task.to_date);
                return (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed var(--border-light)" }}>
                    <div style={{ width: "250px", flexShrink: 0, paddingRight: "15px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{task.task_name}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>{task.emp_name}</div>
                    </div>
                    <div style={{ display: "flex", flex: 1, position: "relative", height: "30px" }}>
                      {/* Grid lines */}
                      {ganttDays.map((d, i) => (
                        <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border-light)", background: (d.getDay() === 0 || d.getDay() === 6) ? "var(--surface-2)" : "transparent" }}></div>
                      ))}
                      
                      {/* Task Bar */}
                      {ganttDays.map((d, i) => {
                        const isStart = d.toDateString() === start.toDateString();
                        const isEnd = d.toDateString() === end.toDateString();
                        const isActive = d >= start && d <= end;

                        if (isActive && isStart) {
                          // Calculate width in days
                          const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
                          const widthPct = (daysDiff / ganttDays.length) * 100;
                          const leftPct = (i / ganttDays.length) * 100;

                          return (
                            <div
                              key="bar"
                              style={{
                                position: "absolute",
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                height: "20px",
                                top: "5px",
                                background: "var(--brand)",
                                borderRadius: "4px",
                                zIndex: 10,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                              title={`${task.task_name} (${task.from_date} to ${task.to_date})`}
                            >
                              {task.task_worked}h logged
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              Select a project
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              Choose a project from the dropdown above to view its Gantt chart timeline.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
