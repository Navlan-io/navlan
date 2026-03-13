import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

interface MortgageRow {
  track_label: string;
  track_type: string;
  rate_type: string;
  value: number | null;
}

// Prime rate is hardcoded for now — TODO V1.5: fetch from BOI
const PRIME_RATE = 6.0;

const TRACK_NOTES: Record<string, string> = {
  "non_indexed_fixed": "Most common track",
  "prime_variable": `Effective: ~${(PRIME_RATE + 0.85).toFixed(2)}% (Prime ${PRIME_RATE.toFixed(1)}% + margin)`,
  "cpi_fixed": "Real rate; actual payments increase with CPI",
  "cpi_variable": "Lower initial rate, inflation risk",
  "non_indexed_combined": "Blended fixed/variable",
};

const MortgageRates = () => {
  const [rates, setRates] = useState<MortgageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get the latest period
      const { data: latestRow } = await supabase
        .from("mortgage_rates")
        .select("period")
        .order("period", { ascending: false })
        .limit(1);

      if (!latestRow || latestRow.length === 0) {
        setLoading(false);
        return;
      }

      const latestPeriod = latestRow[0].period;

      const { data } = await supabase
        .from("mortgage_rates")
        .select("track_label, track_type, rate_type, value")
        .eq("period", latestPeriod);

      setRates((data as MortgageRow[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section>
        <Skeleton className="h-8 w-56 mb-4" />
        <Skeleton className="h-[200px]" />
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-heading font-semibold text-[22px] text-charcoal mb-1">Current Mortgage Rates</h2>
      <p className="font-body text-[15px] text-warm-gray mb-6">
        Average aggregate rates across all banks, published by Bank of Israel
      </p>

      {rates.length === 0 ? (
        <Card className="p-8 bg-cream border-0 text-center">
          <p className="font-body text-warm-gray">Data coming soon</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream hover:bg-cream">
                <TableHead className="font-body font-medium text-warm-gray">Mortgage Track</TableHead>
                <TableHead className="font-body font-medium text-warm-gray">Rate</TableHead>
                <TableHead className="font-body font-medium text-warm-gray text-[13px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((r) => (
                <TableRow key={r.track_type}>
                  <TableCell className="font-body text-[15px] text-charcoal">{r.track_label}</TableCell>
                  <TableCell className="font-body text-[15px] text-charcoal font-semibold">
                    {r.value != null
                      ? r.rate_type === "margin"
                        ? `+${r.value.toFixed(2)}% margin`
                        : `${r.value.toFixed(2)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="font-body text-[13px] text-warm-gray">
                    {TRACK_NOTES[r.track_type] ?? ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="font-body text-[12px] text-warm-gray mt-4">
        Prime rate as of Dec 2025: {PRIME_RATE.toFixed(1)}%
      </p>

      <p className="font-body text-[12px] text-warm-gray mt-1">
        Source: Bank of Israel — Aggregate Mortgage Rate Statistics
      </p>

      <Card className="mt-6 p-5 bg-cream border-0 border-l-4 border-l-sage shadow-card">
        <p className="font-body text-[14px] text-charcoal">
          Israeli mortgages are structured differently than in the US/UK. Most borrowers use a mix of 3–4 tracks.
          Consult a licensed mortgage advisor for personalized planning.
        </p>
      </Card>
    </section>
  );
};

export default MortgageRates;
