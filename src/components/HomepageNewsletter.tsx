import NewsletterSignup from "@/components/NewsletterSignup";

const HomepageNewsletter = () => {
  return (
    <section className="bg-sage py-20 md:py-24">
      <div className="container max-w-[560px] text-center">
        <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-white">
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
