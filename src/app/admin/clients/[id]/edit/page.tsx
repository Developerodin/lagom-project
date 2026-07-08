import { notFound } from "next/navigation";
import { ClientWorkForm } from "@/components/admin/ClientWorkForm";
import { getAllCategories } from "@/lib/categories";
import { getClientById } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, categories] = await Promise.all([
    getClientById(id),
    getAllCategories(),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Edit client</h1>
      </div>
      <ClientWorkForm
        mode="edit"
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        initial={{
          id: client.id,
          title: client.title,
          slug: client.slug,
          description: client.description,
          services: client.whatWeDid ?? client.services,
          cardImage: client.cardImage,
          cardAlt: client.cardAlt,
          heroImage: client.heroImage,
          heroAlt: client.heroAlt,
          sortOrder: client.sortOrder,
          published: client.published,
          categoryId: client.categoryId,
          gallery: client.gallery.map((image) => ({
            imageUrl: image.imageUrl,
            alt: image.alt,
            width: image.width,
            height: image.height,
          })),
        }}
      />
    </div>
  );
}
