import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";
import { chartColors, axisTick } from "@/lib/chartColors";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface StatRow {
  year: number;
  month: number | null;
  value: number | null;
}

const formatNumber = (n: number) => n.toLocaleString("en-US");

const ConstructionPipeline = () => {
  const [unsoldLatest, setUnsoldLatest] = useState<number | null>(null);
  const [monthsSupply, setMonthsSupply] = useState<number | null>(null);
  const [startsLatest, setStartsLatest] = useState<number | null>(null);
  const [unsoldChart, setUnsoldChart] = useState<ChartPoint[]>([]);
  const [startsChart, setStartsChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetch = async () => {
      const [unsoldRes, supplyRes, startsRes, unsoldSeriesRes, startsSeriesRes] = await Promise.all([
        supabase
          .from("construction_stats")
          .select("value")
          .eq("metric", "unsold_inventory")
          .is("district", null)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
        supabase
          .from("construction_stats")
          .select("value")
          .eq("metric", "months_supply")
          .is("district", null)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
        supabase
          .from("construction_stats")
          .select("value")
          .eq("metric", "starts")
          .is("district", null)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
        supabase
          .from("construction_stats")
          .select("year, month, value")
          .eq("metric", "unsold_inventory")
          .is("district", null)
          .order("year", { ascending: true })
          .order("month", { ascending: true }),
        supabase
          .from("construction_stats")
          .select("year, month, value")
          .eq("metric", "starts")
          .is("district", null)
          .order("year", { ascending: true })
          .order("month", { ascending: true }),
      ]);

      setUnsoldLatest(unsoldRes.data?.[0]?.value ?? null);
      setMonthsSupply(supplyRes.data?.[0]?.value ?? null);
      setStartsLatest(startsRes.data?.[0]?.value ?? null);

      const toChart = (rows: StatRow[] | null): ChartPoint[] =>
        (rows ?? []).map((r) => ({
          label: r.month ? buildLabel(r.month, r.year) : `${r.year}`,
          year: r.year,
          month: r.month ?? 1,
          value: r.value ?? 0,
        }));

      setUnsoldChart(toChart(unsoldSeriesRes.data as StatRow[] | null));
      setStartsChart(toChart(startsSeriesRes.data as StatRow[] | null));
      setLoading(false);
    };
    fetch();
  }, []);

  const unsoldXAxis = getXAxisConfig(unsoldChart, isMobile);
  const unsoldYDomain = getNiceYDomain(unsoldChart.map(d => d.value as number));
  const startsXAxis = getXAxisConfig(startsChart, isMobile);
  const startsYDomain = getNiceYDomain(startsChart.map(d => d.value as number));

  if (loading) {
    return (
      <section className="bg-cream -mx-8 px-8 py-12 rounded-none" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[280px]" />
      </section>
    );
  }

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">{formatNumber(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <section
      className="py-12"
      style={{
        backgroundColor: "hsl(var(--cream))",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        paddingLeft: "calc(50vw - 50%)",
        paddingRight: "calc(50vw - 50%)",
      }}
    >
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-6">Construction Activity</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 bg-warm-white border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Unsold New Units</span>
          <span className="font-body font-bold text-[28px] text-charcoal">
            {unsoldLatest != null ? formatNumber(unsoldLatest) : "—"}
          </span>
        </Card>
        <Card className="p-5 bg-warm-white border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Months of Supply</span>
          <div className="flex items-center gap-2">
            <span className="font-body font-bold text-[28px] text-charcoal">
              {monthsSupply != null ? monthsSupply.toFixed(1) : "—"}
            </span>
            {monthsSupply != null && monthsSupply > 24 && (
              <Badge className="bg-amber text-white text-[11px] font-body">High</Badge>
            )}
          </div>
        </Card>
        <Card className="p-5 bg-warm-white border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Monthly Starts</span>
          <span className="font-body font-bold text-[28px] text-charcoal">
            {startsLatest != null ? formatNumber(startsLatest) : "—"}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {/* Unsold Inventory Chart */}
        <div>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Unsold Inventory Trend</h3>
          {unsoldChart.length > 0 ? (
            <div style={{ minHeight: 250 }} aria-label="Unsold new housing inventory trend chart">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={unsoldChart}>
                  <defs>
                    <linearGradient id="unsoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.terraRed} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={chartColors.terraRed} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal vertical={false} stroke={chartColors.gridLine} />
                  <XAxis
                    dataKey="label"
                    ticks={unsoldXAxis.ticks}
                    tickFormatter={unsoldXAxis.tickFormatter}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={unsoldYDomain.domain}
                    ticks={unsoldYDomain.ticks}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={chartColors.terraRed} strokeWidth={2} fill="url(#unsoldGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Card className="p-8 bg-warm-white border-0 text-center">
              <p className="font-body text-warm-gray">Data coming soon</p>
            </Card>
          )}
        </div>

        {/* Construction Starts Chart */}
        <div>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Construction Starts</h3>
          {startsChart.length > 0 ? (
            <div style={{ minHeight: 250 }} aria-label="Monthly construction starts trend chart">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={startsChart}>
                  <defs>
                    <linearGradient id="startsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.horizonBlue} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={chartColors.horizonBlue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal vertical={false} stroke={chartColors.gridLine} />
                  <XAxis
                    dataKey="label"
                    ticks={startsXAxis.ticks}
                    tickFormatter={startsXAxis.tickFormatter}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={startsYDomain.domain}
                    ticks={startsYDomain.ticks}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={chartColors.horizonBlue} strokeWidth={2} fill="url(#startsGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Card className="p-8 bg-warm-white border-0 text-center">
              <p className="font-body text-warm-gray">Data coming soon</p>
            </Card>
          )}
        </div>
      </div>

      <p className="font-body text-[12px] text-warm-gray mt-4">
        Source: CBS Construction Statistics
      </p>

      {monthsSupply != null && (
        <InsightCard>
          {monthsSupply > 24
            ? `With ${monthsSupply.toFixed(1)} months of unsold inventory, the new construction market favors buyers. Historically, 12–18 months is considered balanced.`
            : monthsSupply >= 18
              ? `At ${monthsSupply.toFixed(1)} months of supply, inventory is elevated but not extreme.`
              : `At ${monthsSupply.toFixed(1)} months of supply, the new construction market is relatively balanced.`}
        </InsightCard>
      )}
    </section>
  );
};

export default ConstructionPipeline;
