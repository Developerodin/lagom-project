import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getPublishedTestimonials } from "@/lib/testimonials";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import styles from "./TestimonialsSection.module.css";

export async function TestimonialsSection() {
  let testimonials: Awaited<ReturnType<typeof getPublishedTestimonials>> = [];
  try {
    testimonials = await getPublishedTestimonials();
  } catch {
    testimonials = [];
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="testimonials-section-title"
    >
      <div className="container">
        <RevealOnScroll as="div" className={styles.headingWrap}>
          <h2
            id="testimonials-section-title"
            className={`heading-section ${styles.heading}`}
          >
            WHAT OUR CLIENTS SAY
          </h2>
        </RevealOnScroll>

        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
