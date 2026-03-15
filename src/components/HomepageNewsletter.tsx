import NewsletterSignup from "@/components/NewsletterSignup";

const HomepageNewsletter = () => {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="container max-w-[560px] text-center">
        <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal">
          The Navlan Report
        </h2>
        <p className="mt-4 font-body text-[16px] text-warm-gray leading-relaxed">
          A plain-English interpretation of the latest Israeli housing data — delivered monthly. Join English-speaking property buyers who want the real numbers, not broker opinions.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          <NewsletterSignup source="homepage" />
        </div>
      </div>
    </section>
  );
};

export default HomepageNewsletter;
