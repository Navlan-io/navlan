import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface LegalPageProps {
  title: string;
  metaTitle: string;
  metaDescription?: string;
  children: React.ReactNode;
}

const LegalPage = ({ title, metaTitle, metaDescription, children }: LegalPageProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title={metaTitle}
        description={metaDescription ?? `${title} — Navlan.io`}
      />
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[720px] pt-12 pb-16">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">{title}</h1>
          <div className="border-b border-grid-line mt-6 mb-10" />
          <div className="font-body text-[16px] text-charcoal leading-[1.75] space-y-4">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const DisclaimerPage = () => (
  <LegalPage title="Disclaimer" metaTitle="Disclaimer | Navlan.io">
    <p>
      Navlan.io provides publicly available market data and editorial content for informational purposes only. Nothing on this site constitutes financial, legal, or investment advice. Real estate transactions involve significant risk and complexity. Always consult qualified professionals — including a licensed attorney, mortgage advisor, and tax advisor — before making any property purchase decisions.
    </p>
    <p>
      Market data is sourced from the Israel Central Bureau of Statistics, Bank of Israel, and other government databases. Interactive tools and calculators provide estimates based on general formulas and average rates — they do not reflect the terms any specific lender will offer you. While we strive for accuracy, data may be delayed, revised, or incomplete. Navlan is not responsible for any decisions made based on the information provided on this site.
    </p>
    <p className="text-[13px] text-warm-gray">Last updated: March 2026</p>
    <p className="text-[13px] text-warm-gray">
      Questions? Contact{" "}
      <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">hello@navlan.io</a>
    </p>
  </LegalPage>
);

export const PrivacyPage = () => (
  <LegalPage title="Privacy Policy" metaTitle="Privacy Policy | Navlan.io">
    <p>
      Navlan.io respects your privacy. We collect minimal data: email addresses for newsletter subscribers (via Beehiiv) and anonymous usage analytics (via Google Analytics). We do not sell, share, or distribute your personal information to third parties. Newsletter subscribers can unsubscribe at any time.
    </p>
    <p>
      For questions about your data, contact{" "}
      <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">hello@navlan.io</a>.
    </p>
    <p className="text-[13px] text-warm-gray">Last updated: March 2026</p>
  </LegalPage>
);

export const TermsPage = () => (
  <LegalPage title="Terms of Use" metaTitle="Terms of Use | Navlan.io">
    <p>
      By using Navlan.io, you agree that all content is provided as-is for informational purposes. You may not scrape, republish, or redistribute Navlan's data, content, or design without written permission. External links are provided for convenience and do not imply endorsement. Navlan reserves the right to modify or discontinue any part of the site at any time.
    </p>
    <p>
      For the full legal disclaimer, see our{" "}
      <a href="/disclaimer" className="text-horizon-blue no-underline hover:underline">Disclaimer</a> page.
    </p>
    <p className="text-[13px] text-warm-gray">Last updated: March 2026</p>
  </LegalPage>
);
