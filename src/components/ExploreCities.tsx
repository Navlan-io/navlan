import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CityData {
  name: string;
  slug: string;
  district: string;
  hasPrice: boolean;
  hasProfile: boolean;
  isAnglo: boolean;
  overview: string | null;
}

const DISTRICT_FILTERS = [
  "All",
  "Jerusalem",
  "Tel Aviv",
  "Central",
  "Haifa",
  "South",
  "North",
];

// Priority anglo cities in display order
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

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const cleanOverview = (text: string | null, cityName: string): string | null => {
  if (!text) return null;
  // Strip markdown formatting
  let clean = text.replace(/[#*_`>\[\]()]/g, "").trim();
  // Remove "CityName Overview" prefix pattern
  const headerPattern = new RegExp(`^${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+Overview\\s*`, "i");
  clean = clean.replace(headerPattern, "").trim();
  // Get first sentence
  const match = clean.match(/^(.+?[.!?])\s/);
  let sentence = match ? match[1] : clean.slice(0, 120);
  // If sentence starts with city name, trim it to remove redundancy
  const namePattern = new RegExp(`^${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(is|has|was|offers|sits|lies|stands)\\s+`, "i");
  const nameMatch = sentence.match(namePattern);
  if (nameMatch) {
    // Capitalize the verb and rest: "Ra'anana is a..." -> "A..."
    const afterName = sentence.slice(nameMatch[0].length);
    const verb = nameMatch[1].toLowerCase();
    if (verb === "is" && afterName) {
      sentence = afterName.charAt(0).toUpperCase() + afterName.slice(1);
    }
  }
  return sentence;
};

const ExploreCities = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const [{ data: localities }, { data: prices }, { data: profiles }] = await Promise.all([
          supabase
            .from("localities")
            .select("english_name, cbs_code, district, is_anglo_city")
            .eq("entity_type", "city"),
          supabase
            .from("city_prices")
            .select("cbs_code")
            .not("avg_price_total", "is", null),
          supabase
            .from("city_profiles")
            .select("city_name, overview"),
        ]);

        if (!localities) {
          setLoading(false);
          return;
        }

        const cbsWithPrices = new Set((prices ?? []).map((p) => p.cbs_code));
        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.city_name, p.overview])
        );

        const cityList: CityData[] = localities
          .map((loc) => {
            const hasPrice = loc.cbs_code != null && cbsWithPrices.has(loc.cbs_code);
            const hasProfile = profileMap.has(loc.english_name);
            if (!hasPrice && !hasProfile) return null;
            return {
              name: loc.english_name,
              slug: toSlug(loc.english_name),
              district: loc.district,
              hasPrice,
              hasProfile,
              isAnglo: loc.is_anglo_city === true,
              overview: profileMap.get(loc.english_name) ?? null,
            };
          })
          .filter(Boolean) as CityData[];

        // Sort: priority anglo cities first (in order), then other anglo cities, then rest alphabetically
        cityList.sort((a, b) => {
          const idxA = ANGLO_PRIORITY.indexOf(a.name);
          const idxB = ANGLO_PRIORITY.indexOf(b.name);
          // Both in priority list — use priority order
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          // One in priority list — it wins
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          // Both anglo but not in priority — alphabetical
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
    if (activeFilter === "All") {
      return showAll ? cities : cities.slice(0, 12);
    }
    return cities.filter((c) => c.district === activeFilter);
  }, [cities, activeFilter, showAll]);

  const totalCount = cities.length;
  const showViewAllLink = activeFilter === "All" && totalCount > 12;

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowAll(false);
  };

  return (
    <section id="explore-cities" className="py-16 bg-warm-white">
      <div className="container max-w-[1200px]">
        <h2 className="font-heading font-semibold text-[24px] text-charcoal">
          Explore Cities
        </h2>
        <p className="mt-1 font-body text-[15px] text-warm-gray">
          Data-driven profiles for Israel's most popular anglo communities
        </p>

        {/* District filter pills */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DISTRICT_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 font-body text-[14px] font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-sage text-white"
                  : "bg-cream text-charcoal hover:bg-sage/20"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[calc(50%-8px)] lg:w-[calc(25%-12px)] bg-cream rounded-xl animate-pulse h-[140px]"
                />
              ))
            : filteredCities.length === 0
              ? (
                <div className="w-full text-center py-8">
                  <p className="font-body text-[15px] text-warm-gray">
                    No city data available for this district yet.
                  </p>
                </div>
              )
              : filteredCities.map((city) => {
                const desc = cleanOverview(city.overview, city.name);
                return (
                  <Link
                    key={city.slug}
                    to={`/city/${city.slug}`}
                    className="group flex flex-col w-[calc(50%-8px)] lg:w-[calc(25%-12px)] rounded-xl bg-cream border-l-4 border-sage p-5 no-underline shadow-[0_2px_8px_rgba(45,50,52,0.06)] hover:shadow-[0_4px_16px_rgba(45,50,52,0.12)] transition-all duration-200 cursor-pointer"
                  >
                    <h3 className="font-heading font-semibold text-[18px] text-charcoal leading-tight">
                      {city.name}
                    </h3>
                    <p className="mt-1 font-body text-[13px] text-warm-gray">
                      {city.district} District
                    </p>
                    {desc && (
                      <p className="mt-2 font-body text-[14px] text-charcoal leading-snug line-clamp-2">
                        {desc}
                      </p>
                    )}
                    <span className="mt-auto pt-3 font-body font-medium text-[14px] text-horizon-blue group-hover:underline">
                      Explore →
                    </span>
                  </Link>
                );
              })}
        </div>

        {/* View all toggle */}
        {!loading && showViewAllLink && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="font-body font-medium text-[15px] text-horizon-blue hover:underline"
            >
              {showAll
                ? "Show top 12 ←"
                : `View all ${totalCount} cities with data →`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreCities;
