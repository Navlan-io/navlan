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

const RentalMarket = () => {
  const [data, setData] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("Max");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      const { data: rows } = await supabase
        .from("price_indices")
        .select("month, year, value, percent_mom, percent_yoy")
        .eq("index_code", 50010)
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      setData((rows as IndexRow[]) ?? []);
      setLoading(false);
    };
    fetchData();
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

  const xAxisConfig = getXAxisConfig(chartData, isMobile);
  const yDomain = getNiceYDomain(chartData.map(d => d.value as number));

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Rental Market Trends</h2>
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
      <div className="bg-white rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">Index: {d.value.toFixed(1)}</p>
        {d.mom != null && <p className="text-warm-gray">MoM: {d.mom >= 0 ? "+" : ""}{d.mom.toFixed(1)}%</p>}
        {d.yoy != null && <p className="text-warm-gray">YoY: {d.yoy >= 0 ? "+" : ""}{d.yoy.toFixed(1)}%</p>}
      </div>
    );
  };

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-2">Rental Market Trends</h2>
      <p className="font-body text-[15px] text-warm-gray mb-6">
        National rent price index based on actual lease contracts (CBS)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Rent Index</span>
          <span className="font-body font-bold text-[28px] text-charcoal">{latest.value?.toFixed(1)}</span>
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block mb-1">Year-over-Year</span>
          <TrendPill
            direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
            value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}%`}
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

      <div style={{ minHeight: 250 }} aria-label="Rental price index trend chart">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.sandGold} stopOpacity={0.12} />
                <stop offset="100%" stopColor={chartColors.sandGold} stopOpacity={0} />
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
            <Area type="monotone" dataKey="value" stroke={chartColors.sandGold} strokeWidth={2} fill="url(#rentGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="font-body text-[12px] text-warm-gray mt-3">
        Source: CBS Consumer Price Index — Rent Sub-Component (Code 120460)
      </p>

      {latest && (() => {
        const yoy = latest.percent_yoy ?? 0;
        let narrative = "";
        if (yoy > 3) narrative = `Rents are climbing at +${yoy.toFixed(1)}% annually based on lease renewals. New tenants likely face increases roughly double this rate — closer to ${Math.round(yoy * 2)}% — since the index weights existing contracts heavily (Bank of Israel research).`;
        else if (yoy >= 0) narrative = `Rent growth is moderate at +${yoy.toFixed(1)}% year-over-year.`;
        else narrative = `Rents have dipped ${yoy.toFixed(1)}% — unusual in the Israeli market.`;
        return <InsightCard>{narrative}</InsightCard>;
      })()}
    </section>
  );
};

export default RentalMarket;
