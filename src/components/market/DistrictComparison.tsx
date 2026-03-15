import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, type ChartPoint } from "@/lib/chartUtils";
import { chartColors, axisTick, districtColors } from "@/lib/chartColors";

const DISTRICTS = [
  { code: 60000, name: "Jerusalem", color: districtColors.Jerusalem },
  { code: 60100, name: "North", color: districtColors.North },
  { code: 60200, name: "Haifa", color: districtColors.Haifa },
  { code: 60300, name: "Central", color: districtColors.Central },
  { code: 60400, name: "Tel Aviv", color: districtColors["Tel Aviv"] },
  { code: 60500, name: "South", color: districtColors.South },
];

const DistrictComparison = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetch = async () => {
      const codes = DISTRICTS.map((d) => d.code);
      const { data } = await supabase
        .from("price_indices")
        .select("index_code, month, year, value")
        .in("index_code", codes)
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const map = new Map<string, any>();
      for (const row of data) {
        const key = `${row.year}-${row.month}`;
        if (!map.has(key)) {
          map.set(key, {
            label: buildLabel(row.month, row.year),
            year: row.year,
            month: row.month,
            sortKey: row.year * 100 + row.month,
          });
        }
        const district = DISTRICTS.find((d) => d.code === row.index_code);
        if (district) {
          map.get(key)![district.name] = row.value;
        }
      }

      const sorted = Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
      setChartData(sorted);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[350px]" />
      </section>
    );
  }

  if (chartData.length === 0) {
    return (
      <section>
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Prices by District</h2>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Data coming soon</p>
        </Card>
      </section>
    );
  }

  // Collect all district values for Y domain
  const allValues: number[] = [];
  for (const point of chartData) {
    for (const d of DISTRICTS) {
      if (point[d.name] != null) allValues.push(point[d.name] as number);
    }
  }
  const xAxisConfig = getXAxisConfig(chartData, isMobile);
  const yDomain = getNiceYDomain(allValues);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px] min-w-[140px]">
        <p className="text-charcoal font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.stroke }} />
            <span className="text-warm-gray">{p.dataKey}:</span>
            <span className="text-charcoal font-medium">{p.value?.toFixed(1) ?? "—"}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-1">Prices by District</h2>
      <p className="font-body text-[15px] text-warm-gray mb-6">
        Regional price index trends across Israel's six statistical districts
      </p>

      <div style={{ minHeight: 250 }} aria-label="Price index comparison across Israel's six districts">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
            {DISTRICTS.map((d) => (
              <Line
                key={d.code}
                type="monotone"
                dataKey={d.name}
                stroke={d.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        {DISTRICTS.map((d) => (
          <a
            key={d.code}
            href="/#explore-cities"
            className="flex items-center gap-1.5 font-body text-[13px] text-charcoal no-underline hover:underline"
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name}
          </a>
        ))}
      </div>

      <p className="font-body text-[12px] text-warm-gray mt-3">
        Source: CBS Dwelling Price Index by District
      </p>

      {chartData.length > 0 && (() => {
        const lastPoint = chartData[chartData.length - 1];
        const districtValues = DISTRICTS.map(d => ({ name: d.name, value: lastPoint[d.name] as number | undefined })).filter(d => d.value != null);
        if (districtValues.length < 2) return null;
        districtValues.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        const highest = districtValues[0];
        const lowest = districtValues[districtValues.length - 1];
        const spread = (highest.value ?? 0) - (lowest.value ?? 0);
        const prevIdx = Math.max(0, chartData.length - 13);
        const prevPoint = chartData[prevIdx];
        const prevHigh = Math.max(...DISTRICTS.map(d => (prevPoint[d.name] as number) ?? 0));
        const prevLow = Math.min(...DISTRICTS.map(d => (prevPoint[d.name] as number) ?? Infinity).filter(v => v !== Infinity && v > 0));
        const prevSpread = prevHigh - prevLow;
        const spreadDir = spread > prevSpread ? "widened" : "narrowed";
        return (
          <InsightCard>
            The {highest.name} district leads with an index of {highest.value?.toFixed(1)}, while {lowest.name} is lowest at {lowest.value?.toFixed(1)}. The gap between the most and least expensive regions has {spreadDir} over the past year.
          </InsightCard>
        );
      })()}
    </section>
  );
};

export default DistrictComparison;
