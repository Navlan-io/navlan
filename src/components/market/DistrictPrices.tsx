import { useEffect, useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InsightCard from "./InsightCard";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { chartColors, axisTick } from "@/lib/chartColors";

// Known district names as they appear in city_prices
// We query dynamically and filter to district-level rows
const KNOWN_DISTRICTS = [
  "Jerusalem", "North", "Haifa", "Center", "Tel Aviv", "South",
];

// Try to match district rows — they may be stored as "Jerusalem District", "North", etc.
const normalizeDistrictName = (name: string): string | null => {
  const lower = name.toLowerCase().replace(/\s*district\s*/i, "").trim();
  for (const d of KNOWN_DISTRICTS) {
    if (d.toLowerCase() === lower) return d;
  }
  // Handle "Central" vs "Center"
  if (lower === "central" || lower === "center") return "Center";
  if (lower === "tel-aviv" || lower === "tel aviv") return "Tel Aviv";
  return null;
};

interface CityPriceRow {
  city_name: string;
  district: string;
  avg_price_total: number | null;
  period: string;
}

export interface DistrictPricesData {
  nationalAvg: number | null;
  cheapestDistrict: string | null;
  cheapestPrice: number | null;
  mostExpensiveDistrict: string | null;
  mostExpensivePrice: number | null;
  ratio: number | null;
}

interface DistrictPricesProps {
  onDataLoaded?: (data: DistrictPricesData) => void;
}

const DistrictPrices = ({ onDataLoaded }: DistrictPricesProps) => {
  const [districts, setDistricts] = useState<{ name: string; price: number }[]>([]);
  const [nationalAvg, setNationalAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const isMobile = useIsMobile();
  const calledBack = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      // Get the latest period
      const { data: latestRow } = await supabase
        .from("city_prices")
        .select("period")
        .order("period", { ascending: false })
        .limit(1);

      if (!latestRow || latestRow.length === 0) {
        setLoading(false);
        return;
      }

      const latestPeriod = latestRow[0].period;

      // Get all rows for the latest period
      const { data: rows } = await supabase
        .from("city_prices")
        .select("city_name, district, avg_price_total, period")
        .eq("period", latestPeriod)
        .not("avg_price_total", "is", null);

      if (!rows || rows.length === 0) {
        setLoading(false);
        return;
      }

      const typedRows = rows as CityPriceRow[];

      // Find the national average ("Total" row)
      const totalRow = typedRows.find(
        (r) => r.city_name.toLowerCase() === "total" || r.city_name.toLowerCase() === "grand total"
      );
      if (totalRow?.avg_price_total != null) {
        setNationalAvg(totalRow.avg_price_total);
      }

      // Identify district-level rows
      // Strategy: rows where city_name matches a known district name pattern
      // AND is NOT an individual city within that district
      const districtData: { name: string; price: number }[] = [];

      for (const row of typedRows) {
        const normalized = normalizeDistrictName(row.city_name);
        if (normalized && row.avg_price_total != null) {
          // Avoid duplicates
          if (!districtData.find((d) => d.name === normalized)) {
            districtData.push({ name: normalized, price: row.avg_price_total });
          }
        }
      }

      // Sort highest to lowest
      districtData.sort((a, b) => b.price - a.price);
      setDistricts(districtData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Callback to parent
  useEffect(() => {
    if (!calledBack.current && districts.length > 0 && onDataLoaded) {
      const cheapest = districts[districts.length - 1];
      const mostExpensive = districts[0];
      const ratio = cheapest.price > 0 ? +(mostExpensive.price / cheapest.price).toFixed(1) : null;
      onDataLoaded({
        nationalAvg,
        cheapestDistrict: cheapest.name,
        cheapestPrice: cheapest.price,
        mostExpensiveDistrict: mostExpensive.name,
        mostExpensivePrice: mostExpensive.price,
        ratio,
      });
      calledBack.current = true;
    }
  }, [districts, nationalAvg, onDataLoaded]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-7 w-56 mb-4" />
        <Skeleton className="h-[280px]" />
      </div>
    );
  }

  if (districts.length === 0) {
    return (
      <div>
        <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">
          Average Prices by District
        </h3>
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">District price data coming soon</p>
        </Card>
      </div>
    );
  }

  const cheapest = districts[districts.length - 1];
  const mostExpensive = districts[0];
  const ratio = cheapest.price > 0 ? (mostExpensive.price / cheapest.price).toFixed(1) : null;

  const chartData = districts.map((d) => ({
    name: d.name,
    price: d.price,
  }));

  const ChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-cream border border-sage/20 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] font-body text-[13px]">
        <p className="text-charcoal font-semibold">{d.name}</p>
        <p className="text-charcoal">{formatPrice(d.price)}</p>
      </div>
    );
  };

  // Compute domain
  const maxPrice = Math.max(...districts.map((d) => d.price));
  const domainMax = Math.ceil(maxPrice / 500) * 500;

  return (
    <div>
      <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">
        Average Prices by District
      </h3>

      <div className="lg:flex lg:gap-8 lg:items-start">
        <div className="lg:w-[60%]">
          <div style={{ minHeight: 220 }} aria-label="Average home prices by district horizontal bar chart">
            <ResponsiveContainer width="100%" height={Math.max(220, districts.length * 48)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 50 }}>
                <CartesianGrid horizontal={false} vertical stroke={chartColors.gridLine} />
                <XAxis
                  type="number"
                  domain={[0, domainMax]}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatPrice(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: isMobile ? 10 : 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={isMobile ? 70 : 90}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="price" radius={[0, 4, 4, 0]} barSize={28}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={chartColors.horizonBlue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="font-body text-[12px] text-warm-gray mt-3">
            Source: CBS Dwelling Prices by District
          </p>
        </div>
        <div className="lg:w-[40%]">
          <InsightCard layout="inline">
            A home in the {mostExpensive.name} district costs roughly {ratio}× more than in the {cheapest.name}, Israel's most affordable region.
          </InsightCard>
        </div>
      </div>
    </div>
  );
};

export default DistrictPrices;
