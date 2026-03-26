import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import CalloutBox from "@/components/ui/CalloutBox";
import { HelpCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Dynamic data types                                                 */
/* ------------------------------------------------------------------ */

interface IndexData {
  value: number | null;
  percentYoy: number | null;
  month: number;
  year: number;
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const MadadGuidePage = () => {
  const [cpiData, setCpiData] = useState<IndexData | null>(null);
  const [constructionData, setConstructionData] = useState<IndexData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch latest CPI data from price_indices — using the rent sub-component
      // (code 50010) as the closest available proxy. The general CPI series is
      // not currently in the database. TODO: Add general CPI series via cron.
      const { data: cpi } = await supabase
        .from("price_indices")
        .select("value, percent_yoy, month, year")
        .eq("index_code", 50010)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1);

      if (cpi && cpi.length > 0) {
        setCpiData({
          value: cpi[0].value,
          percentYoy: cpi[0].percent_yoy,
          month: cpi[0].month,
          year: cpi[0].year,
        });
      }

      // Fetch latest construction costs data
      const { data: construction } = await supabase
        .from("construction_costs")
        .select("value, percent_yoy, month, year")
        .eq("index_code", 200010)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1);

      if (construction && construction.length > 0) {
        setConstructionData({
          value: construction[0].value,
          percentYoy: construction[0].percent_yoy,
          month: construction[0].month,
          year: construction[0].year,
        });
      }
    };

    fetchData();
  }, []);

  const LiveIndex = ({ data, label }: { data: IndexData | null; label: string }) => {
    if (!data || data.value == null) {
      return (
        <span className="text-warm-gray italic text-sm">
          ({label} — check the CBS website for current value)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 bg-[#4A7F8B]/10 text-[#4A7F8B] font-semibold px-2 py-0.5 rounded text-sm">
        {data.value.toFixed(1)} ({data.percentYoy != null ? `${data.percentYoy > 0 ? "+" : ""}${data.percentYoy.toFixed(1)}% YoY` : "—"})
        <span className="text-xs text-warm-gray font-normal">
          As of {formatMonthYear(data.month, data.year)}
        </span>
      </span>
    );
  };

  /* ---------------------------------------------------------------- */
  /*  TL;DR                                                            */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• "Madad" literally means "index" or "measure" in Hebrew. When Israelis say "the madad went up," they usually mean the Consumer Price Index (CPI) — but there's a second index that matters enormously if you're buying new construction.</li>
        <li>• <strong>CPI (מדד המחירים לצרכן)</strong> affects your rent, CPI-indexed mortgage tracks, arnona, and many contracts. It's published on the 15th of every month by the CBS.</li>
        <li>• <strong>Construction Input Costs Index (מדד תשומות הבנייה)</strong> affects milestone payments on off-plan apartment purchases from developers. It tracks building materials, labor, and equipment costs — completely different from consumer prices.</li>
        <li>• Israel's pervasive indexation system is a legacy of the 1980s hyperinflation crisis, when annual inflation hit 450%. The stabilization plan worked, but the habit of linking everything to CPI stuck.</li>
        <li>• Your lease almost certainly has a madad clause. Understand it before you sign — it determines whether and how your rent adjusts each year.</li>
        <li>• For new construction: since a 2022 law change, a maximum of 40% of your purchase price can be linked to the construction index. The first 20% of the price cannot be indexed at all.</li>
        <li>• Use our{" "}
          <Link to="/tools/madad-calculator" className="text-horizon-blue hover:underline">Madad Calculator</Link>{" "}
          to check exactly how much an indexed amount has changed between any two dates.
        </li>
      </ul>
    </div>
  );

  const headerContent = <>{tldr}</>;

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "what-is-the-madad",
      title: "What Is the Madad?",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            The word "madad" (מדד) simply means "index" or "measure" in Hebrew. But in everyday Israeli usage — when your landlord says "the rent goes up with the madad" or your mortgage broker mentions "a track that's tzamud lamadad" — they're almost always referring to the Consumer Price Index, Israel's official measure of inflation.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            Here's what makes Israel unusual: CPI indexation isn't just something economists talk about. It's embedded in rental leases, mortgage contracts, employment agreements, government bonds, arnona calculations, and construction contracts. If you've lived in the US or UK, you've probably never had a landlord adjust your rent based on a government inflation number. In Israel, it's standard practice.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Why Is Everything Indexed? The 1980s Hyperinflation Legacy
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            To understand why madad is so pervasive, you need a bit of history. In the late 1970s and early 1980s, Israel experienced runaway inflation. By 1984, annual inflation had hit approximately 450%, and projections suggested it could exceed 1,000% by the end of 1985. The economy was in crisis — prices changed daily, wages lost their value between paychecks, and contracts became meaningless within months of signing.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            During this period, Israelis developed a survival mechanism: index everything. Wages were linked to CPI. Contracts included automatic adjustment clauses. Financial instruments were denominated in inflation-protected terms. The logic was simple — if you couldn't stop inflation, at least you could protect yourself from it by ensuring that every payment, every salary, and every obligation kept pace with rising prices.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            In June 1985, the government implemented a dramatic stabilization plan that successfully broke the inflationary spiral — a plan now studied worldwide as a model for how to stop hyperinflation. It combined a sharp fiscal deficit reduction, currency devaluation, and a comprehensive freeze on wages, prices, and the exchange rate.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            The stabilization worked. Inflation dropped from triple digits to single digits within a couple of years. But the indexation infrastructure — the habit of linking contracts and payments to CPI — never went away. It's been over 40 years since the crisis, and indexation remains a core feature of Israeli economic life. For Anglos encountering it for the first time, it can feel bewildering. For Israelis, it's just how things work.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Two Indices That Matter for Real Estate
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            There are many indices published by Israel's Central Bureau of Statistics (CBS / הלשכה המרכזית לסטטיסטיקה), but for real estate purposes, two are essential — and most English-language content only covers one of them:
          </p>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            1. Consumer Price Index (מדד המחירים לצרכן — Madad HaMechirim LaTzarchan)
          </h4>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the "madad" that people usually mean. It measures changes in the prices of a fixed basket of consumer goods and services — food, housing costs (rent, not purchase prices), transportation, healthcare, education, and more. The CBS updates the basket weights every two years based on the Household Expenditure Survey.
          </p>
          <p className="text-charcoal leading-relaxed mb-2">Key facts:</p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li><strong>Published:</strong> 15th of every month at 6:30 PM Israel time (moved to 2:00 PM on the preceding Friday if the 15th falls on Shabbat or a holiday)</li>
            <li><strong>Reference period:</strong> Each release covers the previous month (e.g., the February madad is published March 15)</li>
            <li><strong>Base period:</strong> The CBS advances the CPI base period every two years — check the current base on the CBS website</li>
            <li><strong>Current value:</strong> <LiveIndex data={cpiData} label="CPI data" /></li>
          </ul>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            2. Construction Input Costs Index (מדד תשומות הבנייה — Madad Tsuhmot HaBniya)
          </h4>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the index that matters if you're buying an apartment off-plan (from a developer, before or during construction). It measures the cost of inputs used in residential construction — building materials, construction worker wages, equipment, and overhead. It does not measure consumer prices at all.
          </p>
          <p className="text-charcoal leading-relaxed mb-2">Key facts:</p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li><strong>Published:</strong> Same schedule as CPI — 15th of every month at 6:30 PM</li>
            <li><strong>Base period:</strong> Check the CBS website for the current base period</li>
            <li><strong>Key difference from CPI:</strong> This index can move very differently from consumer inflation. When construction labor is scarce and material costs spike, this index can far outpace CPI — and vice versa.</li>
            <li><strong>Current value:</strong> <LiveIndex data={constructionData} label="Construction index data" /></li>
          </ul>

          <CalloutBox icon={HelpCircle} title="Which Madad Applies to You?">
            <ul className="space-y-1">
              <li><strong>Renting?</strong> → CPI (מדד המחירים לצרכן)</li>
              <li><strong>Have a CPI-indexed mortgage track?</strong> → CPI</li>
              <li><strong>Paying arnona?</strong> → CPI (partially — arnona uses a blended formula)</li>
              <li><strong>Buying off-plan from a developer?</strong> → Construction Input Costs Index (מדד תשומות הבנייה)</li>
              <li><strong>Existing/resale apartment purchase?</strong> → Neither index applies to the purchase price itself (though your mortgage may have CPI-indexed tracks)</li>
            </ul>
          </CalloutBox>
        </>
      ),
    },
    {
      id: "cpi-madad",
      title: "The CPI Madad — How It Affects Your Daily Life",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            Rent
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            If you rent in Israel, your lease almost certainly contains a madad clause. The standard practice is for rent to adjust annually based on the change in the Consumer Price Index. This isn't a fee or a penalty — it's how Israeli rental contracts are structured by default.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>How it typically works:</strong> The standard lease clause links rent to the 12-month CPI change. When your lease anniversary arrives, the landlord calculates the CPI change from your contract's base month to the most recently published madad, and your rent adjusts by that percentage.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>A practical example:</strong> You signed a lease in March 2024 at ₪5,500/month. When March 2025 arrives, you check the CPI: if the index rose 2.5% between your base month and the current month, your adjusted rent would be ₪5,500 × 1.025 = ₪5,637.50.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed mb-4 italic">
            → Use our{" "}
            <Link to="/tools/madad-calculator" className="text-horizon-blue hover:underline">Madad Calculator</Link>{" "}
            to check your adjusted rent — enter your original rent, your lease start month, and the current month.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>What you need to know about the legal framework:</strong> The Fair Rental Law of 2017 (חוק שכירות הוגנת) governs residential leases but does not set a statutory cap on rent increases. A temporary annual cap of 25% on rent increases existed but expired in July 2024. As of early 2026, there is no legal ceiling on how much a landlord can raise rent — the only protection you have is what's written in your contract.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            During the lease term itself, the landlord typically cannot increase rent beyond what the contract's indexation clause allows. Rent adjustments are generally permitted once per year, linked to CPI as specified in the lease. Without an explicit indexation clause in the contract, or without the tenant's written agreement, rent must remain fixed for the duration of the lease period.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>What about negative CPI? Does rent go down?</strong> In theory, a madad clause works in both directions — if CPI decreases, rent should decrease too. In practice, sustained deflation is rare in Israel, and individual months of negative CPI change are usually offset by positive months within the annual calculation period.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The difference between full and partial indexation:</strong> Most standard leases use "hatzamada lamadad" (הצמדה למדד) — full indexation, meaning 100% of the CPI change applies to the rent. Some contracts, particularly those negotiated by experienced tenants or with landlords open to compromise, use partial indexation (e.g., rent adjusts by 50% of CPI change) or capped indexation (e.g., CPI-linked but maximum 3% per year). These are less common but worth negotiating if you can.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic mb-4">
            → For a complete guide to rental contracts, tenant rights, and negotiation strategies, see our{" "}
            <Link to="/guides/renting" className="text-horizon-blue hover:underline">Renting Guide</Link>.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Mortgages
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            If you have an Israeli mortgage (mashkanta), there's a good chance at least one of your tracks is CPI-indexed. The CPI-indexed fixed rate track (קבועה צמודה — Kvu'a Tzamuda) is one of the four main mortgage track types in Israel, and most mortgage compositions include some CPI-indexed component.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>How CPI-indexed mortgage tracks work:</strong> The interest rate on the track is fixed, but the outstanding principal balance is adjusted based on CPI changes. When CPI rises, your principal goes up — and since your monthly payment is calculated based on the outstanding principal, your payments increase too.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            The adjustment is applied monthly using the "known index" (מדד ידוע) — the most recently published CPI value as of your payment date. Since the CBS publishes CPI on the 15th, borrowers who pay on the 1st of the month use a CPI figure that's roughly two months old, while those paying on the 15th use the figure published that same day. Your nominal payment changes every month — constant in real terms, gradually rising in shekel terms as CPI accumulates. One thing that surprises many Anglos: in the early years of the loan, CPI adjustments can outpace your principal repayment, meaning your outstanding balance actually grows even while you're making every payment on time. This is normal for CPI-indexed tracks and resolves over the life of the loan as the principal portion of your payments increases.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>A practical example:</strong> You took out a mortgage in January 2023 with ₪400,000 in a CPI-indexed track. If cumulative CPI has risen 5.3% between then and now, your indexed principal has grown to approximately ₪421,200 — that's ₪21,200 added to your debt purely from inflation adjustment. Your monthly payment has increased proportionally.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Why do Israelis use CPI-indexed tracks at all?</strong> Because the interest rate on CPI-indexed tracks is typically lower than the non-indexed fixed rate — sometimes significantly so. You're accepting inflation risk in exchange for a lower base rate. In periods of low, stable inflation, CPI-indexed tracks can be considerably cheaper than the non-indexed alternative. In periods of high inflation (like 2022–2023), borrowers on these tracks saw their balances and payments jump painfully.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic mb-4">
            → For a full comparison of all four mortgage track types and how to structure your mortgage composition, see our{" "}
            <Link to="/guides/mortgages" className="text-horizon-blue hover:underline">Mortgage Guide</Link>.
          </p>

          <div className="mt-6">
            <InlineNewsletterCTA />
          </div>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Arnona and Other Recurring Costs
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Arnona — Israel's municipal property tax — increases annually using a formula that is partially linked to CPI. The national government sets a baseline automatic increase each year using a blended formula:
          </p>
          <p className="text-charcoal leading-relaxed mb-4 font-semibold">
            Arnona annual increase = average of (CPI change + public sector wage index change)
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            Specifically, the formula averages 50% of the CPI change with 50% of the change in the public sector wage index. For 2026, this produced an automatic increase of 1.626% over 2025 levels (reflecting a -0.165% CPI component and a +1.791% public sector wage component).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            Municipalities can request increases above this baseline but must get approval from the Ministry of Interior — and many such requests are trimmed or rejected.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Other CPI-linked costs:</strong> CPI indexation extends beyond rent, mortgages, and arnona. Many employment contracts include "tosefet yoker" (תוספת יוקר) — a cost-of-living allowance — linked to CPI changes. Va'ad bayit fees, service contracts, and various government fees may also include indexation clauses. The principle is the same everywhere: the contract specifies a base amount and links future adjustments to the published CPI.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            → For a complete breakdown of how arnona is calculated, what discounts you're eligible for, and how to navigate the system, see our{" "}
            <Link to="/guides/arnona" className="text-horizon-blue hover:underline">Arnona Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "construction-costs-madad",
      title: "The Construction Costs Madad — New Construction Payments",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            If you're buying an apartment off-plan (yad rishona from a developer, also called "buying on paper"), you need to understand a completely different index. The Construction Input Costs Index (מדד תשומות הבנייה) tracks the cost of building materials, construction worker wages, equipment, and related overhead. It has nothing to do with consumer prices.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            What It Tracks
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            The index measures over 100 specific components organized into four main groups:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Materials and products</strong> (approximately 40–50% of the index weight): quarry materials, cement, concrete, iron and metal products, electrical components, plumbing supplies, wood, sealing and waterproofing materials, paints, and glass.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Labor costs</strong> (approximately 30–40%): construction worker wages, equipment operator wages, supervisory and management labor. This is currently the dominant driver of index changes — construction labor costs rose approximately 5% year-over-year in early 2026, partly driven by the shift from Palestinian to foreign workers following October 2023, which increased labor costs.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Equipment and transportation:</strong> crane rentals, machinery hire, fuel, and transport costs.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>General expenses:</strong> insurance, inspections, administrative overhead.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            How It Affects Your Off-Plan Purchase
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            When you buy an apartment from a developer before or during construction, the purchase price in your contract is not necessarily the final price you'll pay. A portion of your milestone payments is linked to the Construction Input Costs Index, meaning those payments adjust based on how much construction costs have changed since you signed.
          </p>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            The 2022 Law Change — Important Protection for Buyers
          </h4>
          <p className="text-charcoal leading-relaxed mb-4">
            A June 2022 amendment to the Sale Law (חוק המכר דירות) significantly limited how much of your purchase price can be indexed. Before this law, developers could link the entire purchase price to the construction index, exposing buyers to potentially enormous price increases over multi-year construction periods. The new rules establish these protections:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li><strong>Maximum 40% of the total purchase price</strong> can be linked to the construction index</li>
            <li><strong>The first 20% of the purchase price</strong> cannot be indexed at all</li>
            <li><strong>Only 50% of each subsequent installment</strong> is index-linked</li>
            <li>The remaining 60% of the purchase price — covering land costs, developer profit, taxes, and overhead — is fixed and does not change</li>
          </ul>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Which Payments Are Linked and Which Are Not
          </h4>
          <p className="text-charcoal leading-relaxed mb-2">
            <strong>Payments that CAN be index-linked</strong> (up to the 40% cap):
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li>Developer milestone payments for the construction cost portion</li>
            <li>These milestones are typically tied to construction progress: foundation/frame completion, walls and exterior plaster, interior finishing, key delivery</li>
          </ul>
          <p className="text-charcoal leading-relaxed mb-2">
            <strong>Payments that are NOT index-linked:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li>Purchase tax (mas rechisha) — this is a government tax, not a construction cost</li>
            <li>Lawyer fees</li>
            <li>Real estate agent commissions</li>
            <li>Bank fees and appraisals</li>
            <li>Land Registry (Tabu) registration costs</li>
            <li>The land cost component of the purchase price</li>
            <li>Developer profit margin</li>
          </ul>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            A Practical Example
          </h4>
          <p className="text-charcoal leading-relaxed mb-4">
            You sign a contract for a new apartment at ₪2,000,000 in January 2024. The construction index on the signing date is locked as your base reference. A milestone payment of ₪400,000 comes due in January 2026, and 40% of it (₪160,000) is linked to the construction index.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            If the construction index has risen 7% since you signed: the indexed portion adjusts by 7%, adding ₪11,200 to that payment. Your actual payment for this milestone is ₪411,200 instead of ₪400,000.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            Over the full construction period, with multiple milestone payments and a rising index, the total addition can be significant — tens of thousands of shekels on a typical apartment purchase.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed mb-4 italic">
            → Use our{" "}
            <Link to="/tools/madad-calculator" className="text-horizon-blue hover:underline">Madad Calculator</Link>{" "}
            to calculate exact adjustments — select "Construction Costs Index," enter your payment amount, the percentage that's linked, and your contract signing date.
          </p>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Important: The Asymmetry Issue
          </h4>
          <p className="text-charcoal leading-relaxed">
            In standard new construction contracts, the indexation often works in only one direction: up. If the construction index rises above the base level locked at signing, your payments increase. If it falls below, the standard contract typically does not reduce your payments — the signing price acts as a floor. This is a significant asymmetry that benefits the developer. Negotiate this point if you can, or at minimum, understand it before signing.
          </p>
        </>
      ),
    },
    {
      id: "how-to-protect-yourself",
      title: "How to Protect Yourself",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            Know Which Madad Applies to Your Situation
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the most basic step, and the one most Anglos get wrong. If your landlord mentions "the madad" at lease renewal, they mean CPI. If your developer mentions "the madad" regarding milestone payments, they mean the construction costs index. These are different numbers published by the same agency (CBS), and confusing them will lead to incorrect calculations.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Read Your Indexation Clause Carefully
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Every contract that includes madad linkage should specify:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li><strong>Which index</strong> is being used (CPI or construction costs)</li>
            <li><strong>The base date</strong> — the reference point from which changes are measured</li>
            <li><strong>How often</strong> adjustments are applied (annually for most rentals, per-milestone for construction)</li>
            <li><strong>Whether adjustment is bidirectional</strong> — does the amount go down if the index falls?</li>
            <li><strong>Any caps</strong> on the adjustment (rare in standard contracts but negotiable)</li>
          </ul>
          <p className="text-charcoal leading-relaxed mb-4">
            Have your lawyer explain the indexation clause in plain language before you sign.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Negotiate Where You Can
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>For rental leases:</strong> You may be able to negotiate partial indexation (e.g., 50% of CPI change instead of 100%), capped indexation (e.g., maximum 3% per year regardless of CPI), or a fixed increase instead of CPI linkage (e.g., 2.5% annually). Landlords in competitive rental markets or with long-term tenants may be flexible on these terms.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>For new construction:</strong> The 2022 law already provides significant protection (40% cap on indexation), but additional negotiation is possible. Some buyers negotiate a maximum cap on index-linked increases (e.g., total construction madad adjustment cannot exceed 5% regardless of actual index movement). Others negotiate to accelerate payments — paying more upfront while the index is lower, reducing the amount subject to future adjustment.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Budget for Indexation
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Madad adjustments are not surprises or penalties — they're a predictable feature of Israeli contracts. Budget for them:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal leading-relaxed mb-4">
            <li><strong>Rent:</strong> Expect your rent to increase annually by roughly the rate of CPI inflation (currently around 2% YoY, but this fluctuates)</li>
            <li><strong>Mortgage:</strong> If you have CPI-indexed tracks, your principal and payments will grow with inflation. Your mortgage broker can model scenarios</li>
            <li><strong>New construction:</strong> The construction index has been more volatile than CPI — increases of 5–7% annually have been common in recent years. On a multi-year construction timeline with ₪1M+ in milestone payments, this adds up</li>
          </ul>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            For New Construction: Understand That the Contract Price Is a Starting Point
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            The price printed on your new construction contract is not necessarily what you'll pay. It's the base price, and the indexed portions will adjust over the construction period. When budgeting for a new apartment, build in a buffer of at least 5–10% above the contract price to account for potential construction index increases. In periods of high construction cost inflation, even 10% may not be sufficient.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            → For a complete guide to navigating the home purchase process in Israel, see our{" "}
            <Link to="/guides/start-here" className="text-horizon-blue hover:underline">Start Here Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "checking-the-current-madad",
      title: "Checking the Current Madad",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            Where to Find the Numbers
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Consumer Price Index (CPI):</strong> Published on the CBS website in English at{" "}
            <a href="https://www.cbs.gov.il/en/subjects/Pages/Consumer-Price-Index.aspx" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">cbs.gov.il/en — Consumer Price Index</a>.
            Published on the 15th of each month at 6:30 PM Israel time. The release covers the previous month's data.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Construction Input Costs Index:</strong> Available on the{" "}
            <a href="https://www.cbs.gov.il/he/subjects/Pages/%D7%9E%D7%93%D7%93-%D7%9E%D7%97%D7%99%D7%A8%D7%99-%D7%AA%D7%A9%D7%95%D7%9E%D7%94-%D7%91%D7%91%D7%A0%D7%99%D7%99%D7%94-%D7%9C%D7%9E%D7%92%D7%95%D7%A8%D7%99%D7%9D.aspx" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">CBS website (Hebrew)</a>.
            Same publication schedule as CPI. Also available at{" "}
            <a href="https://www.kantahome.com/forecasts-and-indexes/construction-index" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">Kantahome</a>{" "}
            in a more user-friendly format.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            How to Read the Numbers
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Both indices are expressed relative to a base period set to 100. If the current CPI reads 103.3, that means consumer prices have risen approximately 3.3% since the base period average. The construction costs index works the same way.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Calculating Your Adjustment
          </h3>
          <p className="text-charcoal leading-relaxed mb-4">
            The formula is straightforward:
          </p>
          <div className="bg-cream rounded-lg p-4 mb-4 font-mono text-sm text-charcoal">
            (Index at end date ÷ Index at start date) × Original amount = Adjusted amount
          </div>
          <p className="text-charcoal leading-relaxed mb-4">
            For example: Your base rent is ₪5,500. The CPI when your lease started was 102.1. The current CPI is 104.7. Your adjusted rent = (104.7 ÷ 102.1) × ₪5,500 = ₪5,640.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed mb-4 italic">
            → Don't want to do the math? Use our{" "}
            <Link to="/tools/madad-calculator" className="text-horizon-blue hover:underline">Madad Calculator</Link>{" "}
            — enter your amount, start date, and end date, and it calculates the adjusted figure automatically, with the formula shown step by step.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            → For current CPI trends and other market data in context, see our{" "}
            <Link to="/market" className="text-horizon-blue hover:underline">Market Data page</Link>.
          </p>
        </>
      ),
    },
    {
      id: "hebrew-glossary",
      title: "Hebrew Glossary",
      content: (
        <>
          <dl className="space-y-4">
            <div>
              <dt className="font-heading font-semibold text-charcoal">מדד המחירים לצרכן <span className="font-normal text-warm-gray">(Madad HaMechirim LaTzarchan)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Consumer Price Index (CPI). The general inflation index published monthly by the CBS. Affects rent, CPI-indexed mortgages, arnona, and many contracts.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">מדד תשומות הבנייה <span className="font-normal text-warm-gray">(Madad Tsuhmot HaBniya)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Construction Input Costs Index. Measures changes in the cost of building materials, labor, and equipment. Affects milestone payments on new construction purchases.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">הצמדה <span className="font-normal text-warm-gray">(Hatzamada)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Indexation or linkage. The mechanism by which a payment or amount is linked to an index (usually CPI). When someone says a contract is "b'hatzamada lamadad," it means payments are CPI-linked.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">צמוד מדד <span className="font-normal text-warm-gray">(Tzamud Madad)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">CPI-linked or indexed. Describes a financial instrument, payment, or contract term that adjusts with the Consumer Price Index. A "maslu'l tzamud madad" is a CPI-indexed mortgage track.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">תוספת יוקר <span className="font-normal text-warm-gray">(Tosefet Yoker)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Cost of living allowance. A CPI-linked salary adjustment, historically a standard feature of Israeli employment agreements. Less universal today but still common in public sector and unionized workplaces.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">מדד בסיס <span className="font-normal text-warm-gray">(Madad Basis)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Base index. The index value at the starting point of your contract, used as the reference for calculating adjustments.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">הפרשי הצמדה <span className="font-normal text-warm-gray">(Hefreshei Hatzamada)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Indexation differentials. The difference between the base index value and the current index value, expressed as a monetary amount. This is the additional amount you pay (or save) due to indexation.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">חוק המכר (דירות) <span className="font-normal text-warm-gray">(Chok HaMekher, Dirot)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Sale Law (Apartments). The law governing sales of new apartments by developers, including the 2022 amendment that caps construction index linkage at 40% of the purchase price.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">חוק שכירות הוגנת <span className="font-normal text-warm-gray">(Chok Skhirut Hogenet)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Fair Rental Law (2017). Governs residential lease agreements, including habitability standards, deposit limits, repair obligations, and the framework for rent adjustments.</dd>
            </div>
            <div>
              <dt className="font-heading font-semibold text-charcoal">הלשכה המרכזית לסטטיסטיקה <span className="font-normal text-warm-gray">(HaLishka HaMerkazit LiStatistika)</span></dt>
              <dd className="text-charcoal leading-relaxed mt-1">Central Bureau of Statistics (CBS). The government agency that publishes both the CPI and the construction costs index.</dd>
            </div>
          </dl>
        </>
      ),
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <GuidePage
      title="Understanding the Madad"
      seoTitle="Understanding the Madad — How CPI and Construction Indexing Affect Your Money in Israel | Navlan"
      subtitle="How CPI and construction indexing affect your rent, mortgage, and property payments in Israel."
      date="Last updated: March 2026"
      readTime="~18 min read"
      metaDescription="Israel's madad (CPI) system affects your rent, mortgage, arnona, and new construction payments. Learn how both CPI and construction indexation work, with practical examples and a free calculator."
      sections={sections}
      bottomNav={{
        prev: { label: "Exchange Rates Guide", to: "/guides/exchange-rates" },
        next: { label: "Start Here Guide", to: "/guides/start-here" },
      }}
      related={[
        { label: "Renting Guide", to: "/guides/renting" },
        { label: "Mortgage Guide", to: "/guides/mortgages" },
        { label: "Madad Calculator", to: "/tools/madad-calculator" },
      ]}
      headerContent={headerContent}
    />
  );
};

export default MadadGuidePage;
