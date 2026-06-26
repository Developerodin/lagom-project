import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Edit category</h1>
      </div>
      <CategoryForm
        mode="edit"
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
