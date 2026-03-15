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
        <div className="container max-w-[1200px] py-10">
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
          <div className="border-b border-grid-line mt-6 mb-10" />

          <div className="space-y-12">
            <div id="national-trend" className="scroll-mt-24"><NationalPriceTrend /></div>
            <div id="district-comparison" className="scroll-mt-24"><DistrictComparison /></div>
            <div id="construction-pipeline" className="scroll-mt-24"><ConstructionPipeline /></div>
            <div id="mortgage-rates" className="scroll-mt-24"><MortgageRates /></div>
            <div id="rental-market" className="scroll-mt-24"><RentalMarket /></div>
            <div id="construction-costs" className="scroll-mt-24"><ConstructionCosts /></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketDataPage;
