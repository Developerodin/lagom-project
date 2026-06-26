import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>New category</h1>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
