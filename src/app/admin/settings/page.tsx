export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      <p style={{ maxWidth: 520, lineHeight: 1.6 }}>
        Sign in at <code>/admin</code> with the studio password. Use Forgot
        password to receive an email code and create or replace it. The password
        is stored as a hash; it cannot be viewed here.
      </p>
    </div>
  );
}
