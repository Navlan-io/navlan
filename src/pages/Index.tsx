import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-landscape.png";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ExploreCities from "@/components/ExploreCities";
import MarketSnapshot from "@/components/MarketSnapshot";
import NewToIsrael from "@/components/NewToIsrael";

const FALLBACK_STATS = [
  { label: "Price Index", value: "181.6" },
  { label: "Prices", value: "+4.0% YoY", positive: true },
  { label: "Construction Costs", value: "+2.2% YoY", positive: true },
];

const Index = () => {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [priceRes, costRes] = await Promise.all([
          supabase
            .from("price_indices")
            .select("value, percent_yoy")
            .eq("index_code", 40010)
            .order("year", { ascending: false })
            .order("month", { ascending: false })
            .limit(1),
          supabase
            .from("construction_costs")
            .select("percent_yoy")
            .eq("index_code", 200010)
            .order("year", { ascending: false })
            .order("month", { ascending: false })
            .limit(1),
        ]);

        const pi = priceRes.data?.[0];
        const cc = costRes.data?.[0];

        if (pi || cc) {
          setStats([
            {
              label: "Price Index",
              value: pi ? pi.value?.toFixed(1) ?? "181.6" : "181.6",
            },
            {
              label: "Prices",
              value: pi
                ? `${(pi.percent_yoy ?? 0) >= 0 ? "+" : ""}${(pi.percent_yoy ?? 4.0).toFixed(1)}% YoY`
                : "+4.0% YoY",
              positive: (pi?.percent_yoy ?? 4.0) >= 0,
            },
            {
              label: "Construction Costs",
              value: cc
                ? `${(cc.percent_yoy ?? 0) >= 0 ? "+" : ""}${(cc.percent_yoy ?? 2.2).toFixed(1)}% YoY`
                : "+2.2% YoY",
              positive: (cc?.percent_yoy ?? 2.2) >= 0,
            },
          ]);
        }
      } catch {
        // keep fallback
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Israeli hillside landscape at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/40" />

        <div className="relative z-10 container py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="text-white text-[32px] md:text-[44px] font-heading font-bold leading-tight max-w-2xl drop-shadow-sm">
            Navigate Israeli Real Estate. In English.
          </h1>
          <p className="mt-4 text-white/90 font-body text-[17px] md:text-[19px] max-w-lg drop-shadow-sm">
            Market data, city guides, and community resources for English
            speakers
          </p>

          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>

          {/* Live stat pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-card"
              >
                <span className="font-body text-[13px] text-warm-gray">
                  {stat.label}:
                </span>
                <span className="font-body font-bold text-[14px] text-charcoal">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ExploreCities />
      <MarketSnapshot />
      <NewToIsrael />

      <Footer />
    </div>
  );
};

export default Index;
