import Topbar from "@/components/Topbar";
import LeavesClientComponent from "@/components/LeavesClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminLeavesPage() {
  const allLeaveTypes = await prisma.leave_types.findMany();
  
  const dbLeaveBalances = await prisma.leave_balances.findMany({
    include: {
      users: true,
      leave_types: true
    }
  });

  const leaveTypes = allLeaveTypes.map((lt: any) => ({
    id: lt.id,
    name: lt.name,
    days_per_credit: Number(lt.days_per_credit || 0),
    credit_cycle: "yearly", // Fallback for mock cycle
    credit_day: 1,
    max_carry_fwd: 0,
    color: lt.color || "#6366f1",
    is_active: true
  }));

  const balSummary: Record<number, any> = {};
  
  dbLeaveBalances.forEach(b => {
    if (!balSummary[b.leave_type_id]) {
      balSummary[b.leave_type_id] = { leave_type_id: b.leave_type_id, total_bal: 0, total_used: 0, cnt: 0 };
    }
    balSummary[b.leave_type_id].total_bal += Number(b.balance);
    balSummary[b.leave_type_id].total_used += Number(b.used);
    balSummary[b.leave_type_id].cnt += 1;
  });

  const userMap = new Map<number, any>();
  dbLeaveBalances.forEach(b => {
    if (!userMap.has(b.user_id)) {
      userMap.set(b.user_id, {
        id: b.user_id,
        name: b.users?.name || "Unknown",
        role: b.users?.role || "employee",
        balances: {}
      });
    }
    userMap.get(b.user_id).balances[b.leave_type_id] = {
      balance: Number(b.balance),
      used: Number(b.used)
    };
  });

  const users = Array.from(userMap.values());

  return (
    <>
      <Topbar title="Leave Management" breadcrumb="Types, Credits & Balances" user="Admin User" role="Admin" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Leave Management</h1>
            <p>Create leave types, configure auto-credit schedules, and manually credit employees.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-success">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        <LeavesClientComponent initialLeaveTypes={leaveTypes} initialBalSummary={balSummary} users={users} />
      </div>
    </>
  );
}
