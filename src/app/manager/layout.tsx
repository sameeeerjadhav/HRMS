import ManagerSidebar from "@/components/ManagerSidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <ManagerSidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
