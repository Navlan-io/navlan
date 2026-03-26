/*
 * DATA CHECK (March 2026):
 * ─────────────────────────
 * CPI Data:
 *   - The `price_indices` table stores CBS index data by index_code.
 *   - Need to verify which series codes are stored (general CPI vs rent sub-index 50010/120460).
 *   - This calculator queries all available data from price_indices.
 *   - TODO: If the general CPI series (not just the rent sub-index) isn't in the table,
 *     a new cron job is needed to fetch it from CBS. The rent sub-index (120460) is used
 *     as a fallback with a note to the user.
 *
 * Construction Costs Data:
 *   - The `construction_costs` table has code 200010 with normalization factor 1.387
 *     already applied to older data.
 *   - Data appears to be correctly normalized across base period changes.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

// ── Types ──

type IndexType = "cpi" | "construction";

interface IndexRecord {
  year: number;
  month: number;
  value: number;
}

// ── Helpers ──

function monthYearKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthYearLabel(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function fullMonthYearLabel(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatNis(amount: number): string {
  return amount.toLocaleString("en-IL", { maximumFractionDigits: 2 });
}

function parseMonthYear(value: string): { year: number; month: number } {
  const [y, m] = value.split("-").map(Number);
  return { year: y, month: m };
}

// ── Component ──

const MadadCalculatorPage = () => {
  // Index data
  const [cpiData, setCpiData] = useState<IndexRecord[]>([]);
  const [constructionData, setConstructionData] = useState<IndexRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataNote, setDataNote] = useState<string | null>(null);

  // Inputs
  const [indexType, setIndexType] = useState<IndexType>("cpi");
  const [baseAmount, setBaseAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [linkedPercentage, setLinkedPercentage] = useState(40);
  const [formulaOpen, setFormulaOpen] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CPI data — use the rent sub-component (code 50010) as the
        // closest available proxy for the general CPI. The general CPI series
        // is not currently in the database.
        // TODO: Add general CPI series via a new cron job. Until then, rent
        // sub-index (50010) is used with a note to the user.
        const { data: cpi } = await supabase
          .from("price_indices")
          .select("year, month, value")
          .eq("index_code", 50010)
          .not("value", "is", null)
          .order("year", { ascending: true })
          .order("month", { ascending: true });

        if (cpi && cpi.length > 0) {
          // Deduplicate by year-month (table may have duplicate rows)
          const cpiMap = new Map<string, IndexRecord>();
          for (const r of cpi) {
            const key = `${r.year}-${r.month}`;
            if (!cpiMap.has(key)) cpiMap.set(key, { year: r.year, month: r.month, value: r.value! });
          }
          setCpiData(Array.from(cpiMap.values()));
          setDataNote(
            "Note: This calculator currently uses the CBS rent price sub-index (code 50010), " +
            "not the full Consumer Price Index. Results closely approximate CPI for rent adjustments " +
            "but may differ slightly for other CPI-linked calculations."
          );
        }

        // Fetch construction costs data
        const { data: construction } = await supabase
          .from("construction_costs")
          .select("year, month, value")
          .eq("index_code", 200010)
          .not("value", "is", null)
          .order("year", { ascending: true })
          .order("month", { ascending: true });

        if (construction && construction.length > 0) {
          // Deduplicate by year-month
          const constMap = new Map<string, IndexRecord>();
          for (const r of construction) {
            const key = `${r.year}-${r.month}`;
            if (!constMap.has(key)) constMap.set(key, { year: r.year, month: r.month, value: r.value! });
          }
          setConstructionData(Array.from(constMap.values()));
        }
      } catch {
        // keep empty
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Active dataset
  const activeData = indexType === "cpi" ? cpiData : constructionData;

  // Date range
  const dateOptions = useMemo(() => {
    return activeData.map((d) => ({
      value: monthYearKey(d.year, d.month),
      label: monthYearLabel(d.year, d.month),
    }));
  }, [activeData]);

  // Set defaults when data loads or index type changes
  useEffect(() => {
    if (activeData.length > 0) {
      const last = activeData[activeData.length - 1];
      const lastKey = monthYearKey(last.year, last.month);

      if (!endDate || !activeData.some((d) => monthYearKey(d.year, d.month) === endDate)) {
        setEndDate(lastKey);
      }
      if (!startDate || !activeData.some((d) => monthYearKey(d.year, d.month) === startDate)) {
        // Default start date to 1 year before end
        const oneYearBefore = activeData.find(
          (d) => d.year === last.year - 1 && d.month === last.month
        );
        if (oneYearBefore) {
          setStartDate(monthYearKey(oneYearBefore.year, oneYearBefore.month));
        } else {
          setStartDate(monthYearKey(activeData[0].year, activeData[0].month));
        }
      }
    }
  }, [activeData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculations
  const amount = parseFloat(baseAmount.replace(/,/g, "")) || 0;

  const startRecord = useMemo(() => {
    if (!startDate) return null;
    const { year, month } = parseMonthYear(startDate);
    return activeData.find((d) => d.year === year && d.month === month) || null;
  }, [startDate, activeData]);

  const endRecord = useMemo(() => {
    if (!endDate) return null;
    const { year, month } = parseMonthYear(endDate);
    return activeData.find((d) => d.year === year && d.month === month) || null;
  }, [endDate, activeData]);

  const result = useMemo(() => {
    if (!startRecord || !endRecord || amount <= 0 || startRecord.value === 0) return null;

    const ratio = endRecord.value / startRecord.value;
    const changePct = (ratio - 1) * 100;

    if (indexType === "cpi") {
      const adjustedAmount = amount * ratio;
      const changeAmount = adjustedAmount - amount;
      return { adjustedAmount, changeAmount, changePct, ratio };
    } else {
      const indexedPortion = amount * (linkedPercentage / 100);
      const indexAdjustment = indexedPortion * (ratio - 1);
      const adjustedAmount = amount + indexAdjustment;
      const changeAmount = indexAdjustment;
      return {
        adjustedAmount,
        changeAmount,
        changePct,
        ratio,
        indexedPortion,
        indexAdjustment,
        nonIndexedPortion: amount - indexedPortion,
      };
    }
  }, [startRecord, endRecord, amount, indexType, linkedPercentage]);

  // Chart data
  const chartData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const startParsed = parseMonthYear(startDate);
    const endParsed = parseMonthYear(endDate);

    return activeData
      .filter((d) => {
        const key = monthYearKey(d.year, d.month);
        return key >= startDate && key <= endDate;
      })
      .map((d) => ({
        date: monthYearLabel(d.year, d.month),
        value: d.value,
        year: d.year,
        month: d.month,
        isStart: d.year === startParsed.year && d.month === startParsed.month,
        isEnd: d.year === endParsed.year && d.month === endParsed.month,
      }));
  }, [startDate, endDate, activeData]);

  // Validation
  const startAfterEnd = startDate && endDate && startDate > endDate;
  const sameDate = startDate && endDate && startDate === endDate;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Madad Calculator — CPI & Construction Index",
      description:
        "Calculate how much Israel's CPI or construction costs index has changed your rent, mortgage, or new construction payments.",
      url: "https://navlan.io/tools/madad-calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://navlan.io/tools/madad-calculator" },
        { "@type": "ListItem", position: 3, name: "Madad Calculator" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Madad Calculator — CPI & Construction Index Adjustment Tool | Navlan"
        description="Calculate how much Israel's CPI or construction costs index has changed your rent, mortgage, or new construction payments. Free tool using live CBS data."
        structuredData={structuredData}
      />
      <NavBar />

      <main id="main-content" className="bg-warm-white min-h-screen">
        <div className="container max-w-[900px] py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="font-body text-[13px] text-warm-gray mb-6">
            <Link to="/" className="hover:text-sage no-underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">Tools</span>
            <span className="mx-2">/</span>
            <span className="text-charcoal">Madad Calculator</span>
          </nav>

          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33]">
            Tools
          </span>
          <h1 className="font-heading font-bold text-[28px] md:text-[36px] text-charcoal mt-2">
            Madad Calculator
          </h1>
          <p className="font-body text-[16px] text-warm-gray mt-2 mb-8">
            Calculate how Israel's CPI or construction costs index affects your payments
          </p>

          {/* Index Toggle */}
          <div className="bg-cream rounded-xl border border-grid-line p-5 md:p-7 mb-6">
            <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-4">
              Select Index
            </h2>
            <div className="flex rounded-lg border border-grid-line overflow-hidden">
              <button
                onClick={() => setIndexType("cpi")}
                className={`flex-1 px-4 py-3 font-body text-[14px] font-medium transition-colors ${
                  indexType === "cpi"
                    ? "bg-sage text-white"
                    : "bg-white text-charcoal hover:bg-sage/5"
                }`}
              >
                Consumer Price Index (CPI)
              </button>
              <button
                onClick={() => setIndexType("construction")}
                className={`flex-1 px-4 py-3 font-body text-[14px] font-medium transition-colors border-l border-grid-line ${
                  indexType === "construction"
                    ? "bg-sage text-white"
                    : "bg-white text-charcoal hover:bg-sage/5"
                }`}
              >
                Construction Input Costs Index
              </button>
            </div>
            <p className="font-body text-[13px] text-warm-gray mt-2">
              {indexType === "cpi"
                ? "Affects rent, mortgages, arnona"
                : "Affects new construction milestone payments"}
            </p>
          </div>

          {/* Inputs */}
          <div className="bg-cream rounded-xl border border-grid-line p-5 md:p-7 mb-6">
            <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-5">
              Enter Details
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Base amount */}
              <div className="md:col-span-2">
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Base amount (₪)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 5,500 for monthly rent or 500,000 for a payment"
                  value={baseAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    if (raw === "") {
                      setBaseAmount("");
                    } else {
                      setBaseAmount(parseInt(raw).toLocaleString());
                    }
                  }}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-grid-line font-body text-[15px] text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>

              {/* Start date */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Contract start date
                </label>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-grid-line font-body text-[15px] text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  {dateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="font-body text-[12px] text-warm-gray mt-1">
                  When your contract was signed or the base amount was set
                </p>
              </div>

              {/* End date */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Adjustment date
                </label>
                <select
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-grid-line font-body text-[15px] text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                >
                  {dateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked percentage (construction only) */}
              {indexType === "construction" && (
                <div className="md:col-span-2">
                  <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                    Percentage of amount that is index-linked: {linkedPercentage}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={linkedPercentage}
                    onChange={(e) => setLinkedPercentage(parseInt(e.target.value))}
                    aria-label="Index-linked percentage"
                    className="w-full accent-sage"
                  />
                  <div className="flex justify-between font-body text-[12px] text-warm-gray mt-1">
                    <span>1%</span>
                    <span>100%</span>
                  </div>
                  <p className="font-body text-[12px] text-warm-gray mt-1">
                    Check your contract — since 2022, the maximum is typically 40%
                  </p>
                </div>
              )}
            </div>

            {/* Validation messages */}
            {startAfterEnd && (
              <p className="mt-3 font-body text-[13px] text-red-600">
                Start date must be before the end date.
              </p>
            )}
          </div>

          {/* Results */}
          {amount > 0 && startRecord && endRecord && !startAfterEnd && result && (
            <div className="bg-white rounded-xl border border-grid-line p-5 md:p-7 mb-6">
              <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-5">
                Result
              </h2>

              {/* Primary result */}
              <div className="text-center mb-6">
                <p className="font-body text-[14px] text-warm-gray mb-1">Adjusted Amount</p>
                <p className="font-heading font-bold text-[36px] md:text-[44px] text-charcoal">
                  ₪{formatNis(result.adjustedAmount)}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className={`font-body text-[16px] font-semibold ${result.changeAmount >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {result.changeAmount >= 0 ? "+" : ""}₪{formatNis(result.changeAmount)}
                  </span>
                  <span className={`font-body text-[14px] px-2 py-0.5 rounded ${result.changePct >= 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {result.changePct >= 0 ? "+" : ""}{result.changePct.toFixed(2)}%
                  </span>
                </div>
                {sameDate && (
                  <p className="font-body text-[13px] text-warm-gray mt-2">
                    Start and end dates are the same — no adjustment applied.
                  </p>
                )}
              </div>

              {/* Secondary info */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-cream rounded-lg p-4">
                  <p className="font-body text-[12px] uppercase tracking-wider text-warm-gray mb-1">
                    Start Index
                  </p>
                  <p className="font-heading font-semibold text-[20px] text-charcoal">
                    {startRecord.value.toFixed(1)}
                  </p>
                  <p className="font-body text-[13px] text-warm-gray">
                    {fullMonthYearLabel(startRecord.year, startRecord.month)}
                  </p>
                </div>
                <div className="bg-cream rounded-lg p-4">
                  <p className="font-body text-[12px] uppercase tracking-wider text-warm-gray mb-1">
                    End Index
                  </p>
                  <p className="font-heading font-semibold text-[20px] text-charcoal">
                    {endRecord.value.toFixed(1)}
                  </p>
                  <p className="font-body text-[13px] text-warm-gray">
                    {fullMonthYearLabel(endRecord.year, endRecord.month)}
                  </p>
                </div>
              </div>

              {/* Formula breakdown */}
              <div className="border border-grid-line rounded-lg overflow-hidden">
                <button
                  onClick={() => setFormulaOpen(!formulaOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-cream hover:bg-cream/80 transition-colors"
                >
                  <span className="font-body text-[14px] font-medium text-charcoal">
                    Formula Breakdown
                  </span>
                  {formulaOpen ? (
                    <ChevronUp className="h-4 w-4 text-warm-gray" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-warm-gray" />
                  )}
                </button>
                {formulaOpen && (
                  <div className="px-4 py-4 bg-white font-mono text-[13px] text-charcoal leading-relaxed space-y-1">
                    {indexType === "cpi" ? (
                      <>
                        <p>Start index ({fullMonthYearLabel(startRecord.year, startRecord.month)}): {startRecord.value.toFixed(1)}</p>
                        <p>End index ({fullMonthYearLabel(endRecord.year, endRecord.month)}): {endRecord.value.toFixed(1)}</p>
                        <p>Change: ({endRecord.value.toFixed(1)} ÷ {startRecord.value.toFixed(1)}) - 1 = {result.changePct >= 0 ? "+" : ""}{result.changePct.toFixed(2)}%</p>
                        <div className="h-px bg-grid-line my-2" />
                        <p>Original amount: ₪{formatNis(amount)}</p>
                        <p>Adjusted amount: ₪{formatNis(amount)} × ({endRecord.value.toFixed(1)} ÷ {startRecord.value.toFixed(1)}) = ₪{formatNis(result.adjustedAmount)}</p>
                        <p>Difference: {result.changeAmount >= 0 ? "+" : ""}₪{formatNis(result.changeAmount)}</p>
                      </>
                    ) : (
                      <>
                        <p>Start index ({fullMonthYearLabel(startRecord.year, startRecord.month)}): {startRecord.value.toFixed(1)}</p>
                        <p>End index ({fullMonthYearLabel(endRecord.year, endRecord.month)}): {endRecord.value.toFixed(1)}</p>
                        <p>Change: ({endRecord.value.toFixed(1)} ÷ {startRecord.value.toFixed(1)}) - 1 = {result.changePct >= 0 ? "+" : ""}{result.changePct.toFixed(2)}%</p>
                        <div className="h-px bg-grid-line my-2" />
                        <p>Original payment: ₪{formatNis(amount)}</p>
                        <p>Index-linked portion ({linkedPercentage}%): ₪{formatNis(result.indexedPortion!)}</p>
                        <p>Index adjustment: ₪{formatNis(result.indexedPortion!)} × {result.changePct.toFixed(2)}% = {result.indexAdjustment! >= 0 ? "+" : ""}₪{formatNis(result.indexAdjustment!)}</p>
                        <p>Non-indexed portion: ₪{formatNis(result.nonIndexedPortion!)}</p>
                        <div className="h-px bg-grid-line my-2" />
                        <p>Total adjusted payment: ₪{formatNis(amount)} + {result.indexAdjustment! >= 0 ? "" : "-"}₪{formatNis(Math.abs(result.indexAdjustment!))} = ₪{formatNis(result.adjustedAmount)}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Negative index note for construction */}
              {indexType === "construction" && result.changePct < 0 && (
                <div className="flex gap-3 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-body text-[13px] text-amber-800">
                    Note: Standard developer contracts may not reduce the price even if the index falls. The contract signing price typically acts as a floor.
                  </p>
                </div>
              )}

              {/* Chart */}
              {chartData.length > 1 && (
                <div className="mt-6">
                  <h3 className="font-heading font-semibold text-[16px] text-charcoal mb-3">
                    Index Movement
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#8A8378" }}
                          tickLine={false}
                          interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#8A8378" }}
                          tickLine={false}
                          domain={["auto", "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#FAF8F5",
                            border: "1px solid #E5E0D8",
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                          formatter={(value: number) => [value.toFixed(1), "Index Value"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#6B8F71"
                          strokeWidth={2}
                          dot={false}
                        />
                        {/* Start point */}
                        {chartData.length > 0 && chartData[0] && (
                          <ReferenceDot
                            x={chartData[0].date}
                            y={chartData[0].value}
                            r={5}
                            fill="#4A7F8B"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        )}
                        {/* End point */}
                        {chartData.length > 1 && (
                          <ReferenceDot
                            x={chartData[chartData.length - 1].date}
                            y={chartData[chartData.length - 1].value}
                            r={5}
                            fill="#4A7F8B"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data note */}
          {dataNote && indexType === "cpi" && (
            <div className="flex gap-3 p-4 bg-cream rounded-lg border border-grid-line mb-6">
              <Info className="h-5 w-5 text-warm-gray shrink-0 mt-0.5" />
              <p className="font-body text-[13px] text-warm-gray">{dataNote}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-sage/30 border-t-sage rounded-full animate-spin mx-auto" />
              <p className="font-body text-[14px] text-warm-gray mt-3">Loading index data...</p>
            </div>
          )}

          {/* No data state */}
          {!loading && activeData.length === 0 && (
            <div className="bg-cream rounded-xl border border-grid-line p-8 text-center mb-6">
              <p className="font-body text-[15px] text-warm-gray">
                {indexType === "cpi"
                  ? "CPI data is not yet available. Check the CBS website for current values."
                  : "Construction costs index data is not yet available. Check the CBS website for current values."}
              </p>
            </div>
          )}

          {/* Related links */}
          <div className="bg-cream rounded-xl border border-grid-line p-5 md:p-7 mb-6">
            <h2 className="font-heading font-semibold text-[18px] text-charcoal mb-3">
              Learn More
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                to="/guides/madad"
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-grid-line font-body text-[14px] text-charcoal no-underline hover:border-sage/30 transition-colors"
              >
                → Understanding the Madad Guide
              </Link>
              <Link
                to="/guides/renting"
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-grid-line font-body text-[14px] text-charcoal no-underline hover:border-sage/30 transition-colors"
              >
                → Renting in Israel Guide
              </Link>
              <Link
                to="/guides/mortgages"
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-grid-line font-body text-[14px] text-charcoal no-underline hover:border-sage/30 transition-colors"
              >
                → Israeli Mortgages Guide
              </Link>
              <Link
                to="/market"
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-grid-line font-body text-[14px] text-charcoal no-underline hover:border-sage/30 transition-colors"
              >
                → Market Data
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-cream-dark rounded-xl border border-grid-line p-5 md:p-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-sand-gold shrink-0 mt-0.5" />
              <p className="font-body text-[14px] text-charcoal leading-relaxed">
                This calculator is for informational purposes only. It uses published CBS index data and does not account for contract-specific terms, caps, or adjustments. Always verify with your lawyer or financial advisor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MadadCalculatorPage;
