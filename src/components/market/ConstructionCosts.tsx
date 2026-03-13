import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import TrendPill from "@/components/TrendPill";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CostRow {
  month: number;
  year: number;
  value: number | null;
  percent_yoy: number | null;
}

const ConstructionCosts = () => {
  const [data, setData] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: rows } = await supabase
        .from("construction_costs")
        .select("month, year, value, percent_yoy")
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

  const chartData = data.map((r) => ({
    label: `${MONTHS[r.month - 1]} '${String(r.year).slice(2)}`,
    value: r.value ?? 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
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

      <Card className="p-5 bg-cream border-0 shadow-card inline-block mb-8">
        <span className="font-body text-[13px] text-warm-gray block">Construction Cost Index</span>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-body font-bold text-[28px] text-charcoal">{latest.value?.toFixed(1)}</span>
          <TrendPill
            direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
            value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}% YoY`}
          />
        </div>
      </Card>

      <div style={{ minHeight: 250 }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4A96A" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#C4A96A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal vertical={false} stroke="#E8E4DE" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#6B7178", fontFamily: "Inter" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#C4A96A" strokeWidth={2} fill="url(#costGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="font-body text-[12px] text-warm-gray mt-3">
        Source: CBS Construction Cost Input Index
      </p>

      <p className="font-body text-[14px] text-warm-gray mt-4">
        The construction cost index tracks input costs (labor, materials, equipment) for residential building.
        Rising construction costs contribute to higher new-build prices.
      </p>
    </section>
  );
};

export default ConstructionCosts;
