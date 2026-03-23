import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Live-data hook — fetches latest exchange rates from Supabase       */
/* ------------------------------------------------------------------ */

interface ExchangeRateData {
  usd: number | null;
  eur: number | null;
  gbp: number | null;
  asOf: string | null;
  loading: boolean;
}

function useExchangeRates(): ExchangeRateData {
  const [data, setData] = useState<ExchangeRateData>({
    usd: null, eur: null, gbp: null, asOf: null, loading: true,
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data: rows } = await supabase
          .from("exchange_rates")
          .select("currency, rate, rate_date")
          .in("currency", ["USD", "EUR", "GBP"])
          .order("rate_date", { ascending: false })
          .limit(3);

        if (!rows || rows.length === 0) {
          setData(d => ({ ...d, loading: false }));
          return;
        }

        const usd = rows.find(r => r.currency === "USD")?.rate ?? null;
        const eur = rows.find(r => r.currency === "EUR")?.rate ?? null;
        const gbp = rows.find(r => r.currency === "GBP")?.rate ?? null;
        const asOf = rows[0]?.rate_date
          ? new Date(rows[0].rate_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : null;

        setData({ usd, eur, gbp, asOf, loading: false });
      } catch {
        setData(d => ({ ...d, loading: false }));
      }
    };
    fetchRates();
  }, []);

  return data;
}

/* ------------------------------------------------------------------ */
/*  Inline live-value component                                        */
/* ------------------------------------------------------------------ */

const LiveValue = ({ value, prefix = "", suffix = "" }: { value: number | null; prefix?: string; suffix?: string }) => {
  if (value == null) return <span className="text-warm-gray">—</span>;
  return (
    <span className="text-horizon-blue font-semibold">
      {prefix}{value.toFixed(2)}{suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const ExchangeRateGuidePage = () => {
  const rates = useExchangeRates();

  /* ---------------------------------------------------------------- */
  /*  TL;DR                                                            */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• If you earn in USD, GBP, or EUR and buy in shekels, the exchange rate directly changes what you pay — same apartment, different price depending on when you transfer.</li>
        <li>• On a ₪2.5M apartment, the difference between a strong and weak dollar can be $100,000+ in either direction.</li>
        <li>• The down payment is where this hits hardest — a 30% down payment of ₪750K can swing by $30,000–$50,000 depending on the rate.</li>
        <li>• Don't try to time the market. Instead, understand your exposure and use practical tools: currency transfer specialists, rate alerts, and staged transfers.</li>
        <li>• Banks typically charge 2–4% spread on international transfers; specialist services charge roughly 0.3–0.5%. On a large transfer, that's thousands of dollars in savings.</li>
        <li>• If you're paying a mortgage in shekels while earning abroad, the rate affects your effective monthly payment every single month — not just at purchase.</li>
        <li>• Budget with a buffer. Never plan your purchase assuming today's rate will hold.</li>
      </ul>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Live rates display                                               */
  /* ---------------------------------------------------------------- */

  const ratesBox = !rates.loading && rates.usd ? (
    <CalloutBox title={`Current Exchange Rates${rates.asOf ? ` (as of ${rates.asOf})` : ''}`}>
      <div className="flex flex-wrap gap-6 mt-2">
        <div><span className="text-warm-gray">USD/ILS:</span> <LiveValue value={rates.usd} /></div>
        <div><span className="text-warm-gray">EUR/ILS:</span> <LiveValue value={rates.eur} /></div>
        <div><span className="text-warm-gray">GBP/ILS:</span> <LiveValue value={rates.gbp} /></div>
      </div>
      <p className="mt-2 text-[13px] text-warm-gray">Source: Bank of Israel. See <Link to="/market" className="text-horizon-blue hover:underline">Market Data</Link> for trends.</p>
    </CalloutBox>
  ) : null;

  const headerContent = <>{tldr}{ratesBox}</>;

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "the-setup",
      title: "The Setup — Why This Matters for Anglos",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            Here's the fundamental exposure: you earn in one currency and buy in another. Your salary, savings, and financial planning are denominated in USD, GBP, or EUR. The apartment, the mortgage, the arnona, the lawyer, the purchase tax — all denominated in Israeli shekels (NIS/ILS).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            That gap between your currency and the shekel is where real money gets made or lost.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>How much has the rate moved?</strong> Over the past three years, the NIS exchange rates have swung dramatically:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Currency Pair</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Approx. Low (2023–2026)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Approx. High (2023–2026)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">NIS/USD</td>
                  <td className="py-2 px-3 text-charcoal">~3.06 (Feb 2026)</td>
                  <td className="py-2 px-3 text-charcoal">~4.08 (Oct 2023)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">NIS/EUR</td>
                  <td className="py-2 px-3 text-charcoal">~3.40</td>
                  <td className="py-2 px-3 text-charcoal">~4.35</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">NIS/GBP</td>
                  <td className="py-2 px-3 text-charcoal">~3.90</td>
                  <td className="py-2 px-3 text-charcoal">~5.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!rates.loading && rates.usd && (
            <p className="text-charcoal leading-relaxed mb-4">
              As of {rates.asOf ?? "the latest data"}, the current rates are: USD/ILS <LiveValue value={rates.usd} />, EUR/ILS <LiveValue value={rates.eur} />, GBP/ILS <LiveValue value={rates.gbp} />.
            </p>
          )}

          <p className="text-charcoal leading-relaxed">
            That NIS/USD range — from roughly 3.06 to 4.08 — represents a swing of over 30%. On a property purchase, that's not a rounding error. It's a different apartment.
          </p>
        </>
      ),
    },
    {
      id: "the-math",
      title: "The Math, Made Concrete",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            Let's take a ₪2,500,000 apartment — a reasonable price point for the cities most Anglos are looking at. Here's what it costs at three different exchange rates.
          </p>

          {/* USD Table */}
          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">USD Buyer</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">NIS/USD Rate</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Apartment Price (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Cost in USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.30</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$757,576</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.60</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$694,444</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.90</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$641,026</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The swing: $116,550</strong> — on the exact same apartment.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            At 3.30 shekels to the dollar, you're paying over $757K. At 3.90, you're paying $641K.
          </p>

          <PullQuote>
            That's not a different apartment. It's the same four walls, the same mamad, the same parking spot.
          </PullQuote>

          {/* GBP Table */}
          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">GBP Buyer</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">NIS/GBP Rate</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Apartment Price (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Cost in GBP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">4.10</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">£609,756</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">4.50</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">£555,556</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">4.90</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">£510,204</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The swing: £99,552.</strong>
          </p>

          {/* EUR Table */}
          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">EUR Buyer</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">NIS/EUR Rate</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Apartment Price (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Cost in EUR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.50</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">€714,286</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.85</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">€649,351</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">4.20</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">€595,238</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The swing: €119,048.</strong>
          </p>

          <p className="text-charcoal leading-relaxed">
            No matter which currency you're coming from, the range is substantial. These aren't extreme scenarios — they're well within the actual rate ranges of the past few years.
          </p>
        </>
      ),
    },
    {
      id: "down-payment-impact",
      title: "Down Payment Impact",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            The down payment is typically where this bites hardest, because it's usually the largest single transfer you'll make.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            Bank of Israel regulations require a minimum 25% down payment for Israeli residents (50% for non-residents on investment properties). Let's use a 30% down payment on our ₪2.5M apartment — that's ₪750,000.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">What That Down Payment Costs in USD</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">NIS/USD Rate</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Down Payment (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Cost in USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.30</td>
                  <td className="py-2 px-3 text-charcoal">₪750,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$227,273</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.60</td>
                  <td className="py-2 px-3 text-charcoal">₪750,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$208,333</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.90</td>
                  <td className="py-2 px-3 text-charcoal">₪750,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$192,308</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The swing on the down payment alone: $34,965.</strong>
          </p>
          <p className="text-charcoal leading-relaxed">
            That's real money. It's a kitchen renovation. It's a year of arnona payments. It's six months of mortgage payments. And it's determined entirely by what the exchange rate happens to be on the day (or days) you transfer the money.
          </p>
        </>
      ),
    },
    {
      id: "transfer-timing",
      title: "The Transfer Timing Question",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            This is where people naturally ask: <em>should I wait for a better rate?</em>
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            We're not going to answer that question. Nobody can reliably predict short-term currency movements — not banks, not hedge funds, not your uncle who reads financial news. Trying to time the shekel is speculation, and this isn't a speculative exercise.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            What we <em>can</em> do is lay out the practical options available to you.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Lump sum transfer.</strong> You transfer the full amount at once. Simple. You get whatever rate is available that day. If the rate happens to be favorable, great. If not, you've locked in the cost and can move on with your life.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Staged transfers.</strong> You transfer the money in several tranches over weeks or months. This is a form of averaging — you won't get the best rate, but you also won't get the worst. Some buyers start transferring months before the closing date, building up a shekel balance in an Israeli bank account. This requires some planning and a tolerance for complexity.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Forward contracts.</strong> Some international currency transfer services allow you to lock in an exchange rate for a future transfer date — typically up to 12 months out. This means you know exactly how many dollars your down payment will cost, regardless of what the rate does between now and closing. Forward contracts are available to individual buyers (not just businesses) through licensed currency brokers, typically for amounts of ₪100,000 or more.
          </p>
          <p className="text-charcoal leading-relaxed">
            <strong>Rate alerts.</strong> Most international currency transfer services and even some bank apps let you set a target rate and get notified when it's hit. These are free and genuinely useful — they let you act quickly when the rate moves in your favor without requiring you to watch markets all day.
          </p>

          <InlineNewsletterCTA />
        </>
      ),
    },
    {
      id: "ongoing-exposure",
      title: "Ongoing Exposure",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            The exchange rate doesn't stop mattering after you buy. If you're earning abroad and paying a shekel-denominated mortgage, the rate affects your effective monthly payment — every month.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">Monthly Mortgage Payment in USD</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">NIS/USD Rate</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Monthly Payment (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Effective Cost in USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.30</td>
                  <td className="py-2 px-3 text-charcoal">₪5,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$1,515</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.60</td>
                  <td className="py-2 px-3 text-charcoal">₪5,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$1,389</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">3.90</td>
                  <td className="py-2 px-3 text-charcoal">₪5,000</td>
                  <td className="py-2 px-3 text-charcoal font-semibold">$1,282</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Monthly swing: $233.</strong> Over a year, that's $2,796. Over a 20-year mortgage, the cumulative impact of rate fluctuations is significant.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            The same applies if you're a landlord collecting rent in shekels but thinking in dollars. A ₪5,000/month rent payment is worth $1,515 when the rate is 3.30 and $1,282 when it's 3.90. Your rental yield, in dollar terms, is at the mercy of the exchange rate.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            And it's not just the mortgage. Arnona (municipal property tax), va'ad bayit (building maintenance fees), utilities — all billed in shekels, all affected by the rate if you're budgeting in a foreign currency. These are individually small, but they compound. If you're planning your monthly Israel budget in dollars, a 10–15% swing in the rate changes what you can afford to maintain.
          </p>
          <p className="text-charcoal leading-relaxed">
            For a full breakdown of ongoing property costs, see our{" "}
            <Link to="/guides/arnona" className="text-horizon-blue hover:underline">Arnona Guide</Link> and{" "}
            <Link to="/guides/renting" className="text-horizon-blue hover:underline">Renting Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "what-you-can-do",
      title: "What You Can Actually Do About It",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            This isn't about predicting markets. It's about making informed decisions and avoiding unnecessary costs.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Understand your exposure type.</strong> Are you making a one-time large transfer (down payment), or do you have ongoing monthly exposure (mortgage, rent, maintenance)? The answer changes which tools are most relevant to you. One-time buyers might benefit from forward contracts or staged transfers. Ongoing earners should think about regular transfer schedules and rate averaging.
          </p>

          <CalloutBox title="The Single Biggest Savings" icon={AlertTriangle}>
            <p className="text-charcoal leading-relaxed mb-2">
              <strong>Use an international currency transfer service instead of your bank.</strong> This is probably the single highest-impact thing you can do.
            </p>
            <p className="text-charcoal leading-relaxed mb-2">
              Banks typically charge a 2–4% spread on the mid-market exchange rate for international wire transfers. Licensed currency brokers and international currency transfer services typically charge 0.3–0.5% or a small flat fee.
            </p>
            <p className="text-charcoal leading-relaxed">
              On a ₪750,000 down payment (roughly $208,000 at 3.60), the difference between a 3% bank spread and a 0.5% specialist spread is approximately <strong>$5,200</strong>. That's money you're leaving on the table for no reason. Many international currency transfer services currently serve Israel for USD, EUR, and GBP to ILS transfers.
            </p>
          </CalloutBox>

          <p className="text-charcoal leading-relaxed mb-4 mt-6">
            <strong>Set rate alerts.</strong> Free, easy, no commitment. Set your target rate and get notified. Available through most transfer services and financial apps.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Budget with a buffer.</strong> Whatever rate you're seeing today, don't assume it will hold. Build a 5–10% buffer into your USD budget for any shekel-denominated cost. If the rate moves in your favor, that buffer becomes a cushion. If it moves against you, you're prepared.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Know the regulatory landscape.</strong> Transfers of NIS 1 million or more between Israel and overseas are reported automatically by banks to the Bank of Israel. This isn't a red flag — it's standard compliance for large transactions. Your bank and transfer service will handle the reporting. There's nothing you need to do, but it's worth knowing so you're not surprised.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Consider foreign-currency mortgage tracks (carefully).</strong> Some Israeli banks offer mortgage tracks denominated in foreign currencies, which would eliminate the ongoing rate exposure on your monthly payments. These are rare and come with their own set of risks — for a full explanation, see the{" "}
            <Link to="/guides/mortgages" className="text-horizon-blue hover:underline">foreign currency track section of our Mortgage Guide</Link>.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            For more on mortgage track options, see our{" "}
            <Link to="/guides/mortgages" className="text-horizon-blue hover:underline">Israeli Mortgages Guide</Link>.
            {" "}For current exchange rate data and trends, see our{" "}
            <Link to="/market" className="text-horizon-blue hover:underline">Market Data page</Link>.
            {" "}For how exchange rates affect your purchase tax calculation, see our{" "}
            <Link to="/guides/purchase-tax" className="text-horizon-blue hover:underline">Purchase Tax Guide</Link>.
          </p>

          <div className="bg-[#FAF8F5] border border-grid-line p-4 rounded-lg mt-6">
            <p className="text-warm-gray text-[14px] leading-relaxed">
              <strong>A note on data:</strong> The exchange rate scenarios in this guide use illustrative rates within the actual historical range of the past three years. They are not predictions, recommendations, or commentary on whether the shekel is cheap or expensive. Currency markets are unpredictable in the short term, and this guide does not constitute financial advice.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content: (
        <p className="text-warm-gray text-[14px] leading-relaxed">
          This guide is provided by navlan.io for informational purposes only. It does not constitute financial, investment, or currency trading advice. Exchange rates fluctuate constantly and past movements do not predict future performance. Always consult a qualified financial advisor before making significant currency transfer decisions.
        </p>
      ),
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <GuidePage
      title="How Exchange Rates Change What You Can Afford in Israel"
      seoTitle="How Exchange Rates Change What You Can Afford in Israel | Navlan"
      subtitle="The Navlan Report — See exactly how NIS/USD, NIS/EUR, and NIS/GBP rates change what you pay for Israeli property."
      date="Last updated: March 2026"
      readTime="~10 min read"
      metaDescription="How NIS/USD, EUR, and GBP exchange rates affect Israeli property costs. Concrete math, money transfer tips, and managing ongoing currency exposure."
      sections={sections}
      bottomNav={{
        prev: { label: "Arnona Guide", to: "/guides/arnona" },
        next: { label: "Start Here Guide", to: "/guides/start-here" },
      }}
      related={[
        { label: "Israeli Mortgages Guide", to: "/guides/mortgages" },
        { label: "Market Data", to: "/market" },
        { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
      ]}
      headerContent={headerContent}
    />
  );
};

export default ExchangeRateGuidePage;
