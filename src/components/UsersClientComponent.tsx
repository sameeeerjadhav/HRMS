"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  status: "active" | "inactive";
  created_at: string;
};

export default function UsersClientComponent({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "employee">("employee");

  // Filter states
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return alert("Name and email are required.");

    const newUser: User = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: "active",
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUser].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
    setNewEmail("");
    setNewRole("employee");
    alert(`User created! A set-password link has been sent to ${newEmail}.`);
  };

  const handleResendCreds = (email: string) => {
    if (confirm(`Reset password and send new credentials to ${email}?`)) {
      alert(`Set-password link sent to ${email}.`);
    }
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Add User */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h2>Add New User</h2>
        </div>
        <div className="card-body">
          <form
            onSubmit={handleAddUser}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}
          >
            <div className="form-group" style={{ minWidth: "180px" }}>
              <label>Full Name <span className="req">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: "220px" }}>
              <label>Work Email <span className="req">*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="john@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: "130px" }}>
              <label>Role <span className="req">*</span></label>
              <select
                className="form-control"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: "38px" }}>
              Create & Send Password
            </button>
          </form>
          <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "8px" }}>
            A random password will be generated and emailed to the user. They can then login and fill their profile.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
        <div className="search-box" style={{ minWidth: "200px", flex: "0 1 280px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ fontSize: "13px", padding: "9px 12px", width: "auto" }}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
        <span style={{ fontSize: "13px", color: "var(--muted)" }}>{filteredUsers.length} user(s)</span>
      </div>

      {/* Users Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <h2>Users ({filteredUsers.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ width: "160px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={6}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td className="text-sm text-muted">{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin"
                          ? "badge-red"
                          : u.role === "manager"
                          ? "badge-blue"
                          : "badge-green"
                      }`}
                    >
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === "active" ? "badge-green" : "badge-gray"}`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{formatDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: "var(--brand-light)",
                          color: "var(--brand)",
                          border: "1px solid #c7d2fe",
                          fontSize: "11px",
                        }}
                        onClick={() => handleResendCreds(u.email)}
                      >
                        📧 Resend Credentials
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: "var(--red-bg)",
                          color: "var(--red)",
                          border: "1px solid #fca5a5",
                          fontSize: "11px",
                        }}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Del
                      </button>
                    </div>
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
