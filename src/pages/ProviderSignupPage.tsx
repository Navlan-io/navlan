import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ProviderSignupForm from "@/components/providers/ProviderSignupForm";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Award, MessageSquare, Building2 } from "lucide-react";

const ProviderSignupPage = () => {
  const [locationCount, setLocationCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("city_profiles")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => {
        if (count != null) setLocationCount(count);
      });
  }, []);

  const locationLabel =
    locationCount != null ? `${locationCount} locations` : "dozens of locations";

  return (
    <>
      <SEO
        title="Join the Navlan Provider Network | Navlan.io"
        description="Get listed as a verified service provider on Israel's independent English-language real estate platform. Free for qualified professionals."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Join the Navlan Provider Network",
            description:
              "Get listed as a verified service provider on Israel's independent English-language real estate platform.",
            publisher: {
              "@type": "Organization",
              name: "Navlan",
              url: "https://navlan.io",
            },
          },
        ]}
      />
      <NavBar />

      <main id="main-content" className="bg-warm-white">
        {/* ── Hero ── cream bg, left-aligned, dot pattern */}
        <section className="py-16 md:py-24 bg-[#F2EDE4] relative overflow-hidden">
          {/* Decorative dot pattern — top-right corner */}
          <div
            className="absolute top-0 right-0 w-[280px] h-[280px] opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(124,139,110,0.18) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
            }}
          />
          <div className="container max-w-3xl relative">
            <h1 className="font-heading font-bold text-[30px] md:text-[40px] text-charcoal leading-tight mb-4">
              Join the Navlan Provider Network
            </h1>
            <p className="font-heading text-[18px] md:text-[22px] text-warm-gray mb-0">
              Be the first name English speakers see when they're ready to move.
            </p>
            {/* Sand-gold divider */}
            <div className="w-16 h-[2px] bg-[#C4A96A] my-6" />
            <p className="font-body text-[16px] text-charcoal leading-relaxed max-w-2xl">
              Navlan is the only independent, English-language platform for
              Israeli real estate data. English speakers use it to research
              cities, understand the market, and plan their move. Our provider
              network connects them with the professionals who know this market
              best — and that starts with you.
            </p>
          </div>
        </section>

        {/* ── Social proof line ── */}
        <div className="py-5 md:py-6 bg-warm-white">
          <p className="container max-w-3xl text-center font-body text-[14px] text-warm-gray tracking-wide">
            Navlan covers {locationLabel} across Israel with real-time data
            from CBS and the Bank of Israel.
          </p>
        </div>

        {/* ── How It Works ── warm-white bg */}
        <section className="pt-6 md:pt-12 pb-12 md:pb-20">
          <div className="container max-w-4xl">
            <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <StepCard
                step="1"
                title="Apply below"
                description="Short form, takes about 5 minutes."
              />
              <StepCard
                step="2"
                title="Share your expertise"
                description="Answer a few questions about the markets you know. Your insights help keep Navlan accurate."
              />
              <StepCard
                step="3"
                title="Go live"
                description="Your profile becomes visible to English speakers researching your cities on Navlan."
              />
            </div>
          </div>
        </section>

        {/* ── What You Get ── cream bg, 2×2 card grid */}
        <section className="py-12 md:py-20 bg-[#F2EDE4]/50">
          <div className="container max-w-4xl">
            <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-8">
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <BenefitCard
                icon={Globe}
                title="City Page Visibility"
                description="Your profile on Navlan's provider directory, visible on relevant city pages"
              />
              <BenefitCard
                icon={Award}
                title="Verified Badge"
                description="Navlan Verified badge you can display on your website and marketing materials"
              />
              <BenefitCard
                icon={MessageSquare}
                title="AI Advisor Referrals"
                description="Referrals from the AI Advisor when users ask about your cities"
              />
              <BenefitCard
                icon={Building2}
                title="Independent Platform"
                description="Association with the only independent English-language Israeli real estate data platform"
              />
            </div>
          </div>
        </section>

        {/* ── What We Ask ── warm-white bg, gold left border */}
        <section className="py-12 md:py-16">
          <div className="container max-w-3xl">
            <div className="bg-white rounded-xl rounded-l-none shadow-card border-l-[3px] border-[#C4A96A] p-6 md:p-10">
              <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-6">
                What We Ask
              </h2>
              <ul className="space-y-3 font-body text-[16px] text-charcoal leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-sage rounded-full mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">Share your market knowledge</strong>{" "}
                    — a few quick questions in the form below help us keep Navlan accurate
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-sage rounded-full mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">Share Navlan with your audience</strong>{" "}
                    — your website, newsletter, social media, or client communications
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Gold divider ── transition to form */}
        <div className="container max-w-2xl">
          <div className="w-16 h-[2px] bg-[#C4A96A] mx-auto" />
        </div>

        {/* ── The Form ── cream bg */}
        <section className="pt-8 md:pt-12 pb-12 md:pb-20 bg-[#F2EDE4]/30">
          <div className="container max-w-2xl">
            <div className="bg-white rounded-xl shadow-card p-6 md:p-10">
              <h2 className="font-heading font-bold text-[24px] text-charcoal mb-2">
                Apply Now
              </h2>
              <p className="font-body text-[15px] text-warm-gray mb-8">
                Fields marked with <span className="text-terra-red">*</span> are
                required.
              </p>
              <ProviderSignupForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

// ── Sub-components ──

const StepCard = ({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl shadow-card p-6 text-center">
    <span className="inline-block font-heading font-bold text-[36px] text-sage leading-none mb-1">
      {step}
    </span>
    <span className="block font-body text-[12px] font-semibold text-sage/70 uppercase tracking-widest mb-3">
      Step
    </span>
    <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-2">
      {title}
    </h3>
    <p className="font-body text-[15px] text-warm-gray leading-relaxed">
      {description}
    </p>
  </div>
);

const BenefitCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl shadow-card p-6">
    <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-sage" />
    </div>
    <h3 className="font-heading font-semibold text-[17px] text-charcoal mb-1.5">
      {title}
    </h3>
    <p className="font-body text-[15px] text-warm-gray leading-relaxed">
      {description}
    </p>
  </div>
);

export default ProviderSignupPage;
