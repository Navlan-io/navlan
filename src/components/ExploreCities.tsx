import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import TrendPill from "@/components/TrendPill";

interface CityData {
  name: string;
  slug: string;
  price: number;
  trend: "up" | "down" | "flat";
  trendValue: string;
}

const CITY_ORDER = [
  "Jerusalem", "Tel Aviv", "Ra'anana", "Herzliya", "Beit Shemesh", "Modi'in",
  "Kfar Saba", "Netanya", "Haifa", "Petah Tikva", "Beer Sheva", "Ashkelon",
];

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const ExploreCities = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data: localities } = await supabase
          .from("localities")
          .select("english_name, cbs_code")
          .eq("is_anglo_city", true)
          .eq("entity_type", "city");

        const { data: prices } = await supabase
          .from("city_prices")
          .select("cbs_code, period, avg_price_total")
          .order("period", { ascending: false });

        if (!localities || !prices) {
          setLoading(false);
          return;
        }

        const cityDataMap: CityData[] = localities.map((loc) => {
          const cityPrices = prices
            .filter((p) => p.cbs_code === loc.cbs_code)
            .sort((a, b) => b.period.localeCompare(a.period));

          const latest = cityPrices[0]?.avg_price_total ?? 0;
          const prev = cityPrices[1]?.avg_price_total ?? latest;
          const change = prev > 0 ? ((latest - prev) / prev) * 100 : 0;

          return {
            name: loc.english_name,
            slug: toSlug(loc.english_name),
            price: latest,
            trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
            trendValue: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
          };
        });

        // Sort by predefined order
        const sorted = CITY_ORDER
          .map((name) => cityDataMap.find((c) => c.name === name))
          .filter(Boolean) as CityData[];

        // Add any cities not in the order list
        const remaining = cityDataMap.filter(
          (c) => !CITY_ORDER.includes(c.name)
        );

        setCities([...sorted, ...remaining]);
      } catch {
        // fallback handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <section id="explore-cities" className="py-16 bg-warm-white">
      <div className="container max-w-[1200px]">
        <h2 className="font-heading font-semibold text-[24px] text-charcoal">
          Explore Cities
        </h2>
        <p className="mt-1 font-body text-[15px] text-warm-gray">
          Data-driven profiles for Israel's most popular anglo communities
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-cream rounded-xl p-5 animate-pulse h-[140px]"
                />
              ))
            : cities.map((city) => (
                <div
                  key={city.slug}
                  className="bg-cream rounded-xl p-5 shadow-card hover:shadow-[0_4px_12px_rgba(45,50,52,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <h3 className="font-heading font-semibold text-[18px] text-charcoal">
                    {city.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-body font-bold text-[22px] text-charcoal">
                      {formatPrice(city.price)}
                    </span>
                    <TrendPill direction={city.trend} value={city.trendValue} />
                  </div>
                  <Link
                    to={`/city/${city.slug}`}
                    className="mt-3 inline-block font-body font-medium text-[14px] text-horizon-blue no-underline hover:underline"
                  >
                    Explore →
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCities;
