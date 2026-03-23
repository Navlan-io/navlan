import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, AlertTriangle, ArrowRight } from "lucide-react";

// ── Types ──

type BuyerType = "first" | "upgrade" | "non_resident";

interface TrackConfig {
  id: string;
  label: string;
  seriesKey: string;
  trackType: string;
  description: string;
  note: string;
}

interface RateData {
  rate: number;
  period: string;
}

// ── Constants ──

const LTV_LIMITS: Record<BuyerType, number> = {
  first: 75,
  upgrade: 70,
  non_resident: 50,
};

const BUYER_LABELS: Record<BuyerType, string> = {
  first: "Israeli Resident (first home)",
  upgrade: "Israeli Resident (own another property)",
  non_resident: "Non-Resident / Additional Property",
};

const TRACKS: TrackConfig[] = [
  {
    id: "non_indexed_fixed",
    label: "Non-indexed Fixed",
    seriesKey: "BNK_99034_LR_BIR_MRTG_467",
    trackType: "non_indexed_fixed",
    description: "Fixed monthly payment for full term",
    note: "Fixed",
  },
  {
    id: "cpi_fixed",
    label: "CPI-indexed Fixed",
    seriesKey: "BNK_99034_LR_BIR_MRTG_1492",
    trackType: "cpi_fixed",
    description: "Lower rate but principal adjusts with inflation",
    note: "Initial — adjusts annually with CPI",
  },
  {
    id: "prime",
    label: "Prime-linked",
    seriesKey: "BNK_99034_LR_BIR_MRTG_348",
    trackType: "prime_variable",
    description: "Based on Prime rate. Typically Prime \u00B1 spread, negotiated with your bank. Changes with BOI policy rate.",
    note: "Adjusts with BOI policy rate",
  },
  {
    id: "fixed_period",
    label: "Fixed-for-period",
    seriesKey: "BNK_99034_LR_BIR_MRTG_689",
    trackType: "fx_indexed",
    description: "Fixed for initial period (typically 5 years), then adjusts",
    note: "Fixed for initial period",
  },
];

const DEFAULT_ALLOCATIONS: Record<string, number> = {
  non_indexed_fixed: 34,
  cpi_fixed: 33,
  prime: 33,
  fixed_period: 0,
};

// ── Helpers ──

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const r = annualRate / 12 / 100;
  const n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function formatNis(amount: number): string {
  return amount.toLocaleString("en-IL", { maximumFractionDigits: 0 });
}

function formatPeriodLabel(period: string): string {
  // period may be "2026-01" or "2026-01-01"
  const parts = period.split("-");
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ── Component ──

const MortgageCalculatorPage = () => {
  const { currency, rates: exchangeRates } = useCurrency();

  // Input state
  const [propertyPrice, setPropertyPrice] = useState<string>("");
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [buyerType, setBuyerType] = useState<BuyerType>("first");
  const [isOleh, setIsOleh] = useState(false);
  const [loanYears, setLoanYears] = useState(20);

  // Track allocations
  const [allocations, setAllocations] = useState<Record<string, number>>(DEFAULT_ALLOCATIONS);

  // Data state
  const [rateData, setRateData] = useState<Record<string, RateData>>({});
  const [loadingRates, setLoadingRates] = useState(true);

  // Fetch mortgage rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data: latestRate } = await supabase
          .from("mortgage_rates")
          .select("period")
          .order("period", { ascending: false })
          .limit(1);

        if (!latestRate || latestRate.length === 0) {
          setLoadingRates(false);
          return;
        }

        const latestPeriod = latestRate[0].period;

        const { data: rates } = await supabase
          .from("mortgage_rates")
          .select("series_key, value, period")
          .eq("period", latestPeriod)
          .in("series_key", TRACKS.map((t) => t.seriesKey));

        if (rates) {
          const map: Record<string, RateData> = {};
          for (const row of rates) {
            const track = TRACKS.find((t) => t.seriesKey === row.series_key);
            if (track && row.value != null) {
              map[track.id] = { rate: row.value, period: row.period };
            }
          }
          setRateData(map);
        }
      } catch {
        // keep empty
      }
      setLoadingRates(false);
    };
    fetchRates();
  }, []);

  // Derived values
  const price = parseFloat(propertyPrice.replace(/,/g, "")) || 0;
  const maxLtv = LTV_LIMITS[buyerType];
  const minDownPct = 100 - maxLtv;
  const effectiveDownPct = Math.max(downPaymentPct, minDownPct);
  const loanAmount = price * (1 - effectiveDownPct / 100);
  const isOverLtv = downPaymentPct < minDownPct;

  // Currency conversion helper
  const convertAmount = (nisAmount: number): string => {
    let value = nisAmount;
    let symbol = "₪";
    if (currency === "$") {
      value = nisAmount / exchangeRates.USD;
      symbol = "$";
    } else if (currency === "€") {
      value = nisAmount / exchangeRates.EUR;
      symbol = "€";
    }
    return `${symbol}${formatNis(value)}`;
  };

  // Calculate results per track
  const results = useMemo(() => {
    return TRACKS.map((track) => {
      const alloc = allocations[track.id] || 0;
      const principal = loanAmount * (alloc / 100);
      const rd = rateData[track.id];
      const rate = rd?.rate ?? 0;
      const monthly = calcMonthlyPayment(principal, rate, loanYears);
      return {
        track,
        allocation: alloc,
        principal,
        rate,
        monthly,
      };
    });
  }, [allocations, loanAmount, rateData, loanYears]);

  const totalMonthly = results.reduce((sum, r) => sum + r.monthly, 0);
  const allocationSum = Object.values(allocations).reduce((a, b) => a + b, 0);

  const ratePeriodLabel = Object.values(rateData)[0]
    ? formatPeriodLabel(Object.values(rateData)[0].period)
    : null;

  // Handle allocation change — adjust others proportionally
  const handleAllocationChange = (trackId: string, newValue: number) => {
    const clamped = Math.min(100, Math.max(0, newValue));
    const otherTracks = TRACKS.filter((t) => t.id !== trackId);
    const otherSum = otherTracks.reduce((sum, t) => sum + (allocations[t.id] || 0), 0);
    const remaining = 100 - clamped;

    const newAllocations: Record<string, number> = { [trackId]: clamped };

    if (otherSum === 0) {
      // Distribute remaining equally among others
      const each = Math.floor(remaining / otherTracks.length);
      otherTracks.forEach((t, i) => {
        newAllocations[t.id] = i === otherTracks.length - 1
          ? remaining - each * (otherTracks.length - 1)
          : each;
      });
    } else {
      // Scale proportionally
      let distributed = 0;
      otherTracks.forEach((t, i) => {
        if (i === otherTracks.length - 1) {
          newAllocations[t.id] = remaining - distributed;
        } else {
          const proportion = (allocations[t.id] || 0) / otherSum;
          const val = Math.round(remaining * proportion);
          newAllocations[t.id] = val;
          distributed += val;
        }
      });
    }

    setAllocations(newAllocations);
  };

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Israeli Mortgage Calculator",
      description: "Estimate monthly mortgage payments using current Bank of Israel average rates",
      url: "https://navlan.io/tools/mortgage-calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://navlan.io/tools/mortgage-calculator" },
        { "@type": "ListItem", position: 3, name: "Mortgage Calculator" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Israeli Mortgage Calculator | Navlan"
        description="Calculate Israeli mortgage payments with current Bank of Israel rates. Supports fixed, CPI-indexed, and Prime-linked tracks with purchase tax estimates."
        structuredData={structuredData}
      />
      <NavBar />

      <main id="main-content" className="bg-warm-white min-h-screen">
        <div className="container max-w-[900px] py-10 md:py-14">
          {/* Header */}
          <nav className="font-body text-[13px] text-warm-gray mb-6">
            <Link to="/" className="hover:text-sage no-underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">Tools</span>
            <span className="mx-2">/</span>
            <span className="text-charcoal">Mortgage Calculator</span>
          </nav>

          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33]">
            Tools
          </span>
          <h1 className="font-heading font-bold text-[28px] md:text-[36px] text-charcoal mt-2">
            Israeli Mortgage Calculator
          </h1>
          <p className="font-body text-[16px] text-warm-gray mt-2 mb-8">
            Estimate your monthly payments using current Bank of Israel average rates
          </p>

          {/* Disclaimer */}
          <div className="bg-cream-dark rounded-xl border border-grid-line p-5 md:p-6 mb-8">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-sand-gold shrink-0 mt-0.5" />
              <p className="font-body text-[14px] text-charcoal leading-relaxed">
                This calculator provides estimates only. Rates shown are Bank of Israel averages across all banks — your actual rate will depend on your bank, credit profile, and negotiation. CPI-indexed and Prime-linked payments are initial estimates that will change over time. This tool is not financial advice. Consult a licensed mortgage advisor (<span className="italic">yoetz mashkantaot</span>) before making decisions.
              </p>
            </div>
          </div>

          {/* Step 1: Property & Buyer Info */}
          <div className="bg-cream rounded-xl border border-grid-line p-5 md:p-7 mb-6">
            <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-5">
              Property & Buyer Info
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Property price */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Property price ({currency})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 2,500,000"
                  value={propertyPrice}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    if (raw === "") {
                      setPropertyPrice("");
                    } else {
                      setPropertyPrice(parseInt(raw).toLocaleString());
                    }
                  }}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-grid-line font-body text-[15px] text-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
                {currency !== "₪" && price > 0 && (
                  <p className="font-body text-[12px] text-warm-gray mt-1">
                    Enter amount in ₪ — results shown in {currency}
                  </p>
                )}
              </div>

              {/* Down payment */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Down payment: {effectiveDownPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={effectiveDownPct}
                  onChange={(e) => setDownPaymentPct(parseInt(e.target.value))}
                  className="w-full accent-sage"
                />
                <div className="flex justify-between font-body text-[12px] text-warm-gray mt-1">
                  <span>0%</span>
                  <span>80%</span>
                </div>
              </div>
            </div>

            {/* Buyer type */}
            <div className="mt-5">
              <label className="font-body text-[14px] font-medium text-charcoal block mb-2">
                Buyer type
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                {(Object.entries(BUYER_LABELS) as [BuyerType, string][]).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors font-body text-[14px] ${
                      buyerType === value
                        ? "border-sage bg-sage/5 text-charcoal"
                        : "border-grid-line bg-white text-warm-gray hover:border-sage/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="buyerType"
                      value={value}
                      checked={buyerType === value}
                      onChange={() => setBuyerType(value)}
                      className="accent-sage"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {buyerType === "upgrade" && (
                <p className="font-body text-[13px] text-warm-gray mt-2">
                  Already own a property in Israel? LTV is capped at 70% until you sell.
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">
              {/* Oleh toggle */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-2">
                  Are you an oleh?
                </label>
                <div className="flex gap-2">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setIsOleh(val)}
                      className={`px-5 py-2 rounded-lg border font-body text-[14px] transition-colors ${
                        isOleh === val
                          ? "border-sage bg-sage/5 text-charcoal"
                          : "border-grid-line bg-white text-warm-gray hover:border-sage/30"
                      }`}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan term */}
              <div>
                <label className="font-body text-[14px] font-medium text-charcoal block mb-1.5">
                  Loan term: {loanYears} years
                </label>
                <input
                  type="range"
                  min={4}
                  max={30}
                  value={loanYears}
                  onChange={(e) => setLoanYears(parseInt(e.target.value))}
                  className="w-full accent-sage"
                />
                <div className="flex justify-between font-body text-[12px] text-warm-gray mt-1">
                  <span>4 years</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Constraints */}
          {price > 0 && (
            <div className="bg-white rounded-xl border border-grid-line p-5 md:p-6 mb-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="font-body text-[12px] uppercase tracking-wider text-warm-gray mb-1">
                    Max LTV Allowed
                  </p>
                  <p className="font-heading font-semibold text-[20px] text-charcoal">
                    {maxLtv}%
                  </p>
                </div>
                <div>
                  <p className="font-body text-[12px] uppercase tracking-wider text-warm-gray mb-1">
                    Loan Amount
                  </p>
                  <p className="font-heading font-semibold text-[20px] text-charcoal">
                    {convertAmount(loanAmount)}
                  </p>
                </div>
                <div>
                  <p className="font-body text-[12px] uppercase tracking-wider text-warm-gray mb-1">
                    Down Payment
                  </p>
                  <p className="font-heading font-semibold text-[20px] text-charcoal">
                    {convertAmount(price * effectiveDownPct / 100)}
                  </p>
                </div>
              </div>

              {isOverLtv && (
                <div className="mt-4 flex items-start gap-2 bg-terra-red/5 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-terra-red shrink-0 mt-0.5" />
                  <p className="font-body text-[13px] text-terra-red">
                    Your down payment is below the minimum {minDownPct}% required for {BUYER_LABELS[buyerType].toLowerCase()} buyers. Adjusted to {minDownPct}%.
                  </p>
                </div>
              )}

              <p className="font-body text-[12px] text-warm-gray mt-3">
                PTI (payment-to-income) cap: 50% — banks will not approve monthly payments exceeding half your household income.
              </p>
            </div>
          )}

          {/* Oleh note */}
          {isOleh && (
            <div className="bg-sage/5 rounded-xl border border-sage/20 p-5 mb-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-[14px] font-medium text-charcoal mb-1">
                    Mashkanta Zakaut (subsidized mortgage)
                  </p>
                  <p className="font-body text-[14px] text-warm-gray leading-relaxed">
                    As an oleh, you may qualify for a subsidized loan (mashkanta zakaut) of ~₪200,000 at reduced rates, within 15 years of aliyah. Terms vary based on your specific situation. This benefit is not calculated below — consult your bank or a mortgage advisor for details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Track Selection */}
          <div className="bg-cream rounded-xl border border-grid-line p-5 md:p-7 mb-6">
            <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-1">
              Mortgage Track Mix
            </h2>
            <p className="font-body text-[14px] text-warm-gray mb-5">
              Example split — adjust to your preference
            </p>

            {loadingRates ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {TRACKS.map((track) => {
                  const rd = rateData[track.id];
                  return (
                    <div
                      key={track.id}
                      className="bg-white rounded-lg border border-grid-line p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="font-body text-[15px] font-medium text-charcoal">
                            {track.label}
                          </p>
                          <p className="font-body text-[13px] text-warm-gray">
                            {track.description}
                          </p>
                        </div>
                        <div className="text-right">
                          {rd ? (
                            <p className="font-heading font-semibold text-[18px] text-sage">
                              {rd.rate.toFixed(2)}%
                            </p>
                          ) : (
                            <p className="font-body text-[14px] text-warm-gray">N/A</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={allocations[track.id] || 0}
                          onChange={(e) =>
                            handleAllocationChange(track.id, parseInt(e.target.value))
                          }
                          className="flex-1 accent-sage"
                        />
                        <div className="flex items-center gap-1 min-w-[60px]">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={allocations[track.id] || 0}
                            onChange={(e) =>
                              handleAllocationChange(track.id, parseInt(e.target.value) || 0)
                            }
                            className="w-[48px] h-8 px-2 rounded border border-grid-line font-body text-[14px] text-charcoal text-center focus:outline-none focus:ring-1 focus:ring-sage/30"
                          />
                          <span className="font-body text-[14px] text-warm-gray">%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {allocationSum !== 100 && (
                  <div className="flex items-center gap-2 bg-terra-red/5 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 text-terra-red shrink-0" />
                    <p className="font-body text-[13px] text-terra-red">
                      Track allocations must sum to 100% (currently {allocationSum}%)
                    </p>
                  </div>
                )}
              </div>
            )}

            {ratePeriodLabel && (
              <p className="font-body text-[12px] text-warm-gray mt-4">
                Rates as of {ratePeriodLabel} (BOI average across all banks)
              </p>
            )}
          </div>

          {/* Results */}
          {price > 0 && loanAmount > 0 && allocationSum === 100 && (
            <div className="bg-cream rounded-xl border-2 border-sand-gold/30 p-5 md:p-7 mb-6">
              <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-5">
                Estimated Monthly Payment
              </h2>

              {/* Disclaimer in results */}
              <div className="bg-cream-dark rounded-lg p-3 mb-5">
                <p className="font-body text-[12px] text-warm-gray leading-relaxed">
                  These are estimates based on BOI average rates. Your actual rate will depend on your bank and credit profile. CPI-indexed and Prime-linked payments will change over time.
                </p>
              </div>

              {/* Per-track breakdown */}
              <div className="space-y-3 mb-6">
                {results.map((r) => {
                  if (r.allocation === 0) return null;
                  return (
                    <div
                      key={r.track.id}
                      className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-grid-line"
                    >
                      <div>
                        <p className="font-body text-[14px] text-charcoal">
                          {r.track.label}
                          <span className="text-warm-gray ml-1">({r.allocation}%)</span>
                        </p>
                        <p className="font-body text-[12px] text-warm-gray">
                          {r.track.note}
                        </p>
                      </div>
                      <p className="font-heading font-semibold text-[18px] text-charcoal">
                        {convertAmount(r.monthly)}
                        <span className="font-body text-[12px] text-warm-gray font-normal">/mo</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="bg-sage/5 rounded-xl border border-sage/20 p-5 mb-6">
                <div className="flex items-center justify-between">
                  <p className="font-body text-[16px] font-medium text-charcoal">
                    Total estimated monthly payment
                  </p>
                  <p className="font-heading font-bold text-[28px] md:text-[32px] text-sage">
                    {convertAmount(totalMonthly)}
                    <span className="font-body text-[14px] text-warm-gray font-normal">/mo</span>
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Mortgage Guide CTA */}
          <Link
            to="/guides/mortgages"
            className="flex items-center justify-between bg-cream rounded-xl border border-grid-line p-5 mb-8 no-underline hover:border-sage/30 transition-colors group"
          >
            <div>
              <p className="font-body text-[15px] font-medium text-charcoal group-hover:text-sage transition-colors">
                Read our full mortgage guide
              </p>
              <p className="font-body text-[13px] text-warm-gray">
                Everything you need to know about getting a mortgage in Israel
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-warm-gray group-hover:text-sage transition-colors shrink-0" />
          </Link>

          {/* Newsletter */}
          <div className="my-10 bg-cream rounded-xl border border-grid-line p-6 md:p-8 text-center">
            <p className="font-heading font-semibold text-[18px] md:text-[20px] text-charcoal mb-2">
              Getting useful insights? Get them monthly.
            </p>
            <p className="font-body text-[15px] text-warm-gray mb-5">
              CBS data explained in plain English — free, no spam, unsubscribe anytime.
            </p>
            <div className="max-w-sm mx-auto">
              <NewsletterSignup source="market" />
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="border-t border-grid-line pt-6 mb-4">
            <p className="font-body text-[12px] text-warm-gray leading-relaxed">
              <strong>Disclaimer:</strong> This calculator provides estimates only. Rates shown are Bank of Israel averages across all banks — your actual rate will depend on your bank, credit profile, and negotiation. CPI-indexed and Prime-linked payments are initial estimates that will change over time. This tool is not financial advice. Consult a licensed mortgage advisor (yoetz mashkantaot) before making decisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MortgageCalculatorPage;
