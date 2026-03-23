import NewsletterSignup from "@/components/NewsletterSignup";

const HomepageNewsletter = () => {
  return (
    <section className="relative bg-sage py-[78px] md:py-[93px] overflow-hidden">
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 container max-w-[560px] text-center">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#C4A96A]">
          Newsletter
        </span>
        <h2 className="mt-1 font-heading font-bold text-[24px] md:text-[28px] text-white">
          Get CBS data explained in plain English — monthly
        </h2>
        <p className="mt-4 font-body text-[16px] text-white/80 leading-relaxed">
          Join English-speaking property buyers who want the real numbers, not broker opinions. Free, monthly, unsubscribe anytime.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          <NewsletterSignup source="homepage" variant="dark" />
        </div>
      </div>
    </section>
  );
};

export default HomepageNewsletter;
