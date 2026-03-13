import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CityData {
  name: string;
  slug: string;
  price: number;
  district: string;
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

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const ExploreCities = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data: localities } = await supabase
          .from("localities")
          .select("english_name, cbs_code, district")
          .eq("entity_type", "city");

        const { data: prices } = await supabase
          .from("city_prices")
          .select("cbs_code, period, avg_price_total")
          .not("avg_price_total", "is", null)
          .order("period", { ascending: false });

        if (!localities || !prices) {
          setLoading(false);
          return;
        }

        const cityDataMap: CityData[] = localities
          .map((loc) => {
            const cityPrices = prices
              .filter((p) => p.cbs_code === loc.cbs_code && p.avg_price_total != null)
              .sort((a, b) => b.period.localeCompare(a.period));

            if (cityPrices.length === 0) return null;

            return {
              name: loc.english_name,
              slug: toSlug(loc.english_name),
              price: cityPrices[0].avg_price_total!,
              district: loc.district,
            };
          })
          .filter(Boolean) as CityData[];

        cityDataMap.sort((a, b) => b.price - a.price);
        setCities(cityDataMap);
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

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-sage/60 rounded-xl animate-pulse h-[100px]"
                />
              ))
            : filteredCities.length === 0
              ? (
                <div className="col-span-full text-center py-8">
                  <p className="font-body text-[15px] text-warm-gray">
                    No city data available for this district yet.
                  </p>
                </div>
              )
              : filteredCities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/city/${city.slug}`}
                  className="group relative rounded-xl p-7 bg-sage overflow-hidden no-underline hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,50,52,0.18)] hover:brightness-110 transition-all duration-200"
                >
                  {/* Geometric grid overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <div className="relative">
                    <h3 className="font-heading font-bold text-[22px] text-white leading-tight">
                      {city.name}
                    </h3>
                    <p className="mt-1.5 font-body text-[13px] text-white/70">
                      {city.district} District
                    </p>
                  </div>
                </Link>
              ))}
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
