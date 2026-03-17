import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import NationalPriceTrend from "@/components/market/NationalPriceTrend";
import DistrictComparison from "@/components/market/DistrictComparison";
import ConstructionPipeline from "@/components/market/ConstructionPipeline";
import MortgageRates from "@/components/market/MortgageRates";
import ConstructionCosts from "@/components/market/ConstructionCosts";
import RentalMarket from "@/components/market/RentalMarket";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import { Share2 } from "lucide-react";

const MarketDataPage = () => {
  const [dataAsOf, setDataAsOf] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("price_indices")
      .select("month, year")
      .eq("index_code", 40010)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const d = data[0] as { month: number; year: number };
          setDataAsOf(
            new Date(d.year, d.month - 1).toLocaleString("en-US", { month: "long", year: "numeric" })
          );
        }
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title="Israel Housing Market Data — Price Index, Mortgage Rates & Construction Trends | Navlan.io"
        description="Track Israel's housing market with national price indices, district comparisons, mortgage rates, construction pipeline data, and rental market trends — all in English."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io/" },
              { "@type": "ListItem", position: 2, name: "Market Data", item: "https://navlan.io/market" },
            ],
          },
        ]}
      />
      <NavBar />
      <main className="flex-1 overflow-x-hidden">
        {/* Header in container */}
        <div className="container max-w-[1200px] pt-12">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
            Market Data
          </span>
          <h1 className="font-heading font-bold text-[36px] md:text-[40px] text-charcoal mt-2">
            Israel Housing Market
          </h1>
          <p className="mt-2 font-body text-[16px] text-warm-gray">
            National market data from the Central Bureau of Statistics and Bank of Israel
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {dataAsOf && (
              <span className="bg-cream rounded-full px-3 py-1 font-body text-[12px] text-warm-gray">
                Data as of: {dataAsOf}
              </span>
            )}
            <span className="bg-cream rounded-full px-3 py-1 font-body text-[12px] text-warm-gray">
              Updates monthly from CBS
            </span>
            <button
              onClick={() => {
                const url = window.location.href;
                const text = `Israel housing market data on Navlan — ${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sage/30 text-sage font-body text-[14px] font-medium hover:bg-sage/5 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Gold divider after header */}
        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent mt-8" />

        {/* Section 1: NationalPriceTrend — odd (warm-white) */}
        <div className="bg-warm-white" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="max-w-[1200px] mx-auto py-12">
            <div id="national-trend" className="scroll-mt-24"><NationalPriceTrend /></div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 2: DistrictComparison — even (cream-dark) */}
        <div className="bg-cream-dark" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="max-w-[1200px] mx-auto py-12">
            <div id="district-comparison" className="scroll-mt-24"><DistrictComparison /></div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 3: ConstructionPipeline — needs container wrapper so its calc(-50vw + 50%) breakout math works */}
        <div className="container max-w-[1200px]">
          <div id="construction-pipeline" className="scroll-mt-24"><ConstructionPipeline /></div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 4: MortgageRates — even (cream-dark) */}
        <div className="bg-cream-dark" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="max-w-[1200px] mx-auto py-12">
            <div id="mortgage-rates" className="scroll-mt-24"><MortgageRates /></div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 5: RentalMarket — odd (warm-white) */}
        <div className="bg-warm-white" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="max-w-[1200px] mx-auto py-12">
            <div id="rental-market" className="scroll-mt-24"><RentalMarket /></div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 6: ConstructionCosts — even (cream-dark) */}
        <div className="bg-cream-dark" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="max-w-[1200px] mx-auto py-12">
            <div id="construction-costs" className="scroll-mt-24"><ConstructionCosts /></div>
          </div>
        </div>

        {/* Newsletter CTA — after last section */}
        <div className="container max-w-[1200px] pb-12">
          <InlineNewsletterCTA source="market" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketDataPage;
