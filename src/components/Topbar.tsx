"use client";
import { useEffect, useState } from "react";

export default function Topbar({
  title,
  breadcrumb,
  user,
  role,
}: {
  title: string;
  breadcrumb: string;
  user: string;
  role: string;
}) {
  const [realUser, setRealUser] = useState(user);
  const [realRole, setRealRole] = useState(role);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setRealUser(data.user.name);
          setRealRole(data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="page-title">{title}</span>
        <span className="page-breadcrumb">{breadcrumb}</span>
      </div>
      <div className="topbar-right">
        <span className="role-chip">{realRole}</span>
        <div className="topbar-avatar">{realUser.charAt(0).toUpperCase()}</div>
        <span className="topbar-name">{realUser}</span>
      </div>
    </header>
  );
}
