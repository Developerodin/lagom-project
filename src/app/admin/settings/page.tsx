import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Change password</h2>
      <ChangePasswordForm />
    </div>
  );
}

