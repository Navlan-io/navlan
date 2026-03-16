import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-landscape.png";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import MarketSnapshot from "@/components/MarketSnapshot";
import HomepageNewsletter from "@/components/HomepageNewsletter";
import NewToIsrael from "@/components/NewToIsrael";
import HomepageAdvisorTeaser from "@/components/HomepageAdvisorTeaser";
import SEO from "@/components/SEO";

interface HeroStat {
  label: string;
  value: string;
  href: string;
  colorClass?: string;
}

const Index = () => {
  const [priceYoy, setPriceYoy] = useState<number | null>(null);
  const [priceMom, setPriceMom] = useState<number | null>(null);
  const [mortgageRate, setMortgageRate] = useState<number | null>(null);
  const [mortgageTrend, setMortgageTrend] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => {
    const fetch = async () => {
      const [indexRes, mortgageRes] = await Promise.all([
        supabase
          .from("price_indices")
          .select("percent_yoy, percent_mom")
          .eq("index_code", 40010)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
        supabase
          .from("mortgage_rates")
          .select("value")
          .eq("track_type", "non_indexed_fixed")
          .order("period", { ascending: false })
          .limit(2),
      ]);

      if (indexRes.data?.[0]) {
        setPriceYoy(indexRes.data[0].percent_yoy);
        setPriceMom(indexRes.data[0].percent_mom);
      }
      if (mortgageRes.data?.[0]) {
        setMortgageRate(mortgageRes.data[0].value);
        if (mortgageRes.data.length >= 2) {
          const current = mortgageRes.data[0].value;
          const previous = mortgageRes.data[1].value;
          if (current > previous) setMortgageTrend("up");
          else if (current < previous) setMortgageTrend("down");
          else setMortgageTrend("flat");
        }
      }
    };
    fetch().catch(console.error);
  }, []);

  const yoy = priceYoy ?? 0.4;
  const yoyPositive = yoy >= 0;
  const yoyColor = yoyPositive ? "text-growth-green" : "text-terra-red";
  const yoyArrow = yoyPositive ? "↑" : "↓";

  const mom = priceMom ?? 0.8;
  const momPositive = mom >= 0;
  const momColor = momPositive ? "text-growth-green" : "text-terra-red";
  const momArrow = momPositive ? "↑" : "↓";

  const stats: HeroStat[] = [
    {
      label: "Prices YoY",
      value: `${yoyArrow} ${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`,
      href: "/market#national-trend",
      colorClass: yoyColor,
    },
    {
      label: "Prices MoM",
      value: `${momArrow} ${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%`,
      href: "/market#national-trend",
      colorClass: momColor,
    },
    {
      label: "Fixed Rate",
      value: `${(mortgageRate ?? 5.5).toFixed(2)}%${mortgageTrend === "up" ? " ↑" : mortgageTrend === "down" ? " ↓" : ""}`,
      href: "/market#mortgage-rates",
      colorClass: mortgageTrend === "down" ? "text-growth-green" : mortgageTrend === "up" ? "text-terra-red" : "text-charcoal",
    },
  ];

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

          {/* Live stat pills */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-xl animate-fade-up [animation-delay:300ms]">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-3 min-h-[44px] shadow-card no-underline hover:shadow-[0_4px_16px_rgba(45,50,52,0.15)] transition-shadow duration-200 cursor-pointer"
              >
                <span className="font-body text-[14px] text-warm-gray">
                  {stat.label}:
                </span>
                <span className={`font-body text-[15px] font-semibold ${stat.colorClass ?? "text-charcoal"}`}>
                  {stat.value}
                </span>
              </Link>
            ))}
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
