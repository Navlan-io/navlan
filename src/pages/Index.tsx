import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import heroImage from "@/assets/hero-landscape.png";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import MarketSnapshot from "@/components/MarketSnapshot";
import HomepageNewsletter from "@/components/HomepageNewsletter";
import NewToIsrael from "@/components/NewToIsrael";
import HomepageAdvisorTeaser from "@/components/HomepageAdvisorTeaser";
import SEO from "@/components/SEO";

const Index = () => {
  const [priceYoy, setPriceYoy] = useState<number | null>(null);
  const [mortgageRate, setMortgageRate] = useState<number | null>(null);
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const { currency, rates } = useCurrency();

  useEffect(() => {
    const fetch = async () => {
      const [indexRes, mortgageRes, avgPriceRes] = await Promise.all([
        supabase
          .from("price_indices")
          .select("percent_yoy")
          .eq("index_code", 40010)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
        supabase
          .from("mortgage_rates")
          .select("value")
          .eq("track_type", "non_indexed_fixed")
          .order("period", { ascending: false })
          .limit(1),
        supabase
          .from("city_prices")
          .select("avg_price_total")
          .eq("city_name", "Total")
          .order("period", { ascending: false })
          .limit(1),
      ]);

      if (indexRes.data?.[0]) {
        setPriceYoy(indexRes.data[0].percent_yoy);
      }
      if (mortgageRes.data?.[0]) {
        setMortgageRate(mortgageRes.data[0].value);
      }
      if (avgPriceRes.data?.[0]) {
        setAvgPrice(avgPriceRes.data[0].avg_price_total);
      }
    };
    fetch().catch(console.error);
  }, []);

  const yoy = priceYoy ?? 0;
  const yoyColor = yoy >= 0 ? "text-growth-green" : "text-terra-red";

  // avg_price_total is in thousands of NIS (e.g. 2362.9 = ₪2,362,900)
  const formatAvgPrice = (nisThousands: number): string => {
    if (currency === "₪") {
      return `₪${(nisThousands / 1_000).toFixed(2)}M`;
    }
    const rate = currency === "$" ? rates.USD : rates.EUR;
    const converted = nisThousands / rate / 1_000;
    return `${currency}${converted.toFixed(2)}M`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title="Israeli Real Estate Data in English — Prices, City Guides & Market Trends | Navlan.io"
        description="Navigate Israeli real estate in English. Market data, city-by-city price guides, mortgage rates, and community resources for English-speaking buyers."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Navlan",
            url: "https://navlan.io",
            logo: "https://navlan.io/favicon.ico",
            sameAs: ["https://twitter.com/navlan"],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Navlan",
            url: "https://navlan.io",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://navlan.io/city/{search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
      <NavBar />

      <main id="main-content">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Israeli hillside landscape at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/40" />

        <div className="relative z-10 container py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="text-white text-[34px] md:text-[48px] tracking-[-0.02em] font-heading font-bold leading-tight max-w-2xl drop-shadow-sm animate-fade-up">
            Navigate Israeli Real&nbsp;Estate. In&nbsp;English.
          </h1>
          <p className="mt-4 text-white/90 font-body text-[16px] md:text-[19px] max-w-lg drop-shadow-sm animate-fade-up [animation-delay:100ms]">
            Market data, city guides, and community resources for English
            speakers
          </p>

          <div className="mt-8 w-full max-w-xl px-0 animate-fade-up [animation-delay:200ms]">
            <SearchBar />
          </div>

          {/* Data ribbon */}
          <div className="mt-8 inline-flex flex-nowrap whitespace-nowrap md:flex-wrap md:whitespace-normal justify-center items-center gap-x-1.5 md:gap-x-3 max-w-xl px-4 md:px-5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-[8px] animate-fade-up [animation-delay:300ms] leading-[1.6]">
            <Link to="/market" className="inline-flex items-center gap-1 md:gap-1.5 no-underline">
              <span className="font-body text-[10px] md:text-[12px] text-white/55"><span className="md:hidden">Avg</span><span className="hidden md:inline">Avg Price</span></span>
              <span className="font-body text-[11px] md:text-[13px] font-medium text-white">
                {avgPrice ? formatAvgPrice(avgPrice) : "—"}
              </span>
            </Link>
            <span className="text-white/30 text-[11px] md:text-[12px] select-none">·</span>
            <Link to="/market#national-trend" className="inline-flex items-center gap-1 md:gap-1.5 no-underline">
              <span className="font-body text-[10px] md:text-[12px] text-white/55">Prices</span>
              <span className={`font-body text-[11px] md:text-[13px] font-medium ${yoyColor}`}>
                {yoy >= 0 ? "↑" : "↓"} {Math.abs(yoy).toFixed(1)}%<span className="hidden md:inline"> YoY</span>
              </span>
            </Link>
            <span className="text-white/30 text-[11px] md:text-[12px] select-none">·</span>
            <Link to="/market#mortgage-rates" className="inline-flex items-center gap-1 md:gap-1.5 no-underline">
              <span className="font-body text-[10px] md:text-[12px] text-white/55"><span className="md:hidden">Mortgage</span><span className="hidden md:inline">Mortgage Rate</span></span>
              <span className="font-body text-[11px] md:text-[13px] font-medium text-white">
                {(mortgageRate ?? 5.5).toFixed(2)}%
              </span>
            </Link>
          </div>
        </div>
      </section>

      <HomepageAdvisorTeaser />
      {/* Gold section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/40 to-transparent" />
      <MarketSnapshot />
      {/* Gold section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/40 to-transparent" />
      <HomepageNewsletter />
      {/* Gold section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/40 to-transparent" />
      <NewToIsrael />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
