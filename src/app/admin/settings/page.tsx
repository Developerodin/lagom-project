export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      <p style={{ maxWidth: 520, lineHeight: 1.6 }}>
        Admin access uses email one-time codes sent to the studio inbox. There is
        no saved password to manage here.
      </p>
    </div>
  );
}
