import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ProviderSignupForm from "@/components/providers/ProviderSignupForm";
import { ClipboardCheck, BookOpen, BadgeCheck, Globe, Award, MessageSquare, Building2 } from "lucide-react";

const ProviderSignupPage = () => {
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
        {/* ── Hero ── */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <h1 className="font-heading font-bold text-[30px] md:text-[40px] text-charcoal leading-tight mb-4">
              Join the Navlan Provider Network
            </h1>
            <p className="font-heading text-[18px] md:text-[22px] text-warm-gray mb-6">
              Be the first name English speakers see when they're ready to move.
            </p>
            <p className="font-body text-[16px] text-charcoal leading-relaxed max-w-2xl mx-auto">
              Navlan is the only independent, English-language platform for
              Israeli real estate data. English speakers use it to research
              cities, understand the market, and plan their move. Our provider
              network connects them with the professionals who know this market
              best — and that starts with you.
            </p>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-12 md:py-20">
          <div className="container max-w-4xl">
            <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <StepCard
                icon={ClipboardCheck}
                step="1"
                title="Apply below"
                description="Short form, takes about 5 minutes."
              />
              <StepCard
                icon={BookOpen}
                step="2"
                title="Share your expertise"
                description="Answer a few questions about the markets you know. Your insights help keep Navlan accurate."
              />
              <StepCard
                icon={BadgeCheck}
                step="3"
                title="Go live"
                description="Your profile becomes visible to English speakers researching your cities on Navlan."
              />
            </div>
          </div>
        </section>

        {/* ── What You Get ── */}
        <section className="py-12 md:py-20 bg-cream/50">
          <div className="container max-w-3xl">
            <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-8">
              What You Get
            </h2>
            <div className="space-y-4">
              <BenefitRow
                icon={Globe}
                text="Profile on Navlan's provider directory, visible on relevant city pages"
              />
              <BenefitRow
                icon={Award}
                text="Navlan Verified badge you can display on your website and marketing materials"
              />
              <BenefitRow
                icon={MessageSquare}
                text="Referrals from the AI Advisor when users ask about your cities"
              />
              <BenefitRow
                icon={Building2}
                text="Association with the only independent English-language Israeli real estate data platform"
              />
            </div>
          </div>
        </section>

        {/* ── What We Ask ── */}
        <section className="py-12 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal text-center mb-8">
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
        </section>

        {/* ── The Form ── */}
        <section className="py-12 md:py-20 bg-cream/30">
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
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl shadow-card p-6 text-center">
    <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="h-6 w-6 text-sage" />
    </div>
    <span className="inline-block font-body text-[13px] font-semibold text-sage uppercase tracking-wide mb-2">
      Step {step}
    </span>
    <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-2">
      {title}
    </h3>
    <p className="font-body text-[15px] text-warm-gray leading-relaxed">
      {description}
    </p>
  </div>
);

const BenefitRow = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm">
    <div className="w-10 h-10 bg-sage/10 rounded-full flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5 text-sage" />
    </div>
    <p className="font-body text-[15px] text-charcoal leading-relaxed pt-1.5">
      {text}
    </p>
  </div>
);

export default ProviderSignupPage;
