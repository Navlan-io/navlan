import { useEffect, useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InsightCard from "./InsightCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { chartColors, axisTick } from "@/lib/chartColors";

interface PopulationRow {
  year: number;
  population: number;
  growth_rate: number | null;
}

interface StartsRow {
  year: number;
  month: number | null;
  value: number | null;
}

interface PopulationData {
  growthRate: number | null;
  peopleAdded: number | null;
}

interface PopulationDemandProps {
  onDataLoaded?: (data: PopulationData) => void;
}

const formatLargeNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString("en-US")}K`;
  return n.toLocaleString("en-US");
};

const PopulationDemand = ({ onDataLoaded }: PopulationDemandProps) => {
  const [popData, setPopData] = useState<PopulationRow[]>([]);
  const [startsTotal, setStartsTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const calledBack = useRef(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [popRes, startsRes] = await Promise.all([
        supabase
          .from("population_data")
          .select("year, population, growth_rate")
          .order("year", { ascending: true }),
        // Get last 12 months of housing starts (national)
        supabase
          .from("construction_stats")
          .select("year, month, value")
          .eq("metric", "starts")
          .is("district", null)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(12),
      ]);

      const pop = (popRes.data as PopulationRow[]) ?? [];
      setPopData(pop);

      // Sum last 12 months of starts
      const starts = (startsRes.data as StartsRow[]) ?? [];
      if (starts.length > 0) {
        const total = starts.reduce((sum, r) => sum + (r.value ?? 0), 0);
        setStartsTotal(total);
      }

      setLoading(false);
    };
    fetchAll();
  }, []);

  // Callback to parent with growth rate and people added
  useEffect(() => {
    if (!calledBack.current && popData.length > 0 && onDataLoaded) {
      const latest = popData[popData.length - 1];
      const previous = popData.length >= 2 ? popData[popData.length - 2] : null;
      const added = previous ? latest.population - previous.population : null;
      onDataLoaded({ growthRate: latest.growth_rate, peopleAdded: added });
      calledBack.current = true;
    }
  }, [popData, onDataLoaded]);

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[250px]" />
      </section>
    );
  }

  if (popData.length === 0) {
    return (
      <section>
        <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-1">
          Population &amp; Housing Demand
        </h2>
        <p className="font-body text-[15px] text-warm-gray mb-6">
          The structural force behind Israel's housing market
        </p>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Population data coming soon</p>
        </Card>
      </section>
    );
  }

  const latest = popData[popData.length - 1];
  const previous = popData.length >= 2 ? popData[popData.length - 2] : null;
  const peopleAdded = previous ? latest.population - previous.population : null;
  const populationMillions = (latest.population / 1_000_000).toFixed(2);
  const growthRate = latest.growth_rate;

  // Compute growth rate multiple vs OECD
  const oecdAvg = 0.6;
  const growthMultiple = growthRate ? (growthRate / oecdAvg).toFixed(1) : null;

  // Bar chart data — people added vs housing starts
  const barData = [];
  if (peopleAdded != null) {
    barData.push({ name: "People added last year", value: peopleAdded, fill: chartColors.sandGold });
  }
  if (startsTotal != null) {
    barData.push({ name: "Housing units started", value: startsTotal, fill: chartColors.horizonBlue });
  }

  // Population growth line chart data
  const lineData = popData
    .filter((r) => r.growth_rate != null)
    .map((r) => ({
      year: r.year.toString(),
      growthRate: r.growth_rate,
    }));

  const BarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{payload[0].payload.name}</p>
        <p className="text-charcoal">{Number(payload[0].value).toLocaleString("en-US")}</p>
      </div>
    );
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{label}</p>
        <p className="text-charcoal">{payload[0].value?.toFixed(2)}%</p>
      </div>
    );
  };

  // Compute max for bar chart Y domain
  const barMax = Math.max(...barData.map((d) => d.value));
  const barDomainMax = Math.ceil(barMax / 50_000) * 50_000;

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-1">
        Population &amp; Housing Demand
      </h2>
      <p className="font-body text-[15px] text-warm-gray mb-6">
        The structural force behind Israel's housing market
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Current Population</span>
          <span className="font-body font-bold text-[28px] text-charcoal">
            {populationMillions}M
          </span>
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Annual Growth</span>
          <span className="font-body font-bold text-[28px] text-charcoal">
            {growthRate != null ? `${growthRate.toFixed(1)}%` : "—"}
          </span>
        </Card>
        <Card className="p-5 bg-cream border-0 shadow-card">
          <span className="font-body text-[13px] text-warm-gray block">Developed World Avg</span>
          <span className="font-body font-bold text-[28px] text-charcoal">~0.6%</span>
        </Card>
      </div>

      {/* Part A: Side-by-side horizontal bar comparison */}
      {barData.length === 2 && (
        <div className="mb-10">
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">
            Annual Demand vs. Supply
          </h3>
          <div style={{ minHeight: 140 }} aria-label="People added versus housing units started comparison">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} layout="vertical" margin={{ left: isMobile ? 10 : 20, right: 40 }}>
                <CartesianGrid horizontal={false} vertical stroke={chartColors.gridLine} />
                <XAxis
                  type="number"
                  domain={[0, barDomainMax]}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatLargeNumber(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: isMobile ? 9 : 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={isMobile ? 100 : 170}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  label={{
                    position: "right",
                    formatter: (v: number) => v.toLocaleString("en-US"),
                    style: { ...axisTick, fontSize: 12, fontWeight: 600 },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Part B: Population growth rate line chart */}
      {lineData.length > 0 && (
        <div className="lg:flex lg:gap-8 lg:items-start">
          <div className="lg:w-[60%]">
            <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">
              Population Growth Rate Over Time
            </h3>
            <div style={{ minHeight: 250 }} aria-label="Israel population growth rate trend">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid horizontal vertical={false} stroke={chartColors.gridLine} />
                  <XAxis
                    dataKey="year"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    interval={isMobile ? Math.floor(lineData.length / 5) : Math.floor(lineData.length / 8)}
                  />
                  <YAxis
                    domain={[0.4, "auto"]}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <ReferenceLine
                    y={0.6}
                    stroke={chartColors.warmGray}
                    strokeDasharray="6 4"
                    label={{
                      value: "Developed world avg (0.6%)",
                      position: "right",
                      style: { fontSize: 10, fill: chartColors.warmGray, fontFamily: "DM Sans" },
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="growthRate"
                    stroke={chartColors.sandGold}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-[2px]" style={{ backgroundColor: chartColors.sandGold }} />
                <span className="font-body text-[12px] text-charcoal">Israel population growth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0 border-t border-dashed" style={{ borderColor: chartColors.warmGray }} />
                <span className="font-body text-[12px] text-charcoal">Developed world avg</span>
              </div>
            </div>

            <p className="font-body text-[12px] text-warm-gray mt-3">
              Source: World Bank Population Data · Latest: 2024 · Updates annually
            </p>
          </div>
          <div className="lg:w-[40%]">
            <InsightCard layout="inline">
              {peopleAdded != null && startsTotal != null
                ? `Israel added roughly ${peopleAdded.toLocaleString("en-US")} people last year while approximately ${startsTotal.toLocaleString("en-US")} housing units entered construction. This imbalance has persisted for decades — Israel's growth rate has consistently run at ${growthMultiple ?? "2"}×+ the developed-world average. The 2023 spike reflects a surge in immigration. The long-term average remains around 1.8–2.0%.`
                : `Israel's population growth rate has consistently run well above the developed-world average of ~0.6%. Understanding this dynamic helps explain why Israeli real estate has historically behaved differently from markets with slower population growth.`}
            </InsightCard>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopulationDemand;
