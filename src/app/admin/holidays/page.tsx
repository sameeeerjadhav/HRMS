import Topbar from "@/components/Topbar";
import HolidaysClientComponent from "@/components/HolidaysClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminHolidaysPage() {
  const dbHolidays = await prisma.holidays.findMany({
    orderBy: { created_at: 'desc' }
  });

  const holidays = dbHolidays.map((h: any) => ({
    id: h.id,
    title: h.name,
    holiday_date: new Date(h.date).toISOString().split('T')[0],
    description: h.description || "",
    recurring: h.is_recurring !== false,
  }));

  return (
    <>
      <Topbar title="Holidays" breadcrumb="Manage company-wide holidays" user="Admin User" role="Admin" />
      <div className="page-body">
        <HolidaysClientComponent initialHolidays={holidays} />
      </div>
    </>
  );
}
