import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

const DISTRICT_INDEX_MAP: Record<string, number> = {
  Jerusalem: 60000,
  North: 60100,
  Haifa: 60200,
  Central: 60300,
  "Tel Aviv": 60400,
  South: 60500,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TIME_RANGES = ["1Y", "3Y", "5Y", "Max"] as const;

function formatPeriodShort(period: string) {
  // period like "2025-Q1" or "2024Q4" etc
  const match = period.match(/(\d{4})[- ]?Q(\d)/i);
  if (match) return `Q${match[2]} '${match[1].slice(2)}`;
  return period;
}

const TrendsTab = ({ city, prices, districtIndices }: TrendsTabProps) => {
  const { formatPrice, currency, rates } = useCurrency();
  const usdRate = rates.USD;
  const eurRate = rates.EUR;
  const [compareCity, setCompareCity] = useState<string | null>(null);
  const [comparePrices, setComparePrices] = useState<any[]>([]);
  const [compareCities, setCompareCities] = useState<{ english_name: string; cbs_code: number | null }[]>([]);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [districtRange, setDistrictRange] = useState<(typeof TIME_RANGES)[number]>("Max");
  const [rentalData, setRentalData] = useState<any>(null);
  const [rentalLoading, setRentalLoading] = useState(true);

  // Fetch rental data for this city
  useEffect(() => {
    if (!city.cbs_code) {
      setRentalLoading(false);
      return;
    }
    const fetchRental = async () => {
      const { data } = await supabase
        .from("city_rentals")
        .select("*")
        .eq("cbs_code", city.cbs_code!)
        .order("period", { ascending: false })
        .limit(1);
      setRentalData(data?.[0] ?? null);
      setRentalLoading(false);
    };
    fetchRental();
  }, [city.cbs_code]);

  // Fetch available comparison cities
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

  // Fetch comparison city prices
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

  // Chart data for price history
  // Sort prices chronologically by parsing "Q3-2024" → year + quarter
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

  // Latest price row for room breakdown
  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : null;

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
  const districtChartData = districtIndices.map((d) => ({
    label: `${MONTHS[d.month - 1]} '${String(d.year).slice(2)}`,
    value: d.value,
    year: d.year,
    month: d.month,
  }));

  // Filter district data by time range
  const now = new Date();
  const filteredDistrictData = districtChartData.filter((d) => {
    if (districtRange === "Max") return true;
    const years = districtRange === "1Y" ? 1 : districtRange === "3Y" ? 3 : 5;
    const cutoff = new Date(now.getFullYear() - years, now.getMonth(), 1);
    const dataDate = new Date(d.year, d.month - 1, 1);
    return dataDate >= cutoff;
  });

  const noPriceData = prices.length === 0;

  return (
    <div className="space-y-10">
      {/* Price History Chart */}
      <section>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h3 className="font-heading font-semibold text-[18px] text-charcoal">Average Dwelling Price</h3>
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
            <p className="font-body text-warm-gray">Price data not yet available for {city.english_name}</p>
          </Card>
        ) : (
          <>
            <div className="w-full" style={{ minHeight: 250 }}>
              <ResponsiveContainer width="100%" height={280}>
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
                    tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${Math.round(v / (currency === "₪" ? 1 : currency === "$" ? 3.688 : 3.846))}K`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontFamily: "Inter",
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [formatPrice(value), city.english_name]}
                    labelStyle={{ color: "#6B7178" }}
                  />
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
                  <div className="w-4 h-0.5 bg-deep-olive border-dashed" style={{ borderTop: "2px dashed #4A5540", height: 0 }} />
                  <span className="font-body text-[13px] text-charcoal">{compareCity}</span>
                </div>
              </div>
            )}
          </>
        )}

        <p className="font-body text-[12px] text-warm-gray mt-3">
          Source: CBS Table 2.2 — Average Dwelling Prices
        </p>
      </section>

      {/* Room Breakdown Table */}
      {latestPrice && (
        <section>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Price by Room Count</h3>
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full max-w-lg">
              <thead>
                <tr className="border-b border-grid-line">
                  <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 pr-6">Rooms</th>
                  <th className="text-right font-body font-medium text-[14px] text-warm-gray py-3">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {roomData.map((row) => (
                  <tr key={row.rooms} className="border-b border-grid-line last:border-0">
                    <td className="font-body text-[15px] text-charcoal py-3 pr-6">{row.rooms}</td>
                    <td className="text-right font-body text-[15px] text-charcoal py-3">
                      {row.value != null ? formatPrice(row.value) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body text-[12px] text-warm-gray mt-3">Source: CBS Table 2.2</p>
        </section>
      )}

      {/* Average Monthly Rent */}
      {!rentalLoading && rentalData ? (
        <section>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Average Monthly Rent</h3>
          <Card className="p-5 bg-cream border-0 shadow-card mb-6 inline-block">
            <span className="font-body text-[13px] text-warm-gray block">Avg Monthly Rent</span>
            <span className="font-body font-bold text-[24px] text-charcoal">
              {rentalData.avg_rent_total != null
                ? (() => {
                    const v = rentalData.avg_rent_total;
                    if (currency === "₪") return `₪${Math.round(v).toLocaleString()}/mo`;
                    if (currency === "$") return `$${Math.round(v / usdRate).toLocaleString()}/mo`;
                    return `€${Math.round(v / eurRate).toLocaleString()}/mo`;
                  })()
                : "—"}
            </span>
          </Card>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full max-w-lg">
              <thead>
                <tr className="border-b border-grid-line">
                  <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 pr-6">Rooms</th>
                  <th className="text-right font-body font-medium text-[14px] text-warm-gray py-3">Avg Monthly Rent</th>
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
                      {row.value != null
                        ? (() => {
                            if (currency === "₪") return `₪${Math.round(row.value).toLocaleString()}`;
                            if (currency === "$") return `$${Math.round(row.value / usdRate).toLocaleString()}`;
                            return `€${Math.round(row.value / eurRate).toLocaleString()}`;
                          })()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body text-[12px] text-warm-gray mt-3">Source: CBS Table 4.9 — Average Monthly Rent Prices</p>
        </section>
      ) : !rentalLoading && !rentalData ? (
        <section>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Average Monthly Rent</h3>
          <Card className="p-6 bg-cream border-0 text-center">
            <p className="font-body text-warm-gray">Rental data for {city.english_name} is not yet available.</p>
          </Card>
        </section>
      ) : null}

      {/* District Index Chart */}
      <section>
        <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">
          {city.district} District — Price Index Trend
        </h3>

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
          <div className="w-full" style={{ minHeight: 250 }}>
            <ResponsiveContainer width="100%" height={280}>
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
                  tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontFamily: "Inter",
                    fontSize: 13,
                  }}
                  labelStyle={{ color: "#6B7178" }}
                />
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
        )}

        <p className="font-body text-[12px] text-warm-gray mt-3">Source: CBS Dwelling Price Index</p>
      </section>
    </div>
  );
};

export default TrendsTab;
