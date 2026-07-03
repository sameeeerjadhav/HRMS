"use client";

import { useState } from "react";

type Holiday = {
  id: number;
  title: string;
  holiday_date: string;
  description: string;
  recurring: boolean;
};

export default function HolidaysClientComponent({
  initialHolidays,
}: {
  initialHolidays: Holiday[];
}) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);

  // Filters
  const [filterYear, setFilterYear] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Bulk Upload states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openAdd = () => {
    setTitle("");
    setHolidayDate("");
    setDescription("");
    setRecurring(false);
    setIsAddOpen(true);
  };

  const openEdit = (h: Holiday) => {
    setEditId(h.id);
    setTitle(h.title);
    setHolidayDate(h.holiday_date);
    setDescription(h.description || "");
    setIsEditOpen(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !holidayDate) return alert("Title and Date are required.");
    const newH: Holiday = {
      id: Date.now(),
      title,
      holiday_date: holidayDate,
      description,
      recurring,
    };
    setHolidays([...holidays, newH].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)));
    setIsAddOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !holidayDate) return alert("Title and Date are required.");
    setHolidays(
      holidays
        .map((h) => (h.id === editId ? { ...h, title, holiday_date: holidayDate, description } : h))
        .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
    );
    setIsEditOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this holiday?")) {
      setHolidays(holidays.filter((h) => h.id !== id));
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      alert(`Simulating import of ${selectedFile.name}`);
      setIsBulkOpen(false);
      setSelectedFile(null);
    }
  };

  // Filtering Logic
  const filteredHolidays = holidays.filter((h) => {
    if (filterYear !== "all") {
      if (!h.holiday_date.startsWith(filterYear)) return false;
    }
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCount = filteredHolidays.filter((h) => h.holiday_date >= todayStr).length;
  const pastCount = filteredHolidays.filter((h) => h.holiday_date < todayStr).length;

  const years = Array.from(new Set(holidays.map((h) => h.holiday_date.substring(0, 4)))).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", { weekday: "long" });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Holidays {filterYear === "all" ? "— All Years" : filterYear}</h1>
          <p>Define company holidays. These are excluded from leave working-day calculations.</p>
        </div>
        <div className="page-header-actions">
          <select
            className="form-control"
            style={{ fontSize: "13px", padding: "7px 12px", minWidth: "100px" }}
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => setIsBulkOpen(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
            Bulk Upload
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Holiday
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{filteredHolidays.length}</div>
            <div className="stat-label">Total Holidays</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{upcomingCount}</div>
            <div className="stat-label">Upcoming</div>
            <div className="stat-sub">From today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-value">{pastCount}</div>
            <div className="stat-label">Past</div>
            <div className="stat-sub">Already passed</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>
            Holiday List{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>
              ({filteredHolidays.length})
            </span>
          </h2>
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search holidays…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Holiday Title</th>
              <th>Date</th>
              <th>Day</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ width: "120px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={7}>No holidays found.</td>
              </tr>
            ) : (
              filteredHolidays.map((h, i) => {
                const isToday = h.holiday_date === todayStr;
                const isUpcoming = h.holiday_date > todayStr;
                return (
                  <tr key={h.id} style={{ background: isToday ? "#fffbeb" : "transparent" }}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: isToday ? "var(--yellow)" : isUpcoming ? "var(--green)" : "var(--muted-light)",
                            flexShrink: 0,
                          }}
                        ></span>
                        <span className="font-semibold">{h.title}</span>
                        {h.recurring && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#ede9fe",
                              color: "#7c3aed",
                              borderRadius: "4px",
                              padding: "1px 5px",
                              marginLeft: "4px",
                            }}
                          >
                            ↻ Yearly
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-sm">{formatDate(h.holiday_date)}</td>
                    <td className="text-muted text-sm">{getDayName(h.holiday_date)}</td>
                    <td className="text-muted text-sm">{h.description || "—"}</td>
                    <td>
                      {isToday ? (
                        <span className="badge badge-yellow">Today</span>
                      ) : isUpcoming ? (
                        <span className="badge badge-green">Upcoming</span>
                      ) : (
                        <span className="badge badge-gray">Past</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid #fca5a5" }}
                          onClick={() => handleDelete(h.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setIsAddOpen(false)}>
          <div className="modal" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3>Add Holiday</h3>
              <button className="modal-close" onClick={() => setIsAddOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Holiday Title <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Republic Day"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Holiday Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Optional description…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group" style={{ marginTop: "12px" }}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="addRecurring"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                    />
                    <label htmlFor="addRecurring">Repeat every year (recurring holiday)</label>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px", display: "block" }}>
                    If checked, this holiday will automatically appear on the same date every year.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setIsEditOpen(false)}>
          <div className="modal" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3>Edit Holiday</h3>
              <button className="modal-close" onClick={() => setIsEditOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Holiday Title <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Holiday Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setIsBulkOpen(false)}>
          <div className="modal" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Bulk Upload Holidays</h3>
              <button className="modal-close" onClick={() => setIsBulkOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleBulkSubmit}>
              <div className="modal-body">
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius)",
                    padding: "14px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "6px" }}>CSV Format Required:</div>
                  <code style={{ fontSize: "12px", color: "var(--brand)" }}>title, holiday_date, description</code>
                  <div style={{ color: "var(--muted)", marginTop: "6px" }}>
                    Date format: <code>2026-01-26</code> (YYYY-MM-DD recommended)
                  </div>
                </div>
                <div
                  style={{
                    border: dragActive ? "2px dashed var(--brand)" : "2px dashed var(--border)",
                    background: dragActive ? "var(--brand-light)" : "var(--surface-2)",
                    borderRadius: "var(--radius-lg)",
                    padding: "36px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => document.getElementById("bulk_csv")?.click()}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted-light)"
                    strokeWidth="1.5"
                    style={{ display: "block", margin: "0 auto 10px" }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 12 15 15" />
                  </svg>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: selectedFile ? "var(--text)" : "var(--muted)" }}>
                    {selectedFile ? selectedFile.name : "Click to select CSV file"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted-light)", marginTop: "4px" }}>
                    or drag and drop
                  </div>
                  <input
                    type="file"
                    id="bulk_csv"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ paddingTop: "16px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsBulkOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
