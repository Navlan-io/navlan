import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import IsraelCityMap from "@/components/cities/IsraelCityMap";
import FeaturedCityCard from "@/components/cities/FeaturedCityCard";
import CompactCityCard from "@/components/cities/CompactCityCard";
import CategoryFilter, { matchesCategory } from "@/components/cities/CategoryFilter";

interface CityData {
  name: string;
  slug: string;
  district: string;
  tagline: string | null;
  tier: string | null;
  tags: string[] | null;
  avgPrice: number | null;
  lat: number | null;
  lng: number | null;
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

const FEATURED_SLUGS = [
  "jerusalem",
  "tel-aviv",
  "raanana",
  "modiin-maccabim-reut",
  "beit-shemesh",
  "netanya",
  "herzliya",
  "efrat",
];

// Approximate lat/lng for cities on the map
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "nahariya": { lat: 33.01, lng: 35.09 },
  "akko": { lat: 32.93, lng: 35.08 },
  "haifa": { lat: 32.79, lng: 34.99 },
  "zichron-yaakov": { lat: 32.57, lng: 34.95 },
  "hadera": { lat: 32.44, lng: 34.92 },
  "netanya": { lat: 32.33, lng: 34.86 },
  "herzliya": { lat: 32.16, lng: 34.79 },
  "tel-aviv": { lat: 32.07, lng: 34.77 },
  "ramat-gan": { lat: 32.08, lng: 34.81 },
  "givat-shmuel": { lat: 32.08, lng: 34.84 },
  "bat-yam": { lat: 32.02, lng: 34.75 },
  "rishon-lezion": { lat: 31.96, lng: 34.80 },
  "rehovot": { lat: 31.89, lng: 34.81 },
  "ashdod": { lat: 31.80, lng: 34.65 },
  "ashkelon": { lat: 31.67, lng: 34.57 },
  "beer-sheva": { lat: 31.25, lng: 34.79 },
  "jerusalem": { lat: 31.77, lng: 35.22 },
  "beit-shemesh": { lat: 31.75, lng: 34.99 },
  "ramat-beit-shemesh": { lat: 31.73, lng: 34.98 },
  "modiin-maccabim-reut": { lat: 31.89, lng: 35.01 },
  "modiin": { lat: 31.89, lng: 35.01 },
  "raanana": { lat: 32.18, lng: 34.87 },
  "kfar-saba": { lat: 32.19, lng: 34.91 },
  "hod-hasharon": { lat: 32.15, lng: 34.89 },
  "petah-tikva": { lat: 32.09, lng: 34.88 },
  "efrat": { lat: 31.65, lng: 35.16 },
  "maale-adumim": { lat: 31.78, lng: 35.30 },
  "givat-zeev": { lat: 31.82, lng: 35.17 },
  "ariel": { lat: 32.11, lng: 35.17 },
  "afula": { lat: 32.61, lng: 35.29 },
  "tiberias": { lat: 32.79, lng: 35.53 },
  "tzfat": { lat: 32.96, lng: 35.50 },
  "karmiel": { lat: 32.91, lng: 35.30 },
  "alon-shvut": { lat: 31.66, lng: 35.13 },
  "neve-daniel": { lat: 31.68, lng: 35.14 },
  "hashmonaim": { lat: 31.90, lng: 35.03 },
  "beitar-illit": { lat: 31.70, lng: 35.12 },
  "modiin-illit": { lat: 31.93, lng: 35.04 },
  "bnei-brak": { lat: 32.09, lng: 34.83 },
  "caesarea": { lat: 32.50, lng: 34.90 },
  "givatayim": { lat: 32.07, lng: 34.81 },
  "holon": { lat: 32.02, lng: 34.78 },
  "lod": { lat: 31.95, lng: 34.90 },
  "ramla": { lat: 31.93, lng: 34.87 },
};

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const CitiesPage = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const [{ data: localities }, { data: pricesRaw }, { data: profiles }] =
          await Promise.all([
            supabase
              .from("localities")
              .select("english_name, cbs_code, district, is_anglo_city")
              .in("entity_type", ["city", "town", "yishuv"]),
            supabase
              .from("city_prices")
              .select("cbs_code, avg_price_total, period")
              .not("avg_price_total", "is", null)
              .order("period", { ascending: false }),
            supabase
              .from("city_profiles")
              .select("city_name, tagline, affordability_tier, tags"),
          ]);

        if (!localities) {
          setLoading(false);
          return;
        }

        // Latest price per cbs_code
        const latestPriceMap = new Map<number, number>();
        for (const row of pricesRaw ?? []) {
          if (row.cbs_code && row.avg_price_total && !latestPriceMap.has(row.cbs_code)) {
            latestPriceMap.set(row.cbs_code, row.avg_price_total);
          }
        }

        const profileMap = new Map(
          (profiles ?? []).map((p: any) => [
            p.city_name,
            { tagline: p.tagline, tier: p.affordability_tier, tags: p.tags },
          ])
        );

        const seenNames = new Set<string>();

        // Cities from localities (with price or profile)
        const fromLocalities: CityData[] = localities
          .map((loc) => {
            const profile = profileMap.get(loc.english_name);
            const hasPrice = loc.cbs_code != null && latestPriceMap.has(loc.cbs_code);
            const hasProfile = !!profile;
            if (!hasPrice && !hasProfile) return null;

            seenNames.add(loc.english_name);
            const slug = toSlug(loc.english_name);
            const coords = CITY_COORDS[slug] ?? null;

            return {
              name: loc.english_name,
              slug,
              district: loc.district,
              tagline: profile?.tagline ?? null,
              tier: profile?.tier ?? null,
              tags: profile?.tags ?? null,
              avgPrice: loc.cbs_code ? latestPriceMap.get(loc.cbs_code) ?? null : null,
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
            };
          })
          .filter(Boolean) as CityData[];

        // Build locality lookup for district info
        const localityMap = new Map(
          localities.map((l) => [l.english_name, l.district])
        );

        // Cities from profiles that weren't matched in first pass
        const fromProfiles: CityData[] = (profiles ?? [])
          .filter((p: any) => !seenNames.has(p.city_name))
          .map((p: any) => {
            const slug = toSlug(p.city_name);
            const coords = CITY_COORDS[slug] ?? null;
            return {
              name: p.city_name,
              slug,
              district: localityMap.get(p.city_name) ?? "",
              tagline: p.tagline ?? null,
              tier: p.affordability_tier ?? null,
              tags: p.tags ?? null,
              avgPrice: null,
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
            };
          });

        const cityList = [...fromLocalities, ...fromProfiles];
        cityList.sort((a, b) => a.name.localeCompare(b.name));
        setCities(cityList);
      } catch (error) {
        console.error("Failed to load city profiles:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Featured cities (Zone 1)
  const featuredCities = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => cities.find((c) => c.slug === slug)).filter(
        Boolean
      ) as CityData[],
    [cities]
  );

  // Map cities (only those with coordinates)
  const mapCities = useMemo(
    () =>
      cities
        .filter((c) => c.lat !== null && c.lng !== null)
        .map((c) => ({
          name: c.name,
          slug: c.slug,
          lat: c.lat!,
          lng: c.lng!,
          tier: c.tier,
          price: c.avgPrice ? formatPrice(c.avgPrice) : null,
        })),
    [cities, formatPrice]
  );

  // Zone 3 filtered + sorted cities
  const filteredCities = useMemo(() => {
    let result = cities;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((c) =>
        matchesCategory(c.tags, c.tier, activeCategory)
      );
    }

    // District filter
    if (activeDistrict !== "All") {
      result = result.filter((c) => c.district === activeDistrict);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      );
    }

    return result;
  }, [cities, activeCategory, activeDistrict, searchQuery]);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io/" },
        { "@type": "ListItem", position: 2, name: "Cities", item: "https://navlan.io/cities" },
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
        description="Browse real estate data, prices, and community profiles for 60+ Israeli cities. Filter by district — Jerusalem, Tel Aviv, Central, Haifa, South, and North."
        structuredData={structuredData}
      />
      <NavBar />
      <main id="main-content" className="min-h-screen bg-warm-white">
        {/* ── Page Header ── */}
        <div className="container max-w-[1200px] pt-12 md:pt-16 pb-6">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33]">
            Cities
          </span>
          <h1 className="font-heading font-bold text-[32px] md:text-[40px] text-charcoal mt-2">
            Explore Cities
          </h1>
          <p className="mt-2 font-body text-[16px] text-warm-gray max-w-[640px]">
            Data-driven profiles for Israel's most popular Anglo communities.
          </p>
        </div>

        {/* ── Zone 1: Map + Featured Cities ── */}
        <div className="container max-w-[1200px] pb-10">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8">
            {/* Map (left side) */}
            <div className="lg:w-[60%] flex items-center justify-center overflow-hidden lg:max-h-[660px]">
              <div className="w-full max-w-[320px] lg:max-w-none mx-auto h-full">
                {loading ? (
                  <div className="bg-cream rounded-xl animate-pulse h-[350px] lg:h-[480px]" />
                ) : (
                  <IsraelCityMap
                    cities={mapCities}
                    featuredSlugs={FEATURED_SLUGS}
                    hoveredSlug={hoveredSlug}
                    onHoverCity={setHoveredSlug}
                    onDistrictClick={(district) => setActiveDistrict(district)}
                  />
                )}
              </div>
            </div>

            {/* Featured Cities (right side) */}
            <div className="lg:w-[40%]">
              <h2 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal mb-4">
                Featured Cities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-cream rounded-xl animate-pulse h-[120px]"
                      />
                    ))
                  : featuredCities.map((city) => (
                      <FeaturedCityCard
                        key={city.slug}
                        name={city.name}
                        slug={city.slug}
                        district={city.district}
                        tagline={city.tagline}
                        tier={city.tier}
                        isHovered={hoveredSlug === city.slug}
                        onHover={setHoveredSlug}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Gold divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* ── Zone 2: Find Your Fit ── */}
        <div className="container max-w-[1200px] pt-10 pb-4">
          <h2 className="font-heading font-semibold text-[22px] md:text-[24px] text-charcoal">
            Find Your Fit
          </h2>
          <p className="mt-1 font-body text-[15px] text-warm-gray">
            Browse cities by what matters most to you.
          </p>

          {/* Category pills */}
          <div className="mt-5">
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          </div>

          {/* District pills */}
          <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {DISTRICT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveDistrict(filter)}
                aria-pressed={activeDistrict === filter}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 min-h-[36px] font-body text-[13px] font-medium transition-colors shrink-0 ${
                  activeDistrict === filter
                    ? "bg-sage text-white"
                    : "bg-cream text-charcoal hover:bg-sage/15"
                }`}
              >
                {filter === "All" ? "All Districts" : filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-5 relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search cities"
              placeholder="Search cities…"
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-grid-line bg-cream font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage transition-colors"
            />
          </div>

          {/* City count */}
          <p className="mt-3 font-body text-[13px] text-warm-gray">
            {loading
              ? "Loading cities…"
              : `Showing ${filteredCities.length} of ${cities.length} cities`}
          </p>
        </div>

        {/* ── Zone 3: Compact City Grid ── */}
        <div className="container max-w-[1200px] pb-10">
          <div className="flex flex-wrap justify-center gap-4">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-cream rounded-xl animate-pulse h-[120px] w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.72rem)]"
                  />
                ))
              : filteredCities.map((city) => (
                  <CompactCityCard
                    key={city.slug}
                    name={city.name}
                    slug={city.slug}
                    district={city.district}
                    tagline={city.tagline}
                    tier={city.tier}
                  />
                ))}
          </div>

          {!loading && fetchError && cities.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block bg-cream rounded-xl px-8 py-6 border border-grid-line/60">
                <p className="font-body text-[15px] text-charcoal">
                  Unable to load city data. Please try refreshing the page.
                </p>
              </div>
            </div>
          )}

          {!loading && !fetchError && filteredCities.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-[15px] text-warm-gray">
                No cities match your search. Try a different term or filter.
              </p>
            </div>
          )}
        </div>

        {/* ── Gold divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

        {/* ── Advisor CTA ── */}
        <div className="container max-w-[1200px] py-12 text-center">
          <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-2">
            Not sure which city is right for you?
          </h2>
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
