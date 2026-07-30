import { ClientWorkForm } from "@/components/admin/ClientWorkForm";
import { getAllCategories } from "@/lib/categories";
import { getAllWorkServices } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const [categories, workServices] = await Promise.all([
    getAllCategories(),
    getAllWorkServices(),
  ]);

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
        workServices={workServices.map((service) => ({
          id: service.id,
          name: service.name,
        }))}
      />
    </div>
  );
}
