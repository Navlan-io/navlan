import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import heroImage from "@/assets/hero-landscape.png";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ExploreCities from "@/components/ExploreCities";
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
  const { currency, rates } = useCurrency();
  const [avgPriceNis, setAvgPriceNis] = useState<number | null>(null);
  const [priceYoy, setPriceYoy] = useState<number | null>(null);
  const [mortgageRate, setMortgageRate] = useState<number | null>(null);
  const [avgRentNis, setAvgRentNis] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [priceRes, indexRes, mortgageRes, rentalRes] = await Promise.all([
        supabase
          .from("city_prices")
          .select("avg_price_total, period")
          .eq("city_name", "Total")
          .not("avg_price_total", "is", null)
          .order("period", { ascending: false })
          .limit(1),
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
          .eq("series_key", "BNK_99034_LR_BIR_MRTG_467")
          .order("period", { ascending: false })
          .limit(1),
        supabase
          .from("city_rentals")
          .select("avg_rent_total")
          .eq("city_name", "Total")
          .not("avg_rent_total", "is", null)
          .order("period", { ascending: false })
          .limit(1),
      ]);

      if (priceRes.data?.[0]?.avg_price_total) {
        setAvgPriceNis(priceRes.data[0].avg_price_total);
      }

      if (indexRes.data?.[0]) setPriceYoy(indexRes.data[0].percent_yoy);
      if (mortgageRes.data?.[0]) setMortgageRate(mortgageRes.data[0].value);
      if (rentalRes.data?.[0]?.avg_rent_total) {
        setAvgRentNis(rentalRes.data[0].avg_rent_total);
      }
    };
    fetch().catch(console.error);
  }, []);

  // Format avg price respecting currency
  const formatAvgPrice = (): string => {
    // avg_price_total is in NIS thousands (e.g. 2350.9 = ₪2,350,900)
    const nisThousands = avgPriceNis ?? 2210;
    const nisFull = nisThousands * 1000;
    if (currency === "₪") {
      return `₪${(nisFull / 1_000_000).toFixed(2)}M`;
    }
    const rate = currency === "$" ? rates.USD : rates.EUR;
    if (!rate || rate <= 0) {
      return `₪${(nisFull / 1_000_000).toFixed(2)}M`;
    }
    const converted = nisFull / rate;
    if (converted < 1_000_000) {
      return `${currency}${Math.round(converted / 1000)}K`;
    }
    return `${currency}${(converted / 1_000_000).toFixed(2)}M`;
  };

  const formatAvgRent = (): string => {
    const nis = avgRentNis ?? 4800;
    if (currency === "₪") return `₪${nis.toLocaleString()}`;
    const rate = currency === "$" ? rates.USD : rates.EUR;
    if (!rate || rate <= 0) return `₪${nis.toLocaleString()}`;
    return `${currency}${Math.round(nis / rate).toLocaleString()}`;
  };

  const yoy = priceYoy ?? 0.4;
  const yoyPositive = yoy >= 0;
  const yoyColor = yoyPositive ? "text-growth-green" : "text-terra-red";
  const yoyArrow = yoyPositive ? "↑" : "↓";

  const stats: HeroStat[] = [
    {
      label: "Avg. Home Price",
      value: formatAvgPrice(),
      href: "/market#national-trend",
    },
    {
      label: "Prices",
      value: `${yoyArrow} ${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}% YoY`,
      href: "/market#district-comparison",
      colorClass: yoyColor,
    },
    {
      label: "Avg. Rent",
      value: `${formatAvgRent()}/mo`,
      href: "/market#rental-market",
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

          <Link
            to="/guides/start-here"
            className="mt-3 inline-block font-body text-[14px] text-white/80 no-underline hover:text-white hover:underline transition-colors animate-fade-up [animation-delay:300ms]"
          >
            Or start with our Buyer's Guide →
          </Link>

          {/* Live stat pills */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-xl animate-fade-up [animation-delay:400ms]">
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

      <ExploreCities />
      <MarketSnapshot />
      <HomepageAdvisorTeaser />
      <HomepageNewsletter />
      <NewToIsrael />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
