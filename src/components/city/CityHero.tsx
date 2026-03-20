import { Link } from "react-router-dom";
import TrendPill from "@/components/TrendPill";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Share2, MapPin, ArrowRight } from "lucide-react";

const DISTRICT_GRADIENT: Record<string, string> = {
  Jerusalem: "from-[#C4A96A]/12 via-[#C4A96A]/5 to-warm-white",
  North: "from-[#5B8C5A]/10 via-[#5B8C5A]/4 to-warm-white",
  Haifa: "from-[#4A5540]/10 via-[#4A5540]/4 to-warm-white",
  Central: "from-[#7C8B6E]/10 via-[#7C8B6E]/4 to-warm-white",
  "Tel Aviv": "from-[#4A7F8B]/10 via-[#4A7F8B]/4 to-warm-white",
  South: "from-[#C25B4A]/8 via-[#C25B4A]/3 to-warm-white",
};

interface CityHeroProps {
  city: {
    english_name: string;
    hebrew_name: string | null;
    cbs_code: number | null;
    district: string;
  };
  profile: { overview: string | null; tagline: string | null } | null;
  prices: {
    period: string;
    avg_price_total: number | null;
    transactions_total: number | null;
  }[];
  districtIndices: {
    value: number | null;
    percent_mom: number | null;
    percent_yoy: number | null;
  }[];
  population?: number | null;
  latestPeriod?: string | null;
}

function getTrend(latest: number | null, previous: number | null) {
  if (latest == null || previous == null || previous === 0)
    return { direction: "flat" as const, value: "0.0%" };
  const pct = ((latest - previous) / previous) * 100;
  return {
    direction: pct > 0 ? ("up" as const) : pct < 0 ? ("down" as const) : ("flat" as const),
    value: `${Math.abs(pct).toFixed(1)}%`,
  };
}

const CityHero = ({ city, profile, prices, districtIndices, population, latestPeriod }: CityHeroProps) => {
  const { formatPrice } = useCurrency();

  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : null;
  const prevPrice = prices.length > 1 ? prices[prices.length - 2] : null;
  const priceTrend = getTrend(latestPrice?.avg_price_total ?? null, prevPrice?.avg_price_total ?? null);

  const tagline = profile?.tagline || null;
  const gradient = DISTRICT_GRADIENT[city.district] || DISTRICT_GRADIENT.Central;

  return (
    <section className={`bg-gradient-to-b ${gradient}`}>
      <div className="container max-w-[1200px] pt-8 pb-10 md:pt-10 md:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <Link
            to="/cities"
            className="font-body text-[13px] text-warm-gray hover:text-charcoal transition-colors no-underline"
          >
            Cities
          </Link>
          <span className="text-warm-gray/40 text-[13px]">/</span>
          <span className="font-body text-[13px] text-charcoal">{city.english_name}</span>
        </div>

        {/* District label */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-3.5 w-3.5 text-sand-gold" />
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
            {city.district} District
          </span>
        </div>

        {/* City name + Hebrew */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-heading font-bold text-[32px] md:text-[40px] text-charcoal leading-tight">
            {city.english_name}
          </h1>
          {city.hebrew_name && (
            <span className="font-body text-[20px] md:text-[22px] text-warm-gray/60">{city.hebrew_name}</span>
          )}
        </div>

        {/* Tagline */}
        {tagline && (
          <p className="mt-2 font-body text-[17px] leading-[1.6] text-warm-gray">{tagline}</p>
        )}

        {/* Overview intro — first 2 sentences */}
        {profile?.overview && (() => {
          const sentences = profile.overview.match(/[^.!?]+[.!?]+/g);
          if (!sentences || sentences.length === 0) return null;
          const intro = sentences.slice(0, 2).join("").trim();
          return (
            <p className="font-body text-[15px] leading-[1.7] text-warm-gray mt-3">{intro}</p>
          );
        })()}

        {/* Data freshness + Share */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          {latestPeriod && (
            <span className="bg-white/60 rounded-full px-3 py-1 font-body text-[12px] text-warm-gray">
              Latest data: {latestPeriod}
            </span>
          )}
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Check out ${city.english_name} real estate data on Navlan — ${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sage/25 text-sage font-body text-[13px] font-medium hover:bg-sage/5 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {/* Average Price */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-grid-line/60">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-warm-gray">Avg Price</p>
            <p className="font-body font-bold text-[26px] md:text-[28px] text-charcoal mt-1.5 leading-none">
              {latestPrice?.avg_price_total != null
                ? formatPrice(latestPrice.avg_price_total)
                : "—"}
            </p>
            {latestPrice && prevPrice && (
              <TrendPill direction={priceTrend.direction} value={priceTrend.value} className="mt-2.5" />
            )}
            {!latestPrice && (
              <p className="mt-2 font-body text-[12px] text-warm-gray">City-level data not available</p>
            )}
          </div>

          {/* Population */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-grid-line/60">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-warm-gray">Population</p>
            <p className="font-body font-bold text-[26px] md:text-[28px] text-charcoal mt-1.5 leading-none">
              {population != null ? population.toLocaleString() : "—"}
            </p>
          </div>

          {/* District */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-grid-line/60">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-warm-gray">District</p>
            <Link
              to="/market#district-prices"
              className="inline-flex items-center gap-1.5 font-body font-bold text-[26px] md:text-[28px] text-horizon-blue mt-1.5 leading-none hover:underline transition-colors no-underline"
            >
              {city.district}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityHero;
