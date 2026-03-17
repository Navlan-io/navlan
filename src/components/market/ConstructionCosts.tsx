import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import TrendPill from "@/components/TrendPill";
import { Skeleton } from "@/components/ui/skeleton";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";
import { chartColors, axisTick } from "@/lib/chartColors";

interface CostRow {
  month: number;
  year: number;
  value: number | null;
  percent_yoy: number | null;
  percent_mom: number | null;
}

const ConstructionCosts = () => {
  const [data, setData] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetch = async () => {
      const { data: rows } = await supabase
        .from("construction_costs")
        .select("month, year, value, percent_yoy, percent_mom")
        .eq("index_code", 200010)
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      setData((rows as CostRow[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-56 mb-4" />
        <Skeleton className="h-24 w-64 mb-4" />
        <Skeleton className="h-[300px]" />
      </section>
    );
  }

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const chartData: ChartPoint[] = data.map((r) => ({
    label: buildLabel(r.month, r.year),
    year: r.year,
    month: r.month,
    value: r.value ?? 0,
  }));

  const xAxisConfig = getXAxisConfig(chartData, isMobile);
  const yDomain = getNiceYDomain(chartData.map(d => d.value as number));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">Index: {payload[0].value.toFixed(1)}</p>
      </div>
    );
  };

  if (!latest) {
    return (
      <section>
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Construction Cost Trends</h2>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Data coming soon</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-6">Construction Cost Trends</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Construction Cost Index</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-body font-bold text-[28px] text-charcoal">{latest.value?.toFixed(1)}</span>
            <TrendPill
              direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
              value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}% YoY`}
            />
          </div>
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block mb-1">Month-over-Month</span>
          <TrendPill
            direction={(latest.percent_mom ?? 0) >= 0 ? "up" : "down"}
            value={`${(latest.percent_mom ?? 0) >= 0 ? "+" : ""}${(latest.percent_mom ?? 0).toFixed(1)}%`}
          />
        </Card>
      </div>

      <div className="lg:flex lg:gap-8 lg:items-start">
        <div className="lg:w-[60%]">
          <div style={{ minHeight: 250 }} aria-label="Construction cost index trend chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="value" stroke={chartColors.sandGold} strokeWidth={2} fill="url(#costGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="font-body text-[12px] text-warm-gray mt-3">
            Source: CBS Construction Cost Input Index
          </p>
        </div>
        <div className="lg:w-[40%]">
          {latest && (() => {
            const yoy = latest.percent_yoy ?? 0;
            let narrative = "";
            if (yoy > 5) narrative = `Construction costs are surging at +${yoy.toFixed(1)}% annually — expect this to push new-build prices higher.`;
            else if (yoy >= 2) narrative = `Construction costs are rising at +${yoy.toFixed(1)}% — above general inflation but not a major market driver.`;
            else narrative = `Construction costs have stabilized at +${yoy.toFixed(1)}% — removing one source of upward price pressure.`;
            return <InsightCard layout="inline">{narrative}</InsightCard>;
          })()}
        </div>
      </div>
    </section>
  );
};

export default ConstructionCosts;
