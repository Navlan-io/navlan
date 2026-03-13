import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CityData {
  name: string;
  slug: string;
  district: string;
  hasPrice: boolean;
  hasProfile: boolean;
  isAnglo: boolean;
  tagline: string | null;
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

const ExploreCities = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
            .select("city_name, tagline"),
        ]);

        if (!localities) {
          setLoading(false);
          return;
        }

        const cbsWithPrices = new Set((prices ?? []).map((p) => p.cbs_code));
        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.city_name, p.tagline])
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
              tagline: profileMap.get(loc.english_name) ?? null,
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
    if (activeFilter === "All") return cities;
    return cities.filter((c) => c.district === activeFilter);
  }, [cities, activeFilter]);

  const totalCount = cities.length;

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [filteredCities, checkScroll]);

  // Reset scroll on filter change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [activeFilter]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > a")?.offsetWidth ?? 280;
    const amount = (cardWidth + 16) * 2; // scroll 2 cards
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
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
        <div className="mt-6 flex flex-wrap gap-2 pb-2">
          {DISTRICT_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 min-h-[44px] font-body text-[14px] font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-sage text-white"
                  : "bg-cream text-charcoal hover:bg-sage/20"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Carousel wrapper */}
        <div className="relative mt-6">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-sage text-white shadow-md hover:bg-sage-dark transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-sage text-white shadow-md hover:bg-sage-dark transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="carousel-hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[83vw] md:w-[calc(28.57%-12px)] min-w-[280px] bg-cream rounded-xl animate-pulse h-[180px] snap-start"
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
                : filteredCities.map((city) => (
                    <Link
                      key={city.slug}
                      to={`/city/${city.slug}`}
                      className="group relative flex flex-col flex-shrink-0 w-[83vw] md:w-[calc(28.57%-12px)] min-w-[280px] rounded-xl bg-cream border-l-4 border-sage p-6 no-underline shadow-[0_2px_8px_rgba(45,50,52,0.06)] hover:shadow-[0_4px_16px_rgba(45,50,52,0.12)] transition-all duration-200 cursor-pointer overflow-hidden snap-start"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(124,139,110,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,139,110,0.07) 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                      }}
                    >
                      <h3 className="relative font-heading font-semibold text-[18px] text-charcoal leading-tight">
                        {city.name}
                      </h3>
                      <p className="relative mt-1 font-body text-[13px] text-warm-gray">
                        {city.district} District
                      </p>
                      <p className="relative mt-2 font-body text-[14px] text-warm-gray leading-snug">
                        {city.tagline || `${city.district} District`}
                      </p>
                      <span className="relative mt-auto pt-4 font-body font-medium text-[14px] text-horizon-blue group-hover:underline">
                        Explore →
                      </span>
                    </Link>
                  ))}
          </div>
        </div>

        {/* View all link */}
        {!loading && totalCount > 0 && (
          <div className="mt-6 text-center">
            <span className="font-body font-medium text-[15px] text-horizon-blue">
              View all {totalCount} cities with data →
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreCities;
