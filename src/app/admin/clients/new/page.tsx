import { ClientWorkForm } from "@/components/admin/ClientWorkForm";
import { getAllCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Add client</h1>
      </div>
      <ClientWorkForm
        mode="create"
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
      />
    </div>
  );
}
