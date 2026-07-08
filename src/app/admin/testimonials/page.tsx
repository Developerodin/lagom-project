import Link from "next/link";
import { TestimonialList } from "@/components/admin/TestimonialList";
import { getAllTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Testimonials</h1>
        <Link href="/admin/testimonials/new" className="admin-btn">
          Add testimonial
        </Link>
      </div>

      <TestimonialList
        testimonials={testimonials.map((testimonial) => ({
          id: testimonial.id,
          quote: testimonial.quote,
          author: testimonial.author,
          company: testimonial.company,
          sortOrder: testimonial.sortOrder,
          published: testimonial.published,
        }))}
      />
    </div>
  );
}
