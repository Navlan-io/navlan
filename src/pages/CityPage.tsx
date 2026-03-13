import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CityHero from "@/components/city/CityHero";
import CityTabs from "@/components/city/CityTabs";
import { Skeleton } from "@/components/ui/skeleton";

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
      // Try to find city by matching slug
      const { data: localities } = await supabase
        .from("localities")
        .select("english_name, hebrew_name, cbs_code, district")
        .eq("is_anglo_city", true)
        .eq("entity_type", "city");

      if (!localities || localities.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Match slug to city name
      const matched = localities.find((loc) => {
        const citySlug = loc.english_name
          .toLowerCase()
          .replace(/'/g, "")
          .replace(/\s+/g, "-");
        return citySlug === slug;
      }) || localities.find((loc) =>
        loc.english_name.toLowerCase() === searchName.toLowerCase()
      );

      if (!matched) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCity(matched);
      document.title = `${matched.english_name} — Real Estate Data | Navlan.io`;

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
              <Link to="/" className="text-horizon-blue hover:underline">
                homepage
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
      <Footer />
    </div>
  );
};

export default CityPage;
