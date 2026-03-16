import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import TrendPill from "@/components/TrendPill";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";
import { chartColors, axisTick } from "@/lib/chartColors";

interface IndexRow {
  month: number;
  year: number;
  value: number | null;
  percent_mom: number | null;
  percent_yoy: number | null;
}

const MarketSnapshot = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [latest, setLatest] = useState({ value: 601.4, yoy: 0.4, mom: 0.8, month: 0, year: 0 });
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes] = await Promise.all([
          supabase
            .from("price_indices")
            .select("month, year, value, percent_mom, percent_yoy")
            .eq("index_code", 40010)
            .order("year", { ascending: true })
            .order("month", { ascending: true }),
        ]);

        if (priceRes.data && priceRes.data.length > 0) {
          const rows = priceRes.data as IndexRow[];
          setChartData(
            rows.map((r) => ({
              label: buildLabel(r.month, r.year),
              year: r.year,
              month: r.month,
              value: r.value ?? 0,
              mom: r.percent_mom ?? 0,
            }))
          );
          const last = rows[rows.length - 1];
          setLatest({
            value: last.value ?? 601.4,
            yoy: last.percent_yoy ?? 0.4,
            mom: last.percent_mom ?? 0.8,
            month: last.month,
            year: last.year,
          });
        }

      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const xAxisConfig = getXAxisConfig(chartData, isMobile);
  const yDomain = getNiceYDomain(chartData.map(d => d.value as number));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-sage/20 font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">Index: {payload[0].value.toFixed(1)}</p>
        <p className="text-warm-gray">MoM: {payload[0].payload.mom >= 0 ? "+" : ""}{payload[0].payload.mom.toFixed(1)}%</p>
      </div>
    );
  };

  const editorialText = `The national price index reached ${latest.value.toFixed(1)}. Year-over-year growth has moderated from nearly 7% to just +${latest.yoy.toFixed(1)}%, suggesting a cooling but still-appreciating market. For buyers, this means less urgency — but prices aren't falling.`;

  return (
    <section className="py-13 md:py-16 bg-cream">
      <div className="container max-w-[1200px]">
        <div className="text-center">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
            Market Data
          </span>
          <h2 className="mt-1 font-heading font-semibold text-[24px] text-charcoal mb-4">
            Market Snapshot
          </h2>
        </div>
        {loading ? (
          <div className="bg-warm-white rounded-xl h-[300px] animate-pulse" />
        ) : (
          <div className="h-[300px]" aria-label="National dwelling price index trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.horizonBlue} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={chartColors.horizonBlue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke={chartColors.gridLine}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  ticks={xAxisConfig.ticks}
                  tickFormatter={xAxisConfig.tickFormatter}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={yDomain.domain}
                  ticks={yDomain.ticks}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.horizonBlue}
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-8 max-w-[720px]">
          {latest.year > 0 && (
            <>
              <p className="font-body text-[13px] text-warm-gray mb-1">
                Data as of: {new Date(latest.year, latest.month - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
              </p>
              <p className="font-body text-[12px] text-warm-gray/70 mt-1 mb-4">Data updates monthly from CBS</p>
            </>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
            <div>
              <span className="font-body text-[13px] text-warm-gray block">
                Price Index
              </span>
              <span className="font-body font-bold text-[28px] text-horizon-blue">
                {latest.value.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] text-warm-gray">YoY</span>
              <TrendPill
                direction={latest.yoy >= 0 ? "up" : "down"}
                value={`${latest.yoy >= 0 ? "+" : ""}${latest.yoy.toFixed(1)}%`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] text-warm-gray">MoM</span>
              <TrendPill
                direction={latest.mom >= 0 ? "up" : "down"}
                value={`${latest.mom >= 0 ? "+" : ""}${latest.mom.toFixed(1)}%`}
              />
            </div>
          </div>

          <p className="font-body text-[15px] text-charcoal leading-[1.6] mb-4">
            {editorialText}
          </p>

          <Link
            to="/market"
            className="inline-block font-body font-medium text-[15px] text-horizon-blue no-underline hover:underline"
          >
            View Full Market Data <ArrowRight className="inline h-4 w-4 ml-1 align-[-2px]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketSnapshot;
