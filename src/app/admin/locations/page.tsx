import Topbar from "@/components/Topbar";
import LocationsClientComponent from "@/components/LocationsClientComponent";

import { prisma } from "@/lib/prisma";

export default async function AdminLocationsPage() {
  const dbLocations = await prisma.attendance_locations.findMany({
    orderBy: { created_at: "desc" }
  });

  const dbUsers = await prisma.users.findMany({
    include: {
      user_locations: {
        include: {
          attendance_locations: true
        }
      }
    }
  });

  const locations = dbLocations.map((loc: any) => ({
    id: loc.id,
    name: loc.location_name,
    address: loc.address || "",
    latitude: loc.latitude || 0,
    longitude: loc.longitude || 0,
    radius_m: loc.radius_meters || 50,
    is_remote: loc.is_remote || false,
    is_active: loc.is_active !== false,
    assigned_users: 0 // Will count properly if we join user locations
  }));

  const users = dbUsers.map((u: any) => {
    // Reconstruct the assigned locations for the client component
    const assigned_locations = u.user_locations.map((ul: any) => {
      const l = ul.attendance_locations;
      return {
        id: l.id,
        name: l.location_name,
        address: l.address || "",
        latitude: l.latitude || 0,
        longitude: l.longitude || 0,
        radius_m: l.radius_meters || 50,
        is_remote: l.is_remote || false,
        is_active: l.is_active !== false,
        assigned_users: 0
      };
    });

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      assigned_locations
    };
  });

  return (
    <>
      <Topbar title="Attendance Locations" breadcrumb="Geofencing & Offices" user="Admin User" role="Admin" />
      <div className="page-body">
        <LocationsClientComponent initialLocations={locations} initialUsers={users} />
      </div>
    </>
  );
}
