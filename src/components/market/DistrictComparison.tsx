import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildLabel, getXAxisConfig, getNiceYDomain, filterByRange, TIME_RANGES, type TimeRange, type ChartPoint } from "@/lib/chartUtils";
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
  const [range, setRange] = useState<TimeRange>("Max");
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
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-4">Price Growth by District</h2>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Data coming soon</p>
        </Card>
      </section>
    );
  }

  const filtered = filterByRange(chartData, range);

  // Collect all district values for Y domain from filtered data
  const allValues: number[] = [];
  for (const point of filtered) {
    for (const d of DISTRICTS) {
      if (point[d.name] != null) allValues.push(point[d.name] as number);
    }
  }
  const xAxisConfig = getXAxisConfig(filtered, isMobile, range);
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
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-heading font-semibold text-[22px] text-charcoal">Price Growth by District</h2>
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
      <p className="font-body text-[15px] text-warm-gray mb-2">
        How prices have changed in each district since the 2015–2016 base period
      </p>
      <p className="font-body text-[12px] text-warm-gray/80 mb-6 italic">
        This chart shows relative price changes, not current price levels. All districts start at index value 100.
      </p>

      <div className="lg:flex lg:gap-8 lg:items-start">
        <div className="lg:w-[60%]">
          <div style={{ minHeight: 250 }} aria-label="Price index comparison across Israel's six districts">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filtered}>
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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
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
        </div>
        <div className="lg:w-[40%]">
          {chartData.length > 0 && (() => {
            const lastPoint = chartData[chartData.length - 1];
            const districtValues = DISTRICTS.map(d => ({ name: d.name, value: lastPoint[d.name] as number | undefined })).filter(d => d.value != null);
            if (districtValues.length < 2) return null;
            districtValues.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
            const highest = districtValues[0];
            const lowest = districtValues[districtValues.length - 1];
            const highMultiple = ((highest.value ?? 0) / 100).toFixed(1);
            const lowMultiple = ((lowest.value ?? 0) / 100).toFixed(1);
            return (
              <InsightCard layout="inline">
                The {highest.name} has seen the strongest price growth since 2015 — up {highMultiple}× from the base period — driven by relative affordability attracting buyers priced out of the Center. {lowest.name}, despite different market dynamics, has grown at a slower rate of {lowMultiple}× from the base.
              </InsightCard>
            );
          })()}
        </div>
      </div>
    </section>
  );
};

export default DistrictComparison;
