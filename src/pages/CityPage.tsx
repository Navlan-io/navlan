import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import CityHero from "@/components/city/CityHero";
import CityTabs from "@/components/city/CityTabs";
import SimilarCities from "@/components/city/SimilarCities";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

interface CityData {
  english_name: string;
  hebrew_name: string | null;
  cbs_code: number | null;
  district: string;
}

interface CityProfile {
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

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [city, setCity] = useState<CityData | null>(null);
  const [profile, setProfile] = useState<CityProfile | null>(null);
  const [prices, setPrices] = useState<CityPriceRow[]>([]);
  const [districtIndices, setDistrictIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const searchName = slugToSearchName(slug);

    const fetchCity = async () => {
      setLoading(true);

      // Fetch all cities (no anglo filter) to match slug flexibly
      const { data: localities } = await supabase
        .from("localities")
        .select("english_name, hebrew_name, cbs_code, district, english_alt_spellings")
        .eq("entity_type", "city");

      let matched: CityData | null = null;

      if (localities && localities.length > 0) {
        // 1. Match slug against english_name (slug-ified)
        matched = localities.find((loc) => {
          const citySlug = loc.english_name
            .toLowerCase()
            .replace(/'/g, "")
            .replace(/\s+/g, "-");
          return citySlug === slug;
        }) ?? null;

        // 2. Match slug against english_name with ILIKE-style comparison
        if (!matched) {
          matched = localities.find((loc) =>
            loc.english_name.toLowerCase() === searchName.toLowerCase()
          ) ?? null;
        }

        // 3. Match against english_alt_spellings (pipe-separated)
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

      // 4. Fallback: try matching against city_profiles.city_name
      if (!matched) {
        const { data: profileMatch } = await supabase
          .from("city_profiles")
          .select("city_name")
          .ilike("city_name", searchName)
          .limit(1);

        if (profileMatch && profileMatch.length > 0) {
          const profileName = profileMatch[0].city_name;
          // Try to find the locality again by profile name
          const loc = localities?.find(
            (l) => l.english_name.toLowerCase() === profileName.toLowerCase()
          );
          if (loc) {
            matched = loc;
          } else {
            // Create a minimal city data from profile name
            matched = {
              english_name: profileName,
              hebrew_name: null,
              cbs_code: null,
              district: "Unknown",
            };
          }
        }
      }

      if (!matched) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCity(matched);

      // Fetch profile, prices, and district indices in parallel
      const [profileRes, pricesRes] = await Promise.all([
        supabase
          .from("city_profiles")
          .select("*")
          .eq("city_name", matched.english_name)
          .limit(1),
        matched.cbs_code
          ? supabase
              .from("city_prices")
              .select("*")
              .eq("cbs_code", matched.cbs_code)
              .order("period", { ascending: true })
          : Promise.resolve({ data: [] }),
      ]);

      setProfile(profileRes.data?.[0] ?? null);
      setPrices((pricesRes.data as CityPriceRow[]) ?? []);

      // Fetch district indices
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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-warm-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-bold text-[28px] text-charcoal">City not found</h1>
            <p className="mt-2 font-body text-warm-gray">
              Browse all cities on the{" "}
              <Link to="/cities" className="text-horizon-blue hover:underline">
                cities page
              </Link>
              .
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
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        ) : city ? (
          <>
            <CityHero city={city} profile={profile} prices={prices} districtIndices={districtIndices} />
            <CityTabs
              city={city}
              profile={profile}
              prices={prices}
              districtIndices={districtIndices}
            />
          </>
        ) : null}
      </main>

      {/* Newsletter CTA */}
      {!loading && city && (
        <div className="bg-cream py-16">
          <div className="container max-w-[560px] text-center">
            <p className="font-heading font-semibold text-[20px] text-charcoal mb-2">
              Getting useful insights? Get them monthly.
            </p>
            <p className="font-body text-[15px] text-warm-gray mb-6">
              CBS data explained in plain English — free, no spam.
            </p>
            <div className="max-w-sm mx-auto">
              <NewsletterSignup source="city" />
            </div>
          </div>
        </div>
      )}

      {/* Similar Cities */}
      {!loading && city && (
        <SimilarCities currentCity={city.english_name} district={city.district} />
      )}

      <Footer />
    </div>
  );
};

export default CityPage;
