import { StationaryLaunchSignupList } from "@/components/admin/StationaryLaunchSignupList";
import { getStationaryLaunchSignups } from "@/lib/stationary-launch";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminStationaryLaunchSignupsPage() {
  const signups = await getStationaryLaunchSignups();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Stationery launch signups</h1>
      </div>

      <StationaryLaunchSignupList
        signups={signups.map((signup) => ({
          id: signup.id,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
          createdAt: formatDateTime(signup.createdAt),
        }))}
      />
    </div>
  );
}
