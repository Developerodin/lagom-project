import { TestimonialForm } from "@/components/admin/TestimonialForm";

export default function NewTestimonialPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>New testimonial</h1>
      </div>
      <TestimonialForm mode="create" />
    </div>
  );
}
