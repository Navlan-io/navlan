import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import TrendPill from "@/components/TrendPill";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";
import { chartColors, axisTick } from "@/lib/chartColors";

const TIME_RANGES = ["1Y", "3Y", "5Y", "Max"] as const;

interface IndexRow {
  month: number;
  year: number;
  value: number | null;
  percent_mom: number | null;
  percent_yoy: number | null;
}

const NationalPriceTrend = () => {
  const [data, setData] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("Max");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetch = async () => {
      const { data: rows } = await supabase
        .from("price_indices")
        .select("month, year, value, percent_mom, percent_yoy")
        .eq("index_code", 40010)
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      setData((rows as IndexRow[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const now = new Date();
  const filtered = data.filter((d) => {
    if (range === "Max") return true;
    const years = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
    const cutoff = new Date(now.getFullYear() - years, now.getMonth(), 1);
    return new Date(d.year, d.month - 1, 1) >= cutoff;
  });

  const chartData: ChartPoint[] = filtered.map((r) => ({
    label: buildLabel(r.month, r.year),
    year: r.year,
    month: r.month,
    value: r.value ?? 0,
    mom: r.percent_mom,
    yoy: r.percent_yoy,
  }));

  const xAxisConfig = getXAxisConfig(chartData, isMobile, range);
  const yDomain = getNiceYDomain(chartData.map(d => d.value as number));

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[350px]" />
      </section>
    );
  }

  if (!latest) {
    return (
      <section>
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">National Price Index</h2>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Data coming soon</p>
        </Card>
      </section>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">Index: {d.value.toFixed(1)}</p>
        {d.mom != null && <p className="text-warm-gray">MoM: {d.mom >= 0 ? "+" : ""}{d.mom.toFixed(1)}%</p>}
        {d.yoy != null && <p className="text-warm-gray">YoY: {d.yoy >= 0 ? "+" : ""}{d.yoy.toFixed(1)}%</p>}
      </div>
    );
  };

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-6">National Price Index</h2>

      {/* Compact metric row on mobile, 3-col grid on desktop */}
      <Card className="p-5 bg-cream border-0 shadow-card mb-8 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-body text-[13px] text-warm-gray block">Price Index</span>
            <span className="font-body font-bold text-[24px] text-charcoal">{latest.value?.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <span className="font-body text-[11px] text-warm-gray block mb-0.5">YoY</span>
              <TrendPill
                direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
                value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}%`}
              />
            </div>
            <div className="text-center">
              <span className="font-body text-[11px] text-warm-gray block mb-0.5">MoM</span>
              <TrendPill
                direction={(latest.percent_mom ?? 0) >= 0 ? "up" : "down"}
                value={`${(latest.percent_mom ?? 0) >= 0 ? "+" : ""}${(latest.percent_mom ?? 0).toFixed(1)}%`}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="hidden md:grid grid-cols-3 gap-5 mb-8">
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Price Index</span>
          <span className="font-body font-bold text-[28px] text-charcoal">{latest.value?.toFixed(1)}</span>
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block mb-1">Year-over-Year</span>
          <TrendPill
            direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
            value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}%`}
          />
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block mb-1">Month-over-Month</span>
          <TrendPill
            direction={(latest.percent_mom ?? 0) >= 0 ? "up" : "down"}
            value={`${(latest.percent_mom ?? 0) >= 0 ? "+" : ""}${(latest.percent_mom ?? 0).toFixed(1)}%`}
          />
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex items-center gap-2" role="group" aria-label="Time range">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                "px-3 py-1.5 rounded-full font-body text-[13px] font-medium transition-colors",
                range === r ? "bg-sage text-white" : "bg-cream text-charcoal hover:bg-sage/10"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ minHeight: 250 }} aria-label="National dwelling price index trend from 2017 to 2025">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="natPriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.horizonBlue} stopOpacity={0.12} />
                <stop offset="100%" stopColor={chartColors.horizonBlue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal vertical={false} stroke={chartColors.gridLine} />
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
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={chartColors.horizonBlue} strokeWidth={2} fill="url(#natPriceGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="font-body text-[12px] text-warm-gray mt-3">
        Source: Central Bureau of Statistics Dwelling Price Index (Base: 2015-2016 = 100)
      </p>

      {latest && (
        <InsightCard>
          {(() => {
            const yoy = latest.percent_yoy ?? 0;
            const val = latest.value ?? 0;
            const multiplier = Math.round(val / 100);
            let narrative = "";
            if (yoy > 5) narrative = `Prices are rising rapidly at +${yoy.toFixed(1)}% year-over-year — one of the hotter growth periods in recent history.`;
            else if (yoy >= 2) narrative = `Prices are growing moderately at +${yoy.toFixed(1)}% year-over-year — a steady but not overheated market.`;
            else if (yoy >= 0) narrative = `Price growth has slowed to +${yoy.toFixed(1)}% year-over-year — one of the coolest periods in the past decade.`;
            else narrative = `Prices have declined ${yoy.toFixed(1)}% year-over-year — a rare correction in the Israeli market.`;
            return `${narrative} The index value of ${val.toFixed(1)} means prices are roughly ${multiplier}× higher than the 1993 base period.`;
          })()}
        </InsightCard>
      )}
    </section>
  );
};

export default NationalPriceTrend;
