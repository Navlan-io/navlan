import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import TrendPill from "@/components/TrendPill";

const MONTH_LABELS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface IndexRow {
  month: number;
  year: number;
  value: number | null;
  percent_mom: number | null;
  percent_yoy: number | null;
}

const MarketSnapshot = () => {
  const [chartData, setChartData] = useState<{ label: string; value: number; mom: number }[]>([]);
  const [latest, setLatest] = useState({ value: 181.6, yoy: 4.0, mom: 0.2 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("price_indices")
          .select("month, year, value, percent_mom, percent_yoy")
          .eq("index_code", 40010)
          .order("year", { ascending: true })
          .order("month", { ascending: true });

        if (data && data.length > 0) {
          const rows = data as IndexRow[];
          setChartData(
            rows.map((r) => ({
              label: MONTH_LABELS[r.month] || `M${r.month}`,
              value: r.value ?? 0,
              mom: r.percent_mom ?? 0,
            }))
          );
          const last = rows[rows.length - 1];
          setLatest({
            value: last.value ?? 181.6,
            yoy: last.percent_yoy ?? 4.0,
            mom: last.percent_mom ?? 0.2,
          });
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label} 2025</p>
        <p className="text-charcoal">Index: {payload[0].value.toFixed(1)}</p>
        <p className="text-warm-gray">MoM: +{payload[0].payload.mom.toFixed(1)}%</p>
      </div>
    );
  };

  return (
    <section className="py-16 bg-cream">
      <div className="container max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Chart - 3/5 */}
          <div className="lg:col-span-3">
            <h2 className="font-heading font-semibold text-[24px] text-charcoal mb-6">
              Market Snapshot
            </h2>
            {loading ? (
              <div className="bg-warm-white rounded-xl h-[300px] animate-pulse" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A7F8B" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#4A7F8B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#E8E4DE"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#6B7178", fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12, fill: "#6B7178", fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#4A7F8B"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Commentary - 2/5 */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h3 className="font-heading font-semibold text-[18px] text-charcoal">
              Israel Housing Market — Q4 2025
            </h3>

            <div className="mt-5 space-y-4">
              <div>
                <span className="font-body text-[13px] text-warm-gray block">
                  Price Index
                </span>
                <span className="font-body font-bold text-[28px] text-charcoal">
                  {latest.value.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-body text-[13px] text-warm-gray">
                  Year-over-Year
                </span>
                <TrendPill
                  direction={latest.yoy >= 0 ? "up" : "down"}
                  value={`${latest.yoy >= 0 ? "+" : ""}${latest.yoy.toFixed(1)}%`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-body text-[13px] text-warm-gray">
                  Month-over-Month
                </span>
                <TrendPill
                  direction={latest.mom >= 0 ? "up" : "down"}
                  value={`${latest.mom >= 0 ? "+" : ""}${latest.mom.toFixed(1)}%`}
                />
              </div>
            </div>

            <p className="mt-5 font-body text-[15px] text-charcoal leading-[1.65]">
              Israeli housing prices continued their gradual climb through late
              2025, with the national price index reaching{" "}
              {latest.value.toFixed(1)}. Year-over-year growth has moderated from
              nearly 7% at the start of the year to {latest.yoy.toFixed(1)}%,
              suggesting a cooling but still-appreciating market. Construction
              costs have stabilized, rising just 2.2% annually.
            </p>

            <Link
              to="/market"
              className="mt-4 inline-block font-body font-medium text-[15px] text-horizon-blue no-underline hover:underline"
            >
              View Full Market Data →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketSnapshot;
