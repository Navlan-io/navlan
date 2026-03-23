import NewsletterSignup from "@/components/NewsletterSignup";

interface InlineNewsletterCTAProps {
  source: "footer" | "about" | "homepage" | "guide" | "city" | "market";
}

const InlineNewsletterCTA = ({ source }: InlineNewsletterCTAProps) => {
  return (
    <div className="my-10 bg-cream rounded-xl border border-grid-line p-6 md:p-8 text-center">
      <p className="font-heading font-semibold text-[18px] md:text-[20px] text-charcoal mb-2">
        Getting useful insights? Get them monthly.
      </p>
      <p className="font-body text-[15px] text-warm-gray mb-5">
        Government housing data explained in plain English — free, no spam, unsubscribe anytime.
      </p>
      <div className="max-w-sm mx-auto">
        <NewsletterSignup source={source as any} />
      </div>
    </div>
  );
};

export default InlineNewsletterCTA;
