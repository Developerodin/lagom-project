import Link from "next/link";
import { ClientWorkList } from "@/components/admin/ClientWorkList";
import { getAllClients } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getAllClients();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Work</h1>
        <Link href="/admin/clients/new" className="admin-btn">
          Add client
        </Link>
      </div>

      <ClientWorkList
        clients={clients.map((client) => ({
          id: client.id,
          title: client.title,
          slug: client.slug,
          sortOrder: client.sortOrder,
          published: client.published,
          categoryName: client.category?.name ?? null,
        }))}
      />
    </div>
  );
}
