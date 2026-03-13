import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import NationalPriceTrend from "@/components/market/NationalPriceTrend";
import DistrictComparison from "@/components/market/DistrictComparison";
import ConstructionPipeline from "@/components/market/ConstructionPipeline";
import MortgageRates from "@/components/market/MortgageRates";
import ConstructionCosts from "@/components/market/ConstructionCosts";
import RentalMarket from "@/components/market/RentalMarket";

const MarketDataPage = () => {
  useEffect(() => {
    document.title = "Market Data — Israel Housing Market | Navlan.io";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[1200px] py-10">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">
            Israel Housing Market
          </h1>
          <p className="mt-2 font-body text-[15px] text-warm-gray">
            National market data from the Central Bureau of Statistics and Bank of Israel
          </p>
          <div className="border-b border-grid-line mt-6 mb-10" />

          <div className="space-y-12">
            <NationalPriceTrend />
            <DistrictComparison />
            <ConstructionPipeline />
            <MortgageRates />
            <RentalMarket />
            <ConstructionCosts />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketDataPage;
