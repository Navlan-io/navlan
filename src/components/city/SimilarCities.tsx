import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SimilarCitiesProps {
  currentCity: string;
  district: string;
}

const toSlug = (name: string) => name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const SimilarCities = ({ currentCity, district }: SimilarCitiesProps) => {
  const [cities, setCities] = useState<{ name: string; tagline: string | null }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: localities } = await supabase
        .from("localities")
        .select("english_name")
        .in("entity_type", ["city", "town", "yishuv"])
        .eq("district", district)
        .neq("english_name", currentCity)
        .limit(10);

      if (!localities?.length) return;

      const names = localities.map(l => l.english_name);
      const { data: profiles } = await supabase
        .from("city_profiles")
        .select("city_name, tagline")
        .in("city_name", names)
        .limit(3);

      setCities((profiles ?? []).map(p => ({ name: p.city_name, tagline: p.tagline })));
    };
    fetch().catch(console.error);
  }, [currentCity, district]);

  if (cities.length === 0) return null;

  return (
    <>
      <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />
      <section className="bg-warm-white py-14">
        <div className="container max-w-[1200px]">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
            Also in {district} District
          </span>
          <h2 className="font-heading font-semibold text-[22px] text-charcoal mt-2 mb-6">
            Explore Nearby Cities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cities.map((c) => (
              <Link
                key={c.name}
                to={`/city/${toSlug(c.name)}`}
                className="group block bg-cream rounded-xl p-5 border border-grid-line/60 no-underline hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="font-heading font-semibold text-[17px] text-charcoal">{c.name}</h3>
                {c.tagline && (
                  <p className="mt-1 font-body text-[14px] text-warm-gray line-clamp-2">{c.tagline}</p>
                )}
                <span className="mt-3 inline-block font-body font-medium text-[14px] text-sage group-hover:text-sage-dark transition-colors">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default SimilarCities;
