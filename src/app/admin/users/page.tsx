import Topbar from "@/components/Topbar";
import UsersClientComponent from "@/components/UsersClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const dbUsers = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    }
  });

  const users = dbUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at.toISOString(),
  }));

  return (
    <>
      <Topbar title="System Users" breadcrumb="Manage login accounts" user="Admin User" role="Admin" />
      <div className="page-body">
        <UsersClientComponent initialUsers={users} />
      </div>
    </>
  );
}
