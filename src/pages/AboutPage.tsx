import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title="About Navlan — Independent Israeli Real Estate Data in English | Navlan.io"
        description="Navlan provides independent, transparent Israeli real estate data and resources for English-speaking buyers — no sales agenda, just data."
      />
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[720px] pt-12 pb-16">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">About Navlan</h1>
          <div className="border-b border-grid-line mt-6 mb-10" />

          <div className="space-y-10 font-body text-[16px] text-charcoal leading-[1.75]">
            {/* Why Navlan Exists */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Why Navlan Exists</h2>
              <p className="mb-4">
                If you've ever tried to understand the Israeli real estate market as an English speaker, you already know the problem.
              </p>
              <p className="mb-4">
                Government data is published in Hebrew, buried in PDFs and complex statistical databases. The dominant real estate platform, Madlan, is entirely in Hebrew. Brokers always say it's a good time to buy. And there's no independent, English-language resource where you can simply check the facts.
              </p>
              <p>Navlan exists to fix that.</p>
            </section>

            {/* What Navlan Is */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">What Navlan Is</h2>
              <p className="mb-4">
                Navlan is a free, independent data platform that translates Israeli government housing data into clear English. We pull from the Central Bureau of Statistics, the Bank of Israel, and other public sources to give you:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
                <li>Interactive price charts for Israel's most popular cities</li>
                <li>National market trends, construction data, and mortgage rates</li>
                <li>In-depth city profiles written for English speakers</li>
                <li>Guides to buying property, subsidized housing programs, and more</li>
              </ul>
              <p>
                We are not a brokerage. We are not affiliated with any real estate company. We don't earn commissions on transactions. Our only agenda is giving you the data you need to make your own informed decisions.
              </p>
            </section>

            {/* Our Data */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Our Data</h2>
              <p className="mb-4">
                All market data on Navlan comes from official Israeli government sources — primarily the Central Bureau of Statistics (CBS) and the Bank of Israel. We don't scrape listings or rely on broker estimates. Our data includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
                <li>Dwelling price data from CBS statistical publications</li>
                <li>National and district-level price indices updated monthly</li>
                <li>Mortgage rates published by the Bank of Israel</li>
                <li>Construction activity statistics (permits, starts, inventory)</li>
                <li>Rental market data from CBS surveys of actual lease contracts</li>
                <li>Exchange rates from the Bank of Israel</li>
              </ul>
              <p className="mb-4">
                Data is updated periodically as new government publications become available. Some figures may lag 1–3 months behind real-time due to CBS publication schedules. Provisional data points are clearly marked where applicable.
              </p>
              <p>
                For questions about our data or methodology, contact{" "}
                <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">hello@navlan.io</a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Who Navlan Is For</h2>
              <p className="mb-4">
                <span className="font-semibold">New olim</span> figuring out where to live and what they can afford. Start with our city guides and the{" "}
                <Link to="/guides/start-here" className="text-horizon-blue no-underline hover:underline">Start Here guide</Link>.
              </p>
              <p className="mb-4">
                <span className="font-semibold">Long-time Anglo residents</span> ready to buy or sell, who want to verify what their broker is telling them. Dive into the{" "}
                <Link to="/market" className="text-horizon-blue no-underline hover:underline">market data</Link>.
              </p>
              <p>
                <span className="font-semibold">Diaspora investors</span> exploring Israeli property from abroad, who need market context and city comparisons before making any decisions.
              </p>
            </section>

            {/* The Name */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">The Name</h2>
              <p>
                Navlan is a portmanteau of "navigate" and "nadlan" (נדל"ן — Hebrew for real estate). Navigate nadlan. That's what we're here to help you do.
              </p>
            </section>

            {/* Stay Updated */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Stay Updated</h2>
              <p className="mb-6">
                We publish The Navlan Report — a plain-English interpretation of the latest Israeli housing data. No broker spin, no speculation, just the numbers and what they mean.
              </p>
              <div className="max-w-md">
                <NewsletterSignup source="about" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <p className="font-body text-[14px] text-warm-gray">Social media coming soon.</p>
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 text-warm-gray/40"><Instagram className="h-5 w-5" /></span>
                  <span className="p-1.5 text-warm-gray/40"><Twitter className="h-5 w-5" /></span>
                  <span className="p-1.5 text-warm-gray/40"><Facebook className="h-5 w-5" /></span>
                </div>
              </div>
            </section>

            {/* Get in Touch */}
            <section>
              <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Get in Touch</h2>
              <p className="mb-4">Questions, feedback, or tips? We'd love to hear from you.</p>
              <p className="mb-4">
                Email:{" "}
                <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">hello@navlan.io</a>
              </p>
              <p>For press inquiries, partnership opportunities, or to report a data error, reach out anytime.</p>
            </section>

            {/* Footer note */}
            <div className="border-t border-grid-line pt-6">
              <p className="font-body text-[13px] text-warm-gray leading-relaxed">
                Navlan.io is an independent project. All market data is sourced from public government databases and is provided for informational purposes only. Navlan does not provide financial, legal, or investment advice. See our{" "}
                <Link to="/disclaimer" className="text-horizon-blue no-underline hover:underline">disclaimer</Link> for details.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
