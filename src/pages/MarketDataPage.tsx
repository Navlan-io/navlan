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
      <main className="flex-1">
        <div className="container max-w-[1200px] py-12">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">
            Israel Housing Market
          </h1>
          <p className="mt-2 font-body text-[15px] text-warm-gray">
            National market data from the Central Bureau of Statistics and Bank of Israel
          </p>
          {dataAsOf && (
            <p className="mt-2 font-body text-[13px] text-stone-gray">
              Data as of: {dataAsOf}
            </p>
          )}
          <p className="mt-1 font-body text-[12px] text-warm-gray/70">Data updates monthly from CBS</p>
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Israel housing market data on Navlan — ${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sage/30 text-sage font-body text-[14px] font-medium hover:bg-sage/5 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <div className="border-b border-grid-line mt-6 mb-10" />

          <div>
            <div id="national-trend" className="scroll-mt-24"><NationalPriceTrend /></div>
            <div id="district-comparison" className="scroll-mt-24 mt-16"><DistrictComparison /></div>
            <div id="construction-pipeline" className="scroll-mt-24 mt-16"><ConstructionPipeline /></div>
            <InlineNewsletterCTA source="market" />
            <div id="mortgage-rates" className="scroll-mt-24 mt-12"><MortgageRates /></div>
            <div id="rental-market" className="scroll-mt-24 mt-16"><RentalMarket /></div>
            <div id="construction-costs" className="scroll-mt-24 mt-16"><ConstructionCosts /></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketDataPage;
