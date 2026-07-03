import EmployeeSidebar from "@/components/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <EmployeeSidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
