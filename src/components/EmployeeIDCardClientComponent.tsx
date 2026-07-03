"use client";

type IDCardData = {
  fullName: string;
  employeeId: string;
  jobTitle: string;
  departmentName: string;
  dateOfJoining: string;
  initials: string;
};

export default function EmployeeIDCardClientComponent({
  data,
}: {
  data: IDCardData;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-header-text">
          <h1>ID Card</h1>
          <p>Digital Identity</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            Print ID Card
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
        <div style={{
          width: "320px",
          minHeight: "480px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)",
          border: "1px solid #e2e8f0",
          position: "relative"
        }}>
          {/* Top gradient band */}
          <div style={{
            background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)",
            padding: "24px 20px 50px",
            textAlign: "center",
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              bottom: "-1px", left: "0", right: "0",
              height: "30px",
              background: "#fff",
              borderRadius: "30px 30px 0 0"
            }}></div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: ".5px", marginBottom: "4px" }}>
              HRMS Portal
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Employee Identity Card
            </div>
          </div>

          {/* Photo area */}
          <div style={{
            display: "flex", justifyContent: "center",
            marginTop: "-36px",
            position: "relative", zIndex: 2
          }}>
            <div style={{
              width: "90px", height: "90px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
              border: "4px solid #fff",
              boxShadow: "0 4px 12px rgba(79,70,229,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 800, color: "#4338ca"
            }}>
              {data.initials}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 24px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", marginBottom: "2px" }}>
              {data.fullName}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
              {data.jobTitle}
            </div>

            <div style={{ textAlign: "left", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" }}>Emp No.</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{data.employeeId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" }}>Department</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{data.departmentName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" }}>Date of Joining</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{data.dateOfJoining}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "12px 20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".8px" }}>
              This card is the property of the company
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "center", gap: "2px" }}>
              {/* Dummy Barcode lines */}
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={i} style={{
                  display: "block",
                  width: i % 2 === 0 ? "2px" : "1px",
                  height: i % 3 === 0 ? "16px" : "20px",
                  background: i % 2 === 0 ? "#1e293b" : "#64748b",
                  borderRadius: "1px"
                }}></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
