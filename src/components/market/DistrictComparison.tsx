import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DISTRICTS = [
  { code: 60000, name: "Jerusalem", color: "#7C8B6E" },
  { code: 60100, name: "North", color: "#C4A96A" },
  { code: 60200, name: "Haifa", color: "#4A7F8B" },
  { code: 60300, name: "Central", color: "#4A5540" },
  { code: 60400, name: "Tel Aviv", color: "#C25B4A" },
  { code: 60500, name: "South", color: "#5B8C5A" },
];

const DistrictComparison = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Group by year-month
      const map = new Map<string, any>();
      for (const row of data) {
        const key = `${row.year}-${row.month}`;
        if (!map.has(key)) {
          map.set(key, {
            label: `${MONTHS[row.month - 1]} '${String(row.year).slice(2)}`,
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px] min-w-[140px]">
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

      <div style={{ minHeight: 350 }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid horizontal vertical={false} stroke="#E8E4DE" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7178", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7178", fontFamily: "Inter" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
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

      <div className="flex flex-wrap items-center gap-4 mt-4">
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
    </section>
  );
};

export default DistrictComparison;
