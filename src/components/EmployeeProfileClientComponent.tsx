"use client";

import { useState, useTransition } from "react";
import { updateEmployeeProfile } from "@/app/actions/employeeActions";

type EmployeeProfile = {
  first_name: string;
  last_name: string;
  job_title: string;
  department_name: string;
  employee_id: string;
  email: string;
  phone: string;
  personal_email: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  blood_group: string;
  nationality: string;
  place_of_birth: string;
  emergency_contact_no: string;
  
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;

  passport_no: string;
  place_of_issue: string;
  passport_date_of_issue: string;
  passport_date_of_expiry: string;
};

export default function EmployeeProfileClientComponent({
  profileData,
  userId,
}: {
  profileData: EmployeeProfile;
  userId: number;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState(profileData);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    startTransition(async () => {
      const res = await updateEmployeeProfile(userId, formData);
      if (res.success) {
        setIsEditMode(false);
        alert("Profile saved successfully.");
      } else {
        alert(res.error);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <div className="page-header-text">
          <h1>My Profile</h1>
          <p>{isEditMode ? "Edit Details" : "View Details"}</p>
        </div>
        {!isEditMode && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {!isEditMode && (
        <div style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-mid))", borderRadius: "12px", padding: "24px", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800 }}>
            {profile.first_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{profile.first_name} {profile.last_name}</div>
            <div style={{ fontSize: "13px", opacity: .85 }}>{profile.job_title} &middot; {profile.department_name} &middot; {profile.employee_id}</div>
          </div>
        </div>
      )}

      {isEditMode ? (
        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: "16px" }}>
            <div className="card-header"><h2>Personal Information</h2></div>
            <div className="card-body">
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group"><label>First Name</label><input type="text" name="first_name" className="form-control" value={profile.first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" name="last_name" className="form-control" value={profile.last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Phone</label><input type="text" name="phone" className="form-control" value={profile.phone} onChange={handleChange} /></div>
                <div className="form-group"><label>Personal Email</label><input type="email" name="personal_email" className="form-control" value={profile.personal_email} onChange={handleChange} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" name="date_of_birth" className="form-control" value={profile.date_of_birth} onChange={handleChange} /></div>
                <div className="form-group"><label>Gender</label><select name="gender" className="form-control" value={profile.gender} onChange={handleChange}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                <div className="form-group"><label>Blood Group</label><input type="text" name="blood_group" className="form-control" value={profile.blood_group} onChange={handleChange} /></div>
                <div className="form-group"><label>Emergency Contact</label><input type="text" name="emergency_contact_no" className="form-control" value={profile.emergency_contact_no} onChange={handleChange} /></div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ marginBottom: "16px" }}>
            <div className="card-header"><h2>Address</h2></div>
            <div className="card-body">
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group"><label>Address Line 1</label><input type="text" name="address_line1" className="form-control" value={profile.address_line1} onChange={handleChange} /></div>
                <div className="form-group"><label>City</label><input type="text" name="city" className="form-control" value={profile.city} onChange={handleChange} /></div>
                <div className="form-group"><label>State</label><input type="text" name="state" className="form-control" value={profile.state} onChange={handleChange} /></div>
                <div className="form-group"><label>Country</label><input type="text" name="country" className="form-control" value={profile.country} onChange={handleChange} /></div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingBottom: "32px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditMode(false)} disabled={isPending}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      ) : (
        <>
          <div className="card" style={{ marginBottom: "16px" }}>
            <div className="card-header"><h2>Personal Information</h2></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Phone</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.phone}</div></div>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Personal Email</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.personal_email}</div></div>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Date of Birth</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.date_of_birth}</div></div>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Gender</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.gender}</div></div>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Blood Group</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.blood_group}</div></div>
                <div><div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "3px" }}>Emergency Contact</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{profile.emergency_contact_no}</div></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px" }}>
            <div className="card-header"><h2>Address</h2></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px" }}>CURRENT ADDRESS</div>
                  <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.6 }}>
                    {profile.address_line1}, {profile.city}, {profile.state}, {profile.country}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
