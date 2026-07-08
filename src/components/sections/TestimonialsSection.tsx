import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getPublishedTestimonials } from "@/lib/testimonials";
import styles from "./TestimonialsSection.module.css";

const CARD_STAGGER_MS = 140;

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

        <ul className={styles.grid}>
          {testimonials.map((testimonial, index) => (
            <RevealOnScroll
              key={testimonial.id}
              as="li"
              fromLeft
              delay={index * CARD_STAGGER_MS}
              className={styles.cardReveal}
            >
              <article className={styles.card}>
                <Image
                  src={testimonial.bgImageUrl}
                  alt={testimonial.bgImageAlt || ""}
                  fill
                  className={styles.cardBg}
                  sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
                  aria-hidden={testimonial.bgImageAlt ? undefined : true}
                />
                <div className={styles.cardOverlay} aria-hidden="true" />

                <div className={styles.cardContent}>
                  <blockquote className={styles.quote}>
                    <p>{testimonial.quote}</p>
                    {testimonial.author || testimonial.company ? (
                      <footer className={styles.attribution}>
                        {testimonial.author ? (
                          <cite className={styles.author}>{testimonial.author}</cite>
                        ) : null}
                        {testimonial.company ? (
                          <span className={styles.company}>{testimonial.company}</span>
                        ) : null}
                      </footer>
                    ) : null}
                  </blockquote>

                  <div className={styles.logoWrap}>
                    <Image
                      src={testimonial.logoUrl}
                      alt={testimonial.logoAlt || testimonial.company || "Client logo"}
                      width={160}
                      height={64}
                      className={styles.logo}
                      sizes="(max-width: 768px) 120px, 160px"
                    />
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </ul>
      </div>
    </section>
  );
}
