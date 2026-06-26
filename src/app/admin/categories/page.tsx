import Link from "next/link";
import { CategoryList } from "@/components/admin/CategoryList";
import { getAllCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Categories</h1>
        <Link href="/admin/categories/new" className="admin-btn">
          Add category
        </Link>
      </div>

      <CategoryList
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
          workCount: category._count.works,
        }))}
      />
    </div>
  );
}
