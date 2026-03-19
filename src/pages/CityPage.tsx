import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import CityHero from "@/components/city/CityHero";
import TrendsTab from "@/components/city/TrendsTab";
import CityProfile from "@/components/city/CityProfile";
import SimilarCities from "@/components/city/SimilarCities";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

interface CityData {
  english_name: string;
  hebrew_name: string | null;
  cbs_code: number | null;
  district: string;
  population: number | null;
}

interface CityProfileData {
  overview: string | null;
  anglo_community: string | null;
  religious_infrastructure: string | null;
  education: string | null;
  lifestyle: string | null;
  real_estate_character: string | null;
  who_best_for: string | null;
  what_to_know: string | null;
  costs_of_living: string | null;
  transportation: string | null;
  tagline: string | null;
}

interface CityPriceRow {
  period: string;
  avg_price_total: number | null;
  avg_price_1_2_rooms: number | null;
  avg_price_3_rooms: number | null;
  avg_price_4_rooms: number | null;
  avg_price_5_rooms: number | null;
  avg_price_6_rooms: number | null;
  transactions_total: number | null;
}

const DISTRICT_INDEX_MAP: Record<string, number> = {
  Jerusalem: 60000,
  North: 60100,
  Haifa: 60200,
  Central: 60300,
  "Tel Aviv": 60400,
  South: 60500,
};

function slugToSearchName(slug: string): string {
  return slug.replace(/-/g, " ");
}

function formatLatestPeriod(period: string): string {
  const match = period.match(/(\d{4})[- ]?Q(\d)/i);
  if (match) {
    const qMap: Record<string, string> = { "1": "Q1", "2": "Q2", "3": "Q3", "4": "Q4" };
    return `${qMap[match[2]]} ${match[1]}`;
  }
  return period;
}

const GoldDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />
);

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [city, setCity] = useState<CityData | null>(null);
  const [profile, setProfile] = useState<CityProfileData | null>(null);
  const [prices, setPrices] = useState<CityPriceRow[]>([]);
  const [districtIndices, setDistrictIndices] = useState<any[]>([]);
  const [rentalData, setRentalData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const searchName = slugToSearchName(slug);

    const fetchCity = async () => {
      setLoading(true);

      const { data: localities } = await supabase
        .from("localities")
        .select("english_name, hebrew_name, cbs_code, district, population, english_alt_spellings")
        .eq("entity_type", "city");

      let matched: CityData | null = null;

      if (localities && localities.length > 0) {
        matched = localities.find((loc) => {
          const citySlug = loc.english_name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
          return citySlug === slug;
        }) ?? null;

        if (!matched) {
          matched = localities.find((loc) =>
            loc.english_name.toLowerCase() === searchName.toLowerCase()
          ) ?? null;
        }

        if (!matched) {
          matched = localities.find((loc) => {
            if (!loc.english_alt_spellings) return false;
            const alts = loc.english_alt_spellings.split("|").map((s: string) => s.trim().toLowerCase());
            return alts.some((alt: string) =>
              alt === searchName.toLowerCase() ||
              alt.replace(/'/g, "").replace(/\s+/g, "-") === slug
            );
          }) ?? null;
        }
      }

      if (!matched) {
        const { data: profileMatch } = await supabase
          .from("city_profiles")
          .select("city_name")
          .ilike("city_name", searchName)
          .limit(1);

        if (profileMatch && profileMatch.length > 0) {
          const profileName = profileMatch[0].city_name;
          const loc = localities?.find(
            (l) => l.english_name.toLowerCase() === profileName.toLowerCase()
          );
          matched = loc
            ? loc
            : { english_name: profileName, hebrew_name: null, cbs_code: null, district: "Unknown", population: null };
        }
      }

      if (!matched) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCity(matched);

      const [profileRes, pricesRes, rentalRes] = await Promise.all([
        supabase.from("city_profiles").select("*").eq("city_name", matched.english_name).limit(1),
        matched.cbs_code
          ? supabase.from("city_prices").select("*").eq("cbs_code", matched.cbs_code).order("period", { ascending: true })
          : Promise.resolve({ data: [] }),
        matched.cbs_code
          ? supabase.from("city_rentals").select("*").eq("cbs_code", matched.cbs_code).order("period", { ascending: false }).limit(1)
          : Promise.resolve({ data: [] }),
      ]);

      setProfile(profileRes.data?.[0] ?? null);
      setPrices((pricesRes.data as CityPriceRow[]) ?? []);
      setRentalData(rentalRes.data?.[0] ?? null);

      const indexCode = DISTRICT_INDEX_MAP[matched.district];
      if (indexCode) {
        const { data: indices } = await supabase
          .from("price_indices")
          .select("*")
          .eq("index_code", indexCode)
          .order("year", { ascending: true })
          .order("month", { ascending: true });
        setDistrictIndices(indices ?? []);
      }

      setLoading(false);
    };

    fetchCity();
  }, [slug]);

  const latestPeriod = (() => {
    if (prices.length === 0) return null;
    const nonAnnual = prices.filter(p => !p.period.includes("Annual"));
    if (nonAnnual.length === 0) return null;
    return formatLatestPeriod(nonAnnual[nonAnnual.length - 1].period);
  })();

  const hasProfile = profile && [
    "overview", "anglo_community", "religious_infrastructure", "education",
    "lifestyle", "real_estate_character", "who_best_for", "what_to_know",
  ].some((key) => (profile as any)[key]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-warm-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-bold text-[28px] text-charcoal">City not found</h1>
            <p className="mt-2 font-body text-warm-gray">
              Browse all cities on the{" "}
              <Link to="/cities" className="text-horizon-blue hover:underline">cities page</Link>.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      {city && (
        <SEO
          title={`${city.english_name} Real Estate Data — Prices, Rent & Community Guide | Navlan.io`}
          description={`Explore real estate data for ${city.english_name}, Israel — average home prices, price trends, rental data, and community information for English speakers.`}
          structuredData={[
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io/" },
                { "@type": "ListItem", position: 2, name: "Cities", item: "https://navlan.io/cities" },
                { "@type": "ListItem", position: 3, name: city.english_name, item: `https://navlan.io/city/${slug}` },
              ],
            },
          ]}
        />
      )}
      <NavBar />
      <main className="flex-1">
        {loading ? (
          <div className="container max-w-[1200px] py-10 space-y-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        ) : city ? (
          <>
            {/* ─── Hero ─── */}
            <CityHero
              city={city}
              profile={profile}
              prices={prices}
              districtIndices={districtIndices}
              population={city.population}
              latestPeriod={latestPeriod}
            />

            <GoldDivider />

            {/* ─── Community Profile Section ─── */}
            {hasProfile && (
              <>
                <div className="bg-cream-dark">
                  <div className="container max-w-[1200px] py-10 md:py-12">
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
                      Community
                    </span>
                    <h2 className="font-heading font-semibold text-[22px] md:text-[24px] text-charcoal mt-2 mb-6">
                      Life in {city.english_name}
                    </h2>
                    <CityProfile city={city} profile={profile} />
                  </div>
                </div>

                <GoldDivider />
              </>
            )}

            {/* ─── Market Data Section ─── */}
            <div className="bg-warm-white">
              <div className="container max-w-[1200px] py-10 md:py-12">
                <TrendsTab
                  city={city}
                  prices={prices}
                  districtIndices={districtIndices}
                  rentalData={rentalData !== undefined ? rentalData : undefined}
                />
              </div>
            </div>

            {/* ─── Disclaimer ─── */}
            <div className="bg-warm-white">
              <div className="container max-w-[1200px] py-6">
                <p className="font-body text-[12px] text-warm-gray leading-relaxed">
                  Data sourced from the Israel Central Bureau of Statistics and Bank of Israel. CBS dwelling price data runs 2–3 months behind publication. All figures are averages and may not reflect specific property types or neighbourhoods. Community profiles are editorial. This information is for reference only and does not constitute financial advice.
                </p>
              </div>
            </div>

            {/* ─── Newsletter CTA ─── */}
            <div className="bg-sage relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #FAF8F5 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative container max-w-[560px] text-center py-14">
                <p className="font-heading font-semibold text-[20px] text-white mb-2">
                  Getting useful insights? Get them monthly.
                </p>
                <p className="font-body text-[15px] text-white/75 mb-6">
                  CBS data explained in plain English — free, no spam.
                </p>
                <div className="max-w-sm mx-auto">
                  <NewsletterSignup source="city" variant="dark" />
                </div>
              </div>
            </div>

            {/* ─── Similar Cities ─── */}
            <SimilarCities currentCity={city.english_name} district={city.district} />
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default CityPage;
