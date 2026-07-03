"use client";

import { useState, useTransition } from "react";
import { saveLocation, toggleLocationStatus } from "@/app/actions/locationActions";

type Location = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  is_remote: boolean;
  is_active: boolean;
  assigned_users: number;
};

type UserAssignment = {
  id: number;
  name: string;
  email: string;
  role: string;
  assigned_locations: Location[];
};

export default function LocationsClientComponent({
  initialLocations,
  initialUsers,
}: {
  initialLocations: Location[];
  initialUsers: UserAssignment[];
}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [users, setUsers] = useState<UserAssignment[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  // Form states
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState(19.076);
  const [locLng, setLocLng] = useState(72.8777);
  const [locRadius, setLocRadius] = useState(200);
  const [isRemote, setIsRemote] = useState(false);

  // User assignments form
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [assignLocId, setAssignLocId] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const handleToggleUser = (id: number) => {
    const next = new Set(selectedUserIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUserIds(next);
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLocId || selectedUserIds.size === 0) return alert("Select location and users.");
    const loc = locations.find((l) => l.id.toString() === assignLocId);
    if (loc) {
      setUsers(
        users.map((u) => {
          if (selectedUserIds.has(u.id)) {
            const hasLoc = u.assigned_locations.some((l) => l.id === loc.id);
            if (!hasLoc) return { ...u, assigned_locations: [...u.assigned_locations, loc] };
          }
          return u;
        })
      );
      setSelectedUserIds(new Set());
      alert(`Assigned ${selectedUserIds.size} user(s) to ${loc.name}.`);
    }
  };

  const handleRemoveAssignment = (userId: number, locId: number) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, assigned_locations: u.assigned_locations.filter((l) => l.id !== locId) }
          : u
      )
    );
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName) return alert("Location name required.");
    
    const formData = new FormData();
    if (editingLoc) formData.append("id", editingLoc.id.toString());
    formData.append("name", locName);
    formData.append("address", locAddress);
    formData.append("latitude", locLat.toString());
    formData.append("longitude", locLng.toString());
    formData.append("radius_m", locRadius.toString());
    if (isRemote) formData.append("is_remote", "on");

    startTransition(async () => {
      const res = await saveLocation(formData);
      if (res.success) {
        setIsEditOpen(false);
        setIsAddOpen(false);
      } else {
        alert(res.error);
      }
    });
  };

  const openEdit = (loc: Location) => {
    setEditingLoc(loc);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocLat(loc.latitude);
    setLocLng(loc.longitude);
    setLocRadius(loc.radius_m);
    setIsRemote(loc.is_remote);
    setIsEditOpen(true);
  };

  const filteredUsers = users.filter((u) =>
    searchUser ? u.name.toLowerCase().includes(searchUser.toLowerCase()) : true
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Office Locations</h1>
          <p>Define office locations, assign employees to specific locations, or allow remote work.</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingLoc(null);
              setLocName("");
              setLocAddress("");
              setLocLat(19.076);
              setLocLng(72.8777);
              setLocRadius(200);
              setIsRemote(false);
              setIsAddOpen(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Location
          </button>
        </div>
      </div>

      {/* User Location Assignments */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h2>User Location Assignments</h2>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0" }}>
              Select users and assign them to a location. Users with no assignment can clock in from any active location.
            </p>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleAssign}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "20px", flexWrap: "wrap" }}>
              <div className="form-group" style={{ margin: 0, minWidth: "240px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600 }}>Assign to Location</label>
                <select
                  className="form-control"
                  value={assignLocId}
                  onChange={(e) => setAssignLocId(e.target.value)}
                  required
                >
                  <option value="">Select location…</option>
                  {locations.filter(l => l.is_active).map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.is_remote ? "(Remote)" : "(Office)"}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginBottom: "1px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Assign Selected
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedUserIds(new Set())}
                style={{ marginBottom: "1px" }}
              >
                Clear
              </button>
            </div>

            <div className="table-wrap" style={{ boxShadow: "none", maxHeight: "420px", overflowY: "auto" }}>
              <div
                className="table-toolbar"
                style={{
                  padding: "10px 16px",
                  position: "sticky",
                  top: 0,
                  zIndex: 3,
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    style={{ width: "15px", height: "15px", accentColor: "var(--brand)", cursor: "pointer" }}
                    checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>Select All</span>
                </div>
                <div className="search-box">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>
              </div>
              <table>
                <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Assigned Locations</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ paddingLeft: "16px" }}>
                        <input
                          type="checkbox"
                          style={{ width: "15px", height: "15px", accentColor: "var(--brand)", cursor: "pointer" }}
                          checked={selectedUserIds.has(u.id)}
                          onChange={() => handleToggleUser(u.id)}
                        />
                      </td>
                      <td>
                        <div className="td-user">
                          <div className="td-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="td-name">{u.name}</div>
                            <div className="td-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === "manager" ? "badge-brand" : "badge-gray"}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td>
                        {u.assigned_locations.length === 0 ? (
                          <span style={{ fontSize: "12.5px", color: "var(--muted-light)" }}>Global — any location</span>
                        ) : (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {u.assigned_locations.map((al) => (
                              <span key={al.id} className={`badge ${al.is_remote ? "badge-blue" : "badge-brand"}`} style={{ fontSize: "11px" }}>
                                {al.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        {u.assigned_locations.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              const confirmMsg = `Remove a location assignment from ${u.name}?`;
                              if (confirm(confirmMsg)) {
                                handleRemoveAssignment(u.id, u.assigned_locations[0].id); // Simplifying: just removes the first for mock
                              }
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>

      {/* Locations List */}
      <div className="table-wrap" style={{ maxHeight: "400px", overflowY: "auto" }}>
        <div className="table-toolbar" style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--surface)" }}>
          <h2>
            All Locations <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "13px" }}>({locations.length})</span>
          </h2>
        </div>
        <table>
          <thead style={{ position: "sticky", top: "56px", zIndex: 2 }}>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Coordinates</th>
              <th>Radius</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assigned Users</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8}>No locations yet. Click "Add Location" to create one.</td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id}>
                  <td className="font-semibold">{loc.name}</td>
                  <td className="text-muted text-sm">{loc.address || "—"}</td>
                  <td className="text-sm" style={{ fontFamily: "monospace", color: "var(--muted)" }}>
                    {loc.is_remote ? "—" : `${loc.latitude}, ${loc.longitude}`}
                  </td>
                  <td className="text-sm text-muted">{loc.is_remote ? "—" : `${loc.radius_m}m`}</td>
                  <td>
                    {loc.is_remote ? (
                      <span className="badge badge-blue">Remote</span>
                    ) : (
                      <span className="badge badge-brand">Office</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${loc.is_active ? "badge-green" : "badge-red"}`}>
                      {loc.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {loc.assigned_users > 0 ? (
                      <span className="badge badge-gray">{loc.assigned_users} user(s)</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--muted-light)" }}>Global</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(loc)}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await toggleLocationStatus(loc.id, loc.is_active);
                          });
                        }}
                      >
                        {loc.is_active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Location Modal */}
      {(isAddOpen || isEditOpen) && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddOpen(false);
              setIsEditOpen(false);
            }
          }}
        >
          <div className="modal" style={{ maxWidth: "750px" }}>
            <div className="modal-header">
              <h3>{editingLoc ? "Edit Location" : "Add Office Location"}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveLocation}>
              <div className="modal-body" style={{ padding: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "400px" }}>
                  {/* Left: Form fields */}
                  <div style={{ padding: "20px", overflowY: "auto" }}>
                    <div className="form-group" style={{ marginBottom: "14px" }}>
                      <label>Location Name <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Head Office Mumbai"
                        value={locName}
                        onChange={(e) => setLocName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "14px" }}>
                      <label>Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Full address"
                        value={locAddress}
                        onChange={(e) => setLocAddress(e.target.value)}
                      />
                    </div>
                    {!isRemote && (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                          <div className="form-group">
                            <label>Latitude</label>
                            <input
                              type="number"
                              step="0.0000001"
                              className="form-control"
                              value={locLat}
                              onChange={(e) => setLocLat(parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="form-group">
                            <label>Longitude</label>
                            <input
                              type="number"
                              step="0.0000001"
                              className="form-control"
                              value={locLng}
                              onChange={(e) => setLocLng(parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: "14px" }}>
                          <label>Allowed Radius (metres)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={locRadius}
                            onChange={(e) => setLocRadius(parseInt(e.target.value))}
                            min="50"
                            max="5000"
                          />
                          <span style={{ fontSize: "11px", color: "var(--muted-light)" }}>Must be within this distance to clock in</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ width: "100%", marginBottom: "14px" }}
                          onClick={() => alert("Simulating Geolocation API...")}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                          </svg>
                          Use My Current Location
                        </button>
                      </div>
                    )}
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="remote_toggle"
                        checked={isRemote}
                        onChange={(e) => setIsRemote(e.target.checked)}
                      />
                      <label htmlFor="remote_toggle">Remote / Work from Home (no GPS check)</label>
                    </div>
                  </div>
                  {/* Right: Map */}
                  <div style={{ background: "var(--surface-2)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, minHeight: "350px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-light)" }}>
                      <div style={{ textAlign: "center" }}>
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "10px" }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p>Interactive Map Simulation</p>
                      </div>
                    </div>
                    <div style={{ padding: "8px 12px", fontSize: "11px", color: "var(--muted)", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      Click map or drag marker to set location
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving..." : editingLoc ? "Save Changes" : "Add Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
