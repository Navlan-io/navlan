import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PopulationDemand from "@/components/market/PopulationDemand";
import NationalPriceTrend from "@/components/market/NationalPriceTrend";
import DistrictPrices from "@/components/market/DistrictPrices";
import type { DistrictPricesData } from "@/components/market/DistrictPrices";
import DistrictComparison from "@/components/market/DistrictComparison";
import ConstructionPipeline from "@/components/market/ConstructionPipeline";
import type { ConstructionPipelineData } from "@/components/market/ConstructionPipeline";
import MortgageRates from "@/components/market/MortgageRates";
import type { MortgageRatesData } from "@/components/market/MortgageRates";
import ConstructionCosts from "@/components/market/ConstructionCosts";
import type { ConstructionCostsData } from "@/components/market/ConstructionCosts";
import RentalMarket from "@/components/market/RentalMarket";
import type { RentalMarketData } from "@/components/market/RentalMarket";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Share2 } from "lucide-react";

const fullBleed = {
  marginLeft: "calc(-50vw + 50%)",
  marginRight: "calc(-50vw + 50%)",
  paddingLeft: "calc(50vw - 50%)",
  paddingRight: "calc(50vw - 50%)",
};

const MarketDataPage = () => {
  const [dataAsOf, setDataAsOf] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  // Transition data state
  const [popGrowthRate, setPopGrowthRate] = useState<number | null>(null);
  const [popPeopleAdded, setPopPeopleAdded] = useState<number | null>(null);
  const [districtData, setDistrictData] = useState<DistrictPricesData | null>(null);
  const [constructionData, setConstructionData] = useState<ConstructionPipelineData | null>(null);
  const [mortgageData, setMortgageData] = useState<MortgageRatesData | null>(null);
  const [rentalData, setRentalData] = useState<RentalMarketData | null>(null);
  const [costData, setCostData] = useState<ConstructionCostsData | null>(null);

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

  // Stable callbacks for child components
  const onPopDataLoaded = useCallback((data: { growthRate: number | null; peopleAdded: number | null }) => {
    setPopGrowthRate(data.growthRate);
    setPopPeopleAdded(data.peopleAdded);
  }, []);
  const onDistrictDataLoaded = useCallback((data: DistrictPricesData) => {
    setDistrictData(data);
  }, []);
  const onConstructionDataLoaded = useCallback((data: ConstructionPipelineData) => {
    setConstructionData(data);
  }, []);
  const onMortgageDataLoaded = useCallback((data: MortgageRatesData) => {
    setMortgageData(data);
  }, []);
  const onRentalDataLoaded = useCallback((data: RentalMarketData) => {
    setRentalData(data);
  }, []);
  const onCostDataLoaded = useCallback((data: ConstructionCostsData) => {
    setCostData(data);
  }, []);

  // Build intro text strings from callback data
  const nationalPriceIntro = popGrowthRate != null
    ? `Israel added ${popGrowthRate.toFixed(1)}% to its population last year — roughly ${popPeopleAdded != null ? popPeopleAdded.toLocaleString("en-US") : "tens of thousands of"} people. Housing starts didn't keep pace.`
    : "Israel's population growth consistently outpaces housing supply — and that shows in the numbers.";

  const districtIntro = districtData?.nationalAvg != null && districtData.cheapestDistrict && districtData.mostExpensiveDistrict && districtData.ratio
    ? `The national average is ${formatPrice(districtData.nationalAvg)}. But Israel's districts range from ${districtData.cheapestDistrict} at ${formatPrice(districtData.cheapestPrice!)} to ${districtData.mostExpensiveDistrict} at ${formatPrice(districtData.mostExpensivePrice!)} — a ${districtData.ratio}× gap.`
    : "National averages mask dramatic regional variation. Prices differ wildly across Israel's six districts.";

  const constructionIntro = constructionData?.unsoldInventory != null && constructionData.monthsSupply != null
    ? `There are currently ${constructionData.unsoldInventory.toLocaleString("en-US")} unsold new units across Israel — roughly ${constructionData.monthsSupply.toFixed(1)} months of supply at current sales rates.`
    : "The supply side of the market — what's being built and what's sitting unsold — tells the next part of the story.";

  const mortgageIntro = mortgageData?.fixedRate != null
    ? `For most buyers, the monthly mortgage payment matters more than the listing price. The benchmark fixed rate is currently ${mortgageData.fixedRate.toFixed(2)}%.`
    : "For most buyers, the monthly mortgage payment matters more than the listing price.";

  const rentalIntro = rentalData?.rentYoy != null
    ? `Rents have risen ${Math.abs(rentalData.rentYoy).toFixed(1)}% over the past year based on lease renewals. For new leases, the actual increase is likely higher.`
    : "Rents are part of the affordability picture — and they've been climbing steadily.";

  const costIntro = costData?.costYoy != null
    ? `Construction input costs — materials, labor, equipment — have ${costData.costYoy >= 0 ? "risen" : "fallen"} ${Math.abs(costData.costYoy).toFixed(1)}% over the past year. This affects new build pricing, renovation budgets, and urban renewal economics.`
    : "Construction input costs — materials, labor, equipment — affect new build pricing, renovation budgets, and urban renewal economics.";

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
              CBS data runs 2–3 months behind publication
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

        {/* Section 0: Population & Housing Demand — no intro (first section) */}
        <div className="bg-warm-white" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="population-demand" className="scroll-mt-24">
              <PopulationDemand onDataLoaded={onPopDataLoaded} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 1: National Price Index */}
        <div className="bg-cream-dark" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="national-trend" className="scroll-mt-24">
              <NationalPriceTrend introText={nationalPriceIntro} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 2: Prices by District (Part A: actual prices + Part B: growth) */}
        <div className="bg-warm-white" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="district-prices" className="scroll-mt-24">
              <section>
                <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-2">Prices by District</h2>
                <p className="font-body text-[16px] font-normal text-[#6B7178] mt-2 mb-6">{districtIntro}</p>
                <DistrictPrices onDataLoaded={onDistrictDataLoaded} />
                <div className="border-t border-[#E8E4DE] my-10" />
                <div>
                  <DistrictComparison />
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 3: Construction Activity */}
        <div className="bg-cream-dark" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="construction-pipeline" className="scroll-mt-24">
              <ConstructionPipeline onDataLoaded={onConstructionDataLoaded} introText={constructionIntro} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 4: Mortgage Rates */}
        <div className="bg-warm-white" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="mortgage-rates" className="scroll-mt-24">
              <MortgageRates onDataLoaded={onMortgageDataLoaded} introText={mortgageIntro} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 5: Rental Market */}
        <div className="bg-cream-dark" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="rental-market" className="scroll-mt-24">
              <RentalMarket onDataLoaded={onRentalDataLoaded} introText={rentalIntro} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* Section 6: Construction Costs */}
        <div className="bg-warm-white" style={fullBleed}>
          <div className="max-w-[1200px] mx-auto py-[46px]">
            <div id="construction-costs" className="scroll-mt-24">
              <ConstructionCosts onDataLoaded={onCostDataLoaded} introText={costIntro} />
            </div>
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
