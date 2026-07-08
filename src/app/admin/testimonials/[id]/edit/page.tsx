import { notFound } from "next/navigation";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { getTestimonialById } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Edit testimonial</h1>
      </div>
      <TestimonialForm
        mode="edit"
        initial={{
          id: testimonial.id,
          quote: testimonial.quote,
          author: testimonial.author,
          company: testimonial.company ?? "",
          logoUrl: testimonial.logoUrl,
          logoAlt: testimonial.logoAlt,
          bgImageUrl: testimonial.bgImageUrl,
          bgImageAlt: testimonial.bgImageAlt,
          sortOrder: testimonial.sortOrder,
          published: testimonial.published,
        }}
      />
    </div>
  );
}
