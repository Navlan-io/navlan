import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface CityData {
  name: string;
  slug: string;
  district: string;
  hasPrice: boolean;
  hasProfile: boolean;
  isAnglo: boolean;
  tagline: string | null;
  avgPrice: number | null;
}

const DISTRICT_FILTERS = [
  "All",
  "Jerusalem",
  "Tel Aviv",
  "Central",
  "Haifa",
  "South",
  "North",
  "Judea and Samaria",
];

const ANGLO_PRIORITY = [
  "Jerusalem",
  "Tel Aviv",
  "Ra'anana",
  "Beit Shemesh",
  "Modi'in",
  "Herzliya",
  "Haifa",
  "Netanya",
];

const DISTRICT_BORDER_COLORS: Record<string, string> = {
  Jerusalem: "border-l-sand-gold",
  "Tel Aviv": "border-l-horizon-blue",
  Haifa: "border-l-deep-olive",
  Central: "border-l-sage",
  South: "border-l-terra-red",
  North: "border-l-growth-green",
  "Judea and Samaria": "border-l-sand-gold",
};

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const CitiesPage = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const [{ data: localities }, { data: pricesRaw }, { data: profiles }] =
          await Promise.all([
            supabase
              .from("localities")
              .select("english_name, cbs_code, district, is_anglo_city")
              .in("entity_type", ["city", "town"]),
            supabase
              .from("city_prices")
              .select("cbs_code, avg_price_total, period")
              .not("avg_price_total", "is", null)
              .order("period", { ascending: false }),
            supabase.from("city_profiles").select("city_name, tagline"),
          ]);

        if (!localities) {
          setLoading(false);
          return;
        }

        // Build a map of cbs_code → latest avg_price
        const latestPriceMap = new Map<number, number>();
        for (const row of pricesRaw ?? []) {
          if (row.cbs_code && row.avg_price_total && !latestPriceMap.has(row.cbs_code)) {
            latestPriceMap.set(row.cbs_code, row.avg_price_total);
          }
        }

        const cbsWithPrices = new Set((pricesRaw ?? []).map((p) => p.cbs_code));
        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.city_name, p.tagline])
        );

        const cityList: CityData[] = localities
          .map((loc) => {
            const hasPrice =
              loc.cbs_code != null && cbsWithPrices.has(loc.cbs_code);
            const hasProfile = profileMap.has(loc.english_name);
            if (!hasPrice && !hasProfile) return null;
            return {
              name: loc.english_name,
              slug: toSlug(loc.english_name),
              district: loc.district,
              hasPrice,
              hasProfile,
              isAnglo: loc.is_anglo_city === true,
              tagline: profileMap.get(loc.english_name) ?? null,
              avgPrice: loc.cbs_code ? latestPriceMap.get(loc.cbs_code) ?? null : null,
            };
          })
          .filter(Boolean) as CityData[];

        cityList.sort((a, b) => {
          const idxA = ANGLO_PRIORITY.indexOf(a.name);
          const idxB = ANGLO_PRIORITY.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          if (a.isAnglo && !b.isAnglo) return -1;
          if (!a.isAnglo && b.isAnglo) return 1;
          return a.name.localeCompare(b.name);
        });

        setCities(cityList);
      } catch {
        // fallback handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const filteredCities = useMemo(() => {
    let result = cities;
    if (activeFilter !== "All") {
      result = result.filter((c) => c.district === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cities, activeFilter, searchQuery]);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://navlan.io/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cities",
          item: "https://navlan.io/cities",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Israeli Cities — Real Estate Data & Profiles",
      description:
        "Explore real estate data, price trends, and community profiles for cities across Israel. Filter by district and find the right city for you.",
      url: "https://navlan.io/cities",
    },
  ];

  return (
    <>
      <SEO
        title="Explore Cities in Israel — Prices & Community Profiles | Navlan"
        description="Browse real estate data, average prices, and community profiles for 60+ Israeli cities. Filter by district — Jerusalem, Tel Aviv, Central, Haifa, South, and North."
        structuredData={structuredData}
      />
      <NavBar />
      <main id="main-content" className="min-h-screen bg-warm-white">
        {/* Header */}
        <div className="container max-w-[1200px] pt-12 md:pt-16 pb-8">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
            Cities
          </span>
          <h1 className="font-heading font-bold text-[32px] md:text-[40px] text-charcoal mt-2">
            Explore Cities
          </h1>
          <p className="mt-2 font-body text-[16px] text-warm-gray max-w-[640px]">
            Data-driven profiles for Israel's most popular Anglo communities. Browse prices, community character, and local insights across six districts.
          </p>

          {/* Search bar */}
          <div className="relative mt-6 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities…"
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-grid-line bg-cream font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage transition-colors"
            />
          </div>

          {/* District filter pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {DISTRICT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 min-h-[36px] font-body text-[14px] font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-sage text-white"
                    : "bg-cream text-charcoal hover:bg-sage/15"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* City count */}
          <p className="mt-4 font-body text-[13px] text-warm-gray">
            {loading
              ? "Loading cities…"
              : `${filteredCities.length} ${filteredCities.length === 1 ? "city" : "cities"}`}
          </p>
        </div>

        {/* Gold divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* City cards grid */}
        <div className="container max-w-[1200px] py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-cream rounded-xl animate-pulse h-[160px]"
                  />
                ))
              : filteredCities.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/city/${city.slug}`}
                    className={`group relative flex flex-col rounded-xl bg-cream border-l-4 ${DISTRICT_BORDER_COLORS[city.district] || "border-l-sage"} p-5 no-underline shadow-[0_1px_6px_rgba(45,50,52,0.08)] hover:shadow-[0_6px_20px_rgba(45,50,52,0.13)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden`}
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(124,139,110,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,139,110,0.05) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-heading font-semibold text-[18px] text-charcoal leading-tight">
                          {city.name}
                        </h2>
                        <p className="mt-1 font-body text-[12px] text-warm-gray">
                          {city.district} District
                        </p>
                      </div>
                      {city.avgPrice && (
                        <span className="shrink-0 font-body text-[14px] font-semibold text-charcoal whitespace-nowrap">
                          {formatPrice(city.avgPrice)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-body text-[14px] text-warm-gray leading-snug line-clamp-2">
                      {city.tagline || `Explore real estate data for ${city.name}`}
                    </p>
                    <span className="mt-auto pt-3 font-body font-medium text-[14px] text-sage group-hover:text-sage-dark transition-colors">
                      Explore →
                    </span>
                  </Link>
                ))}
          </div>

          {!loading && filteredCities.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-[15px] text-warm-gray">
                No cities match your search. Try a different term or filter.
              </p>
            </div>
          )}
        </div>

        {/* Advisor CTA */}
        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />
        <div className="container max-w-[1200px] py-12 text-center">
          <p className="font-heading font-semibold text-[20px] text-charcoal mb-2">
            Not sure which city is right for you?
          </p>
          <p className="font-body text-[15px] text-warm-gray mb-5 max-w-md mx-auto">
            Tell us your priorities — budget, community, commute — and get personalized guidance.
          </p>
          <Link
            to="/advisor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage text-white font-body font-medium text-[15px] rounded-lg hover:bg-sage-dark transition-colors no-underline"
          >
            Ask the AI Advisor →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CitiesPage;
