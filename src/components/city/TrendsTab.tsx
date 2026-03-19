import { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import InsightCard from "@/components/market/InsightCard";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";

interface TrendsTabProps {
  city: {
    english_name: string;
    cbs_code: number | null;
    district: string;
  };
  prices: {
    period: string;
    avg_price_total: number | null;
    avg_price_1_2_rooms: number | null;
    avg_price_3_rooms: number | null;
    avg_price_4_rooms: number | null;
    avg_price_5_rooms: number | null;
    avg_price_6_rooms: number | null;
  }[];
  districtIndices: {
    year: number;
    month: number;
    value: number | null;
    percent_mom: number | null;
    percent_yoy: number | null;
  }[];
  rentalData?: any;
}

const TIME_RANGES = ["1Y", "3Y", "5Y", "Max"] as const;

function formatPeriodShort(period: string) {
  const match = period.match(/(\d{4})[- ]?Q(\d)/i);
  if (match) return `Q${match[2]} '${match[1].slice(2)}`;
  return period;
}

const GoldDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent my-16" />
);

const TrendsTab = ({ city, prices, districtIndices, rentalData }: TrendsTabProps) => {
  const { formatPrice, currency, rates } = useCurrency();
  const usdRate = rates.USD;
  const eurRate = rates.EUR;
  const isMobile = useIsMobile();
  const [compareCity, setCompareCity] = useState<string | null>(null);
  const [comparePrices, setComparePrices] = useState<any[]>([]);
  const [compareCities, setCompareCities] = useState<{ english_name: string; cbs_code: number | null }[]>([]);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [districtRange, setDistrictRange] = useState<(typeof TIME_RANGES)[number]>("Max");

  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase
        .from("localities")
        .select("english_name, cbs_code")
        .eq("is_anglo_city", true)
        .eq("entity_type", "city")
        .neq("english_name", city.english_name);
      setCompareCities(data ?? []);
    };
    fetchCities();
  }, [city.english_name]);

  useEffect(() => {
    if (!compareCity) {
      setComparePrices([]);
      return;
    }
    const comp = compareCities.find((c) => c.english_name === compareCity);
    if (!comp?.cbs_code) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("city_prices")
        .select("period, avg_price_total")
        .eq("cbs_code", comp.cbs_code)
        .order("period", { ascending: true });
      setComparePrices(data ?? []);
    };
    fetch();
  }, [compareCity, compareCities]);

  const sortedPrices = [...prices]
    .filter((p) => !p.period.includes("Annual"))
    .sort((a, b) => {
      const parseP = (p: string) => {
        const m = p.match(/Q(\d)[- ]?(\d{4})/i);
        return m ? Number(m[2]) * 10 + Number(m[1]) : 0;
      };
      return parseP(a.period) - parseP(b.period);
    });

  const priceChartData = sortedPrices.map((p) => {
    const row: any = {
      period: formatPeriodShort(p.period),
      price: p.avg_price_total,
    };
    if (compareCity) {
      const match = comparePrices.find((cp) => cp.period === p.period);
      row.comparePrice = match?.avg_price_total ?? null;
    }
    return row;
  });

  const priceValues = priceChartData.map(d => d.price).filter((v): v is number => v != null);
  const priceYDomain = getNiceYDomain(priceValues);

  const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
  const firstPrice = sortedPrices.length > 1 ? sortedPrices[0] : null;

  const roomData = latestPrice
    ? [
        { rooms: "1-2 Rooms", value: latestPrice.avg_price_1_2_rooms },
        { rooms: "3 Rooms", value: latestPrice.avg_price_3_rooms },
        { rooms: "4 Rooms", value: latestPrice.avg_price_4_rooms },
        { rooms: "5 Rooms", value: latestPrice.avg_price_5_rooms },
        { rooms: "6+ Rooms", value: latestPrice.avg_price_6_rooms },
      ]
    : [];

  // District index chart data
  const districtChartData: ChartPoint[] = districtIndices.map((d) => ({
    label: buildLabel(d.month, d.year),
    year: d.year,
    month: d.month,
    value: d.value ?? 0,
  }));

  const now = new Date();
  const filteredDistrictData = districtChartData.filter((d) => {
    if (districtRange === "Max") return true;
    const years = districtRange === "1Y" ? 1 : districtRange === "3Y" ? 3 : 5;
    const cutoff = new Date(now.getFullYear() - years, now.getMonth(), 1);
    const dataDate = new Date(d.year, d.month - 1, 1);
    return dataDate >= cutoff;
  });

  const districtXAxis = getXAxisConfig(filteredDistrictData, isMobile);
  const districtYDomain = getNiceYDomain(filteredDistrictData.map(d => d.value as number));

  const noPriceData = prices.length === 0;

  // Build dynamic intro text for price section
  const priceIntro = (() => {
    if (noPriceData) return null;
    if (!latestPrice?.avg_price_total || !firstPrice?.avg_price_total) return null;
    const change = ((latestPrice.avg_price_total - firstPrice.avg_price_total) / firstPrice.avg_price_total) * 100;
    const direction = change >= 0 ? "risen" : "fallen";
    return `Over the past ${sortedPrices.length} quarters, average dwelling prices in ${city.english_name} have ${direction} from ${formatPrice(firstPrice.avg_price_total)} to ${formatPrice(latestPrice.avg_price_total)}.`;
  })();

  // Build insight text for price chart
  const priceInsight = (() => {
    if (noPriceData || !latestPrice?.avg_price_total || sortedPrices.length < 2) return null;
    const prev = sortedPrices[sortedPrices.length - 2];
    if (!prev?.avg_price_total) return null;
    const qoq = ((latestPrice.avg_price_total - prev.avg_price_total) / prev.avg_price_total) * 100;
    const direction = qoq >= 0 ? "up" : "down";
    const verb = qoq >= 0 ? "rose" : "fell";
    return `Quarter-over-quarter, prices ${verb} ${Math.abs(qoq).toFixed(1)}%. The ${city.district} District index provides broader trend context below.`;
  })();

  // District insight
  const districtInsight = (() => {
    if (districtIndices.length < 2) return null;
    const latest = districtIndices[districtIndices.length - 1];
    if (latest?.percent_yoy == null) return null;
    const direction = latest.percent_yoy >= 0 ? "risen" : "fallen";
    return `The ${city.district} District price index has ${direction} ${Math.abs(latest.percent_yoy).toFixed(1)}% year-over-year. This reflects the broader regional trend that affects all cities in the district.`;
  })();

  // Rent formatting helper
  const fmtRent = (v: number) => {
    if (currency === "₪") return `₪${Math.round(v).toLocaleString()}`;
    if (currency === "$") return `$${Math.round(v / usdRate).toLocaleString()}`;
    return `€${Math.round(v / eurRate).toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-charcoal">
            {entry.name}: {formatPrice(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const DistrictTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">Index: {d.value.toFixed(1)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-0">

      {/* ── Section 1: Average Dwelling Price ── */}
      <section>
        <h3 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal">
          Average Dwelling Price
        </h3>
        {priceIntro && (
          <p className="font-body text-[16px] font-normal text-warm-gray mt-2 mb-6">{priceIntro}</p>
        )}

        {/* Compare controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompareDropdown(!showCompareDropdown)}
              className="text-[13px]"
            >
              {compareCity ? `vs. ${compareCity}` : "Compare with..."}
            </Button>
            {showCompareDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-warm-white border border-grid-line rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto w-48">
                {compareCities.map((c) => (
                  <button
                    key={c.english_name}
                    onClick={() => {
                      setCompareCity(c.english_name);
                      setShowCompareDropdown(false);
                    }}
                    className="block w-full text-left px-3 py-2 font-body text-sm text-charcoal hover:bg-cream transition-colors"
                  >
                    {c.english_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {compareCity && (
            <button
              onClick={() => setCompareCity(null)}
              className="font-body text-[13px] text-terra-red hover:underline"
            >
              ✕ Remove comparison
            </button>
          )}
        </div>

        {noPriceData ? (
          <Card className="p-8 bg-cream border-0 text-center">
            <p className="font-body text-[15px] text-warm-gray">
              CBS city-level price data requires 100,000+ residents. {city.english_name} falls below this threshold.
            </p>
            <p className="font-body text-[14px] text-warm-gray mt-2">
              See the {city.district} District price index below for regional trends.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Chart — left side */}
            <div className="lg:w-[60%]">
              <div className="w-full" style={{ minHeight: 250 }}>
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
                  <AreaChart data={priceChartData}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A7F8B" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#4A7F8B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal vertical={false} stroke="#E8E4DE" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={priceYDomain.domain}
                      ticks={priceYDomain.ticks}
                      tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                      width={55}
                      tickFormatter={(v) => {
                        const divisor = currency === "₪" ? 1 : currency === "$" ? usdRate : eurRate;
                        const converted = v / divisor;
                        if (converted >= 1000) return `${(converted / 1000).toFixed(1).replace(/\.0$/, "")}M`;
                        return `${Math.round(converted)}K`;
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#4A7F8B"
                      strokeWidth={2}
                      fill="url(#priceGrad)"
                      dot={false}
                      name={city.english_name}
                    />
                    {compareCity && (
                      <Area
                        type="monotone"
                        dataKey="comparePrice"
                        stroke="#4A5540"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="transparent"
                        dot={false}
                        name={compareCity}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {compareCity && (
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-horizon-blue" />
                    <span className="font-body text-[13px] text-charcoal">{city.english_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-deep-olive" />
                    <span className="font-body text-[13px] text-charcoal">{compareCity}</span>
                  </div>
                </div>
              )}

              <p className="font-body text-[12px] text-warm-gray mt-3 mb-4">
                Source: Central Bureau of Statistics — Average Dwelling Prices
              </p>
            </div>

            {/* Insight — right side */}
            {priceInsight && (
              <div className="lg:w-[40%] lg:pt-0">
                <InsightCard>{priceInsight}</InsightCard>
              </div>
            )}
          </div>
        )}
      </section>

      <GoldDivider />

      {/* ── Section 2: Price by Room Count ── */}
      {latestPrice && roomData.some(r => r.value != null) && (
        <>
          <section>
            <h3 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal mt-8 mb-4">
              Price by Room Count
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full max-w-lg">
                <thead>
                  <tr className="border-b border-grid-line">
                    <th className="text-left font-body font-medium text-[13px] uppercase tracking-[0.06em] text-warm-gray py-3 pr-6">Rooms</th>
                    <th className="text-right font-body font-medium text-[13px] uppercase tracking-[0.06em] text-warm-gray py-3">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {roomData.map((row) => (
                    <tr key={row.rooms} className={cn("border-b border-grid-line last:border-0", (row.rooms === "3 Rooms" || row.rooms === "4 Rooms") && "bg-cream/50")}>
                      <td className="font-body text-[15px] text-charcoal py-3 pr-6">{row.rooms}</td>
                      <td className="text-right font-body text-[15px] text-charcoal py-3">
                        {row.value != null ? formatPrice(row.value) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-body text-[12px] text-warm-gray mt-3 mb-4">
              Source: Central Bureau of Statistics — Table 2.2
            </p>
          </section>

          <GoldDivider />
        </>
      )}

      {/* ── Section 3: Average Monthly Rent ── */}
      {rentalData ? (
        <>
          <section>
            <h3 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal mt-8 mb-2">
              Average Monthly Rent
            </h3>
            <p className="font-body text-[16px] font-normal text-warm-gray mt-2 mb-6">
              Based on lease renewal data from the Central Bureau of Statistics. New-lease rents are typically higher.
            </p>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[60%]">
                {/* Headline rent card */}
                <div className="bg-cream rounded-xl p-5 border border-grid-line/60 inline-block mb-6">
                  <span className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-warm-gray block">
                    Avg Monthly Rent
                  </span>
                  <span className="font-body font-bold text-[24px] text-charcoal">
                    {rentalData.avg_rent_total != null ? `${fmtRent(rentalData.avg_rent_total)}/mo` : "—"}
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full max-w-lg">
                    <thead>
                      <tr className="border-b border-grid-line">
                        <th className="text-left font-body font-medium text-[13px] uppercase tracking-[0.06em] text-warm-gray py-3 pr-6">Rooms</th>
                        <th className="text-right font-body font-medium text-[13px] uppercase tracking-[0.06em] text-warm-gray py-3">Avg Monthly Rent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rooms: "1-2 Rooms", value: rentalData.avg_rent_1_2_rooms },
                        { rooms: "2.5-3 Rooms", value: rentalData.avg_rent_2_5_3_rooms },
                        { rooms: "3.5-4 Rooms", value: rentalData.avg_rent_3_5_4_rooms },
                        { rooms: "4.5-6 Rooms", value: rentalData.avg_rent_4_5_6_rooms },
                      ].map((row) => (
                        <tr key={row.rooms} className="border-b border-grid-line last:border-0">
                          <td className="font-body text-[15px] text-charcoal py-3 pr-6">{row.rooms}</td>
                          <td className="text-right font-body text-[15px] text-charcoal py-3">
                            {row.value != null ? fmtRent(row.value) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="font-body text-[12px] text-warm-gray mt-3 mb-4">
                  Source: Central Bureau of Statistics — Average Monthly Rent Prices
                </p>
              </div>

              {/* Rent insight */}
              {rentalData.avg_rent_total && latestPrice?.avg_price_total && (
                <div className="lg:w-[40%]">
                  <InsightCard>
                    {(() => {
                      const annualRent = rentalData.avg_rent_total * 12;
                      const purchasePrice = latestPrice.avg_price_total * 1000; // prices are in thousands
                      const ratio = (annualRent / purchasePrice * 100).toFixed(1);
                      return `The rent-to-price ratio in ${city.english_name} is roughly ${ratio}% annually. This is a rough indicator — actual yields vary by neighbourhood and property type.`;
                    })()}
                  </InsightCard>
                </div>
              )}
            </div>
          </section>

          <GoldDivider />
        </>
      ) : rentalData === null ? (
        <>
          <section>
            <h3 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal mt-8 mb-4">
              Average Monthly Rent
            </h3>
            <Card className="p-6 bg-cream border-0 text-center">
              <p className="font-body text-[15px] text-warm-gray">Rental data for {city.english_name} is not yet available from CBS.</p>
            </Card>
          </section>
          <GoldDivider />
        </>
      ) : null}

      {/* ── Section 4: District Price Index Trend ── */}
      <section>
        <h3 className="font-heading font-semibold text-[20px] md:text-[22px] text-charcoal mt-8">
          {city.district} District — Price Index Trend
        </h3>
        {districtInsight && !noPriceData && (
          <p className="font-body text-[16px] font-normal text-warm-gray mt-2 mb-6">{districtInsight}</p>
        )}
        {noPriceData && (
          <p className="font-body text-[16px] font-normal text-warm-gray mt-2 mb-6">
            Since city-level price data isn't available for {city.english_name}, this district-level index is the best available proxy for local price trends.
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setDistrictRange(range)}
              className={cn(
                "px-3 py-1.5 rounded-full font-body text-[13px] font-medium transition-colors",
                districtRange === range
                  ? "bg-sage text-white"
                  : "bg-cream text-charcoal hover:bg-sage/10"
              )}
            >
              {range}
            </button>
          ))}
        </div>

        {filteredDistrictData.length === 0 ? (
          <Card className="p-8 bg-cream border-0 text-center">
            <p className="font-body text-warm-gray">District index data not yet available</p>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className={cn(districtInsight ? "lg:w-[60%]" : "w-full")}>
              <div className="w-full" style={{ minHeight: 250 }}>
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
                  <AreaChart data={filteredDistrictData}>
                    <defs>
                      <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A7F8B" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#4A7F8B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal vertical={false} stroke="#E8E4DE" />
                    <XAxis
                      dataKey="label"
                      ticks={districtXAxis.ticks}
                      tickFormatter={districtXAxis.tickFormatter}
                      tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={districtYDomain.domain}
                      ticks={districtYDomain.ticks}
                      tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<DistrictTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#4A7F8B"
                      strokeWidth={2}
                      fill="url(#distGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="font-body text-[12px] text-warm-gray mt-3 mb-4">
                Source: Central Bureau of Statistics — Dwelling Price Index
              </p>
            </div>

            {districtInsight && (
              <div className="lg:w-[40%]">
                <InsightCard>{districtInsight}</InsightCard>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrendsTab;
