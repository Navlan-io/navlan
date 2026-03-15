import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import TrendPill from "@/components/TrendPill";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Share2 } from "lucide-react";

const DISTRICT_INDEX_MAP: Record<string, number> = {
  Jerusalem: 60000,
  North: 60100,
  Haifa: 60200,
  Central: 60300,
  "Tel Aviv": 60400,
  South: 60500,
};

interface CityHeroProps {
  city: {
    english_name: string;
    hebrew_name: string | null;
    cbs_code: number | null;
    district: string;
  };
  profile: { overview: string | null } | null;
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

const CityHero = ({ city, profile, prices, districtIndices }: CityHeroProps) => {
  const { formatPrice } = useCurrency();

  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : null;
  const prevPrice = prices.length > 1 ? prices[prices.length - 2] : null;

  const priceTrend = getTrend(latestPrice?.avg_price_total ?? null, prevPrice?.avg_price_total ?? null);
  const txTrend = getTrend(
    latestPrice?.transactions_total ?? null,
    prevPrice?.transactions_total ?? null
  );

  const latestIndex = districtIndices.length > 0 ? districtIndices[districtIndices.length - 1] : null;

  const overviewLine = profile?.overview
    ? profile.overview.split(".")[0] + "."
    : `Located in the ${city.district} District`;

  return (
    <section className="bg-warm-white">
      <div className="container max-w-[1200px] py-8 md:py-10">
        <Link
          to="/#explore-cities"
          className="inline-flex items-center gap-1 font-body font-medium text-sm text-horizon-blue hover:underline mb-4"
        >
          ← All Cities
        </Link>

        <div>
          <h1 className="font-heading font-bold text-[32px] md:text-[38px] text-charcoal">
            {city.english_name}
          </h1>
          {city.hebrew_name && (
            <p className="font-body text-[18px] text-warm-gray mt-1">{city.hebrew_name}</p>
          )}
        </div>

        <p className="mt-2 font-body text-[17px] leading-[1.75] text-warm-gray max-w-2xl">{overviewLine}</p>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Check out ${city.english_name} real estate data on Navlan — ${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sage/30 text-sage font-body text-[14px] font-medium hover:bg-sage/5 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {/* Average Price */}
          <Card className="p-5 bg-cream border-0 shadow-card">
            <p className="font-body text-[13px] text-warm-gray">Average Price</p>
            <p className="font-body font-bold text-[28px] text-charcoal mt-1">
              {latestPrice?.avg_price_total != null
                ? formatPrice(latestPrice.avg_price_total)
                : "—"}
            </p>
            {latestPrice && prevPrice && (
              <TrendPill direction={priceTrend.direction} value={priceTrend.value} className="mt-2" />
            )}
          </Card>

          {/* Transactions */}
          <Card className="p-5 bg-cream border-0 shadow-card">
            <p className="font-body text-[13px] text-warm-gray">Quarterly Transactions</p>
            <p className="font-body font-bold text-[28px] text-charcoal mt-1">
              {latestPrice?.transactions_total != null
                ? latestPrice.transactions_total.toLocaleString()
                : "—"}
            </p>
            {latestPrice && prevPrice && (
              <TrendPill direction={txTrend.direction} value={txTrend.value} className="mt-2" />
            )}
          </Card>

          {/* District Index */}
          <Card className="p-5 bg-cream border-0 shadow-card">
            <p className="font-body text-[13px] text-warm-gray">{city.district} District Index</p>
            <p className="font-body font-bold text-[28px] text-charcoal mt-1">
              {latestIndex?.value != null ? latestIndex.value.toFixed(1) : "—"}
            </p>
            {latestIndex?.percent_mom != null && (
              <TrendPill
                direction={latestIndex.percent_mom > 0 ? "up" : latestIndex.percent_mom < 0 ? "down" : "flat"}
                value={`${Math.abs(latestIndex.percent_mom).toFixed(1)}% MoM`}
                className="mt-2"
              />
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CityHero;
