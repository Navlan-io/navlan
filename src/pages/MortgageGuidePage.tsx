import { useEffect, useState } from "react";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import { Card } from "@/components/ui/card";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSiteParameters } from "@/hooks/useSiteParameters";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Live-data hook — fetches latest mortgage rates from Supabase       */
/* ------------------------------------------------------------------ */

interface MortgageRateData {
  nonIndexedFixed: number | null;
  primeMargin: number | null; // the benchmark/prime value
  cpiFixed: number | null;
  boiRate: number | null; // derived: prime - 1.5
  asOf: string | null; // formatted "Month Year"
  loading: boolean;
}

function useMortgageRates(): MortgageRateData {
  const [data, setData] = useState<MortgageRateData>({
    nonIndexedFixed: null,
    primeMargin: null,
    cpiFixed: null,
    boiRate: null,
    asOf: null,
    loading: true,
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // 1. Get latest period
        const { data: latestRow } = await supabase
          .from("mortgage_rates")
          .select("period, fetched_at")
          .order("period", { ascending: false })
          .limit(1);

        if (!latestRow || latestRow.length === 0) {
          setData((d) => ({ ...d, loading: false }));
          return;
        }

        const latestPeriod = latestRow[0].period;
        const fetchedAt = latestRow[0].fetched_at;

        // 2. Get rates for the latest period
        const { data: rows } = await supabase
          .from("mortgage_rates")
          .select("track_type, rate_type, value")
          .eq("period", latestPeriod);

        if (!rows) {
          setData((d) => ({ ...d, loading: false }));
          return;
        }

        const nonIndexedFixed =
          rows.find(
            (r) =>
              r.track_type === "non_indexed_fixed" && r.rate_type === "rate"
          )?.value ?? null;

        const primeMargin =
          rows.find(
            (r) =>
              r.track_type === "prime_variable" && r.rate_type === "rate"
          )?.value ?? null;

        const cpiFixed =
          rows.find(
            (r) => r.track_type === "cpi_fixed" && r.rate_type === "rate"
          )?.value ?? null;

        const boiRate = primeMargin != null ? primeMargin - 1.5 : null;

        // Format fetched_at as "Month Year"
        let asOf: string | null = null;
        if (fetchedAt) {
          const d = new Date(fetchedAt);
          asOf = d.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        }

        setData({
          nonIndexedFixed,
          primeMargin,
          cpiFixed,
          boiRate,
          asOf,
          loading: false,
        });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    };

    fetchRates();
  }, []);

  return data;
}

/* ------------------------------------------------------------------ */
/*  Inline live-value component                                        */
/* ------------------------------------------------------------------ */

/** Renders a value with subtle horizon-blue styling to flag it as live data */
const LiveValue = ({
  value,
  suffix = "%",
  fallback = "—",
}: {
  value: number | null;
  suffix?: string;
  fallback?: string;
}) => {
  if (value == null)
    return (
      <Link to="/market" className="text-warm-gray hover:text-horizon-blue hover:underline">
        Check Market Data →
      </Link>
    );
  return (
    <span className="text-horizon-blue font-semibold">
      {value.toFixed(value % 1 === 0 ? 1 : 2)}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const MortgageGuidePage = () => {
  const rates = useMortgageRates();
  const { currency, rates: fxRates } = useCurrency();
  const { data: params } = useSiteParameters();

  /** Format a NIS amount with the user's chosen currency */
  const fmtNIS = (nis: number) => {
    if (currency === "₪") return `₪${nis.toLocaleString()}`;
    const rate = currency === "$" ? fxRates.USD : fxRates.EUR;
    const converted = Math.round(nis / rate);
    return `${currency}${converted.toLocaleString()}`;
  };

  /* ---------------------------------------------------------------- */
  /*  TL;DR                                                            */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• Israeli mortgages are fundamentally different: each mortgage is split into 3–4 "tracks" with different rate structures, and the mix of tracks matters more than any single rate.</li>
        <li>• The four main tracks: non-indexed fixed (simplest), CPI-indexed fixed (lower rate but balance rises with inflation), prime-linked variable (fluctuates with BOI rate), and foreign currency (for earners abroad).</li>
        <li>• BOI regulations are strict: <span className="text-[#4A7F8B] font-medium">{params?.ltv_resident_first_home?.display_label || '25%'}</span> minimum down payment (first home), <span className="text-[#4A7F8B] font-medium">{params?.ltv_non_resident?.display_label || '50%'}</span> for non-residents, at least one-third must be fixed-rate, and monthly payments can't exceed <span className="text-[#4A7F8B] font-medium">{params?.pti_cap?.display_label || '50%'}</span> of income.</li>
        <li>• Olim get a subsidized mortgage (mashkanta zakaut) of <span className="text-[#4A7F8B] font-medium">{params?.zakaut_amount?.display_label || '~₪200K'}</span> at below-market rates, available within <span className="text-[#4A7F8B] font-medium">{params?.olim_zakaut_window?.display_label || '15 years'}</span> of aliyah.</li>
        <li>• Critical: Israeli purchase contracts are NOT conditional on mortgage approval. Get your ishur ekroni (pre-approval) before you sign anything.</li>
        <li>• For English speakers, an English-speaking mortgage broker is close to a necessity — the bank will not explain your options or tell you if their offer is competitive.</li>
      </ul>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Quick Reference box                                              */
  /* ---------------------------------------------------------------- */

  const quickRef = (
    <Card className="bg-cream border-0 shadow-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-[18px] text-charcoal">
          Quick Reference
        </h3>
        {rates.asOf && (
          <span className="font-body text-[12px] text-warm-gray">
            Rates as of: {rates.asOf}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-grid-line font-body text-[15px]">
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium w-48">
                Max LTV (first home)
              </td>
              <td className="py-2 text-charcoal">
                <span className="text-[#4A7F8B] font-medium">{params?.ltv_resident_first_home?.display_label || '75%'}</span> — minimum 25% down payment
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Payment-to-income cap
              </td>
              <td className="py-2 text-charcoal">
                <span className="text-[#4A7F8B] font-medium">{params?.pti_cap?.display_label || '50%'}</span> hard limit; above 40% is high-risk
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Variable rate cap
              </td>
              <td className="py-2 text-charcoal">
                ≥ one-third of mortgage must be fixed-rate
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Non-indexed fixed rate
              </td>
              <td className="py-2 text-charcoal">
                <LiveValue value={rates.nonIndexedFixed} />
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Prime rate
              </td>
              <td className="py-2 text-charcoal">
                <LiveValue value={rates.primeMargin} /> (BOI policy rate +
                1.5%)
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                BOI policy rate
              </td>
              <td className="py-2 text-charcoal">
                <LiveValue value={rates.boiRate} />
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                CPI-indexed fixed rate
              </td>
              <td className="py-2 text-charcoal">
                <LiveValue value={rates.cpiFixed} />
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Olim benefit window
              </td>
              <td className="py-2 text-charcoal">
                Within {params?.olim_zakaut_window?.display_label || '15 years'} of aliyah
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-warm-gray font-medium">
                Pre-approval timeline
              </td>
              <td className="py-2 text-charcoal">
                5–10 business days (2022 reform)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "how-mortgages-work",
      title: "How Israeli Mortgages Work",
      content: (
        <>
          <p className="mb-4">
            If you have experience with mortgages in the US, UK, Canada, or
            Australia, the Israeli system will feel fundamentally different. In
            Anglo countries, you typically choose one interest rate type (fixed
            or variable) for the entire loan amount.
          </p>
          <PullQuote>
            In Israel, a mortgage is almost always split into multiple
            "tracks" — think of it as a bundle of two to four smaller loans,
            each behaving differently over time.
          </PullQuote>
          <p className="mb-4">
            A <em>mashkanta</em> (משכנתא) is assembled from a combination of
            tracks (<em>maslulim</em>, מסלולים), each with its own interest
            rate type, index linkage, and repayment term. The composition of
            these tracks — how much of your total mortgage sits in each one —
            is arguably more important than the headline rate on any individual
            track.
          </p>
          <p className="mb-4">
            Israeli banks do not see themselves as advisors the way
            Anglo-country banks typically do. They are lenders. They will
            approve or deny your application and offer terms, but they will not
            explain the trade-offs of different track combinations or tell you
            whether their offer is competitive. This is why English-speaking
            mortgage brokers play a much larger role in Israel than many olim
            expect.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Four Main Mortgage Tracks
          </h3>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Track 1: Non-Indexed Fixed Rate (Kvu'a Lo Tzamuda)
          </h4>
          <p className="mb-4">
            The simplest track and closest to Anglo mortgages. You lock in a
            fixed interest rate for the life of the track — your monthly payment
            stays the same regardless of inflation or central bank policy. The
            downside: fixed rates tend to be higher than variable rates at the
            time of signing. Current non-indexed fixed rates are around{" "}
            <LiveValue value={rates.nonIndexedFixed} />, depending on term
            length and bank.
          </p>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Track 2: CPI-Indexed Fixed Rate (Kvu'a Tzamuda)
          </h4>
          <p className="mb-4">
            This track confuses most English speakers because it doesn't exist
            in Anglo mortgage markets. The interest rate is fixed, but the
            principal balance adjusts quarterly based on Israel's Consumer Price
            Index (the <em>madad</em>, מדד). If inflation rises, your balance
            and payments go up. Current CPI-indexed fixed rates are around{" "}
            <LiveValue value={rates.cpiFixed} /> — lower than the non-indexed
            rate because the CPI linkage shifts inflation risk to the borrower.
          </p>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Track 3: Prime-Linked Variable Rate (Mishtana Prime)
          </h4>
          <p className="mb-4">
            Tied directly to the Bank of Israel's prime rate, currently{" "}
            <LiveValue value={rates.primeMargin} /> (the BOI policy rate of{" "}
            <LiveValue value={rates.boiRate} /> plus 1.5%). Your mortgage rate
            is quoted as "prime minus X" or "prime plus X." For example, "prime
            minus 0.5%" means your rate is currently{" "}
            {rates.primeMargin != null ? (
              <LiveValue value={rates.primeMargin - 0.5} />
            ) : (
              "—"
            )}
            . If the BOI raises rates, yours rises automatically; if they cut,
            yours drops.
          </p>
          <CalloutBox title="Regulatory Limit">
            No more than two-thirds of your total mortgage can be in
            variable-rate tracks. At least one-third must be fixed — a rule
            designed to protect borrowers from payment shocks.
          </CalloutBox>

          <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-6 mb-2">
            Track 4: Foreign Currency Mortgage (Matbea Chutz)
          </h4>
          <p className="mb-4">
            Available primarily to foreign residents and some olim with
            significant foreign-currency income. The loan is denominated in USD,
            EUR, GBP, or other currencies. Interest rates are often lower, but
            you assume full currency risk. Maximum LTV is 50% for
            non-residents, and early repayment penalties are minimal (typically{" "}
            {fmtNIS(60)} administrative fee). Most relevant for diaspora buyers
            earning abroad.
          </p>
          <p className="mb-4 text-sm">
            → See our <Link to="/guides/exchange-rates" className="text-horizon-blue hover:underline">Exchange Rate Guide</Link> for how currency fluctuations affect your total cost.
          </p>
        </>
      ),
    },
    {
      id: "boi-regulations",
      title: "Bank of Israel Regulations",
      content: (
        <>
          <p className="mb-4">
            The Bank of Israel actively regulates the mortgage market with
            borrower-protection rules stricter than many Anglo countries. These
            are not suggestions — banks cannot lend beyond these limits.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Loan-to-Value (LTV) Limits
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>
              <strong>First home:</strong> <span className="text-[#4A7F8B] font-medium">{params?.ltv_resident_first_home?.display_label || '75%'}</span> LTV — 25% minimum down payment
            </li>
            <li>
              <strong>Replacement dwelling:</strong> <span className="text-[#4A7F8B] font-medium">{params?.ltv_resident_upgrade?.display_label || '70%'}</span> LTV
            </li>
            <li>
              <strong>Investment property:</strong> 50% LTV
            </li>
            <li>
              <strong>Foreign residents:</strong> Typically <span className="text-[#4A7F8B] font-medium">{params?.ltv_non_resident?.display_label || '50%'}</span>, some banks
              offer up to 60%
            </li>
          </ul>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Payment-to-Income (PTI) Limits
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>Up to 33–40%: normal and acceptable</li>
            <li>40–50%: classified as high-risk (higher rates)</li>
            <li>Above 50%: the bank cannot approve the loan</li>
          </ul>
          <p className="mb-4">
            This calculation includes <em>all</em> debt obligations — car
            loans, credit card debt, alimony, and other recurring commitments.
            For olim with foreign income, documenting and converting that income
            is one of the most common friction points.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The One-Third Rule
          </h3>
          <p className="mb-4">
            At least one-third of your total mortgage must be in fixed-rate
            tracks. Maximum 67% variable. This prevents borrowers from being
            entirely exposed to rate increases.
          </p>
        </>
      ),
    },
    {
      id: "olim-benefits",
      title: "Olim Benefits — The Mashkanta Zakaut",
      content: (
        <>
          <p className="mb-4">
            Israel offers new immigrants a subsidized mortgage benefit —
            separate from, and combinable with, a standard commercial mortgage.
            This is one of the most significant financial benefits of aliyah for
            homebuyers.
          </p>
          <PullQuote>
            The zakaut mortgage is one of the most underutilized benefits
            available to English-speaking immigrants — if you made aliyah within
            the last {params?.olim_zakaut_window?.display_label || '15 years'}, you likely still qualify.
          </PullQuote>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Eligibility
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>You must hold a teudat oleh (תעודת עולה)</li>
            <li>
              Apply within <strong>{params?.olim_zakaut_window?.display_label || '15 years'}</strong> of receiving oleh status
            </li>
            <li>Not owned an apartment in Israel in the past 10 years</li>
            <li>
              Available to married couples, single parents, and single olim aged
              21+
            </li>
            <li>One zakaut per household, not per individual</li>
          </ul>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Loan Amount and Terms
          </h3>
          <p className="mb-4">
            The subsidized loan amount is approximately{" "}
            <strong className="text-horizon-blue">{params?.zakaut_amount?.display_label || fmtNIS(200000)}</strong>.
            This is rarely enough for an entire purchase, so most olim combine
            it with a standard commercial mortgage. The interest rate is
            calculated as the BOI's average fixed inflation-linked rate minus
            0.5%, with a maximum cap of 3.0% — significantly below market
            rates.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            How to Access It
          </h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4 marker:text-sage marker:font-semibold">
            <li>
              Obtain your <em>teudat zakaut</em> (eligibility certificate)
              through government-contracted companies such as Milgam or Maof
            </li>
            <li>
              Apply for the zakaut mortgage at a participating bank, presenting
              the teudat zakaut with your standard mortgage application
            </li>
          </ol>
          <CalloutBox title="Don't Confuse the Two" icon={AlertTriangle}>
            The teudat zakaut for mortgage purposes is a separate document from
            the general housing eligibility certificate used for programs like
            Dira BeHanacha.
          </CalloutBox>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "documentation",
      title: "Documentation the Bank Needs",
      content: (
        <>
          <p className="mb-4">
            Israeli banks require extensive documentation, and the process is
            significantly more demanding for applicants with foreign income or
            documents not in Hebrew.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Standard Documentation
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>
              Israeli ID (teudat zehut) — or passport for non-residents
            </li>
            <li>
              Proof of income for 2–3 years: payslips, tax returns, or audited
              financials for self-employed
            </li>
            <li>Bank statements (Israeli and foreign), last 6–12 months</li>
            <li>
              Complete liability disclosure: all debts, loans, credit cards,
              overdrafts
            </li>
            <li>Signed purchase contract</li>
            <li>Land registry extract (nesach tabu)</li>
            <li>Teudat oleh (if applying for zakaut)</li>
            <li>Marriage certificate (if applicable)</li>
          </ul>

          <CalloutBox title="The Translation Problem">
            All non-Hebrew documents must be translated by a certified
            translator and often notarized. Banks will reject improperly
            translated documents. Budget several thousand shekels and extra time
            for this step.
          </CalloutBox>

          <p className="mb-4">
            For those earning abroad — remote jobs, rental income, investments —
            documenting income to the bank's satisfaction is one of the most
            common pain points. Work with your broker to understand the exact
            format required <em>before</em> submitting.
          </p>
        </>
      ),
    },
    {
      id: "approval-process",
      title: "The Approval Process",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            Step 1: Get Organized Before You Look
          </h3>
          <p className="mb-4">
            Unlike in some Anglo countries where you browse properties first, in
            Israel the smart approach is to understand your borrowing capacity
            before you start searching. Gather documentation, consult a broker,
            and ideally obtain a pre-approval.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Step 2: Ishur Ekroni — Approval in Principle
          </h3>
          <p className="mb-4">
            The <em>ishur ekroni</em> (אישור עקרוני) is a conditional approval
            indicating the bank's willingness to lend. Under the 2022
            transparency reform, banks must issue it within{" "}
            <strong>5–7 business days</strong> of a complete application.
            Validity is 45–90 days, but the rate lock is shorter — typically
            24–32 days. You can and should obtain ishur ekroni from multiple
            banks.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Step 3: Sign the Purchase Contract
          </h3>
          <CalloutBox title="Critical Warning" icon={AlertTriangle}>
            Israeli purchase contracts are <strong>not</strong> conditional on
            mortgage approval. Once you sign, you are legally committed
            regardless of whether the bank approves your mortgage. Secure your
            ishur ekroni before signing — this is not optional.
          </CalloutBox>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Step 4: Final Approval
          </h3>
          <p className="mb-4">
            After signing, submit the contract to the bank. They conduct a
            property appraisal (<em>shuma</em>) and complete underwriting. Final
            approval typically takes <strong>2–3 weeks</strong>. Funds are
            disbursed approximately 60 days after signing the mortgage
            agreement.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Step 5: Registration and Insurance
          </h3>
          <p className="mb-4">
            The bank requires a lien (<em>mashkanta</em>) registered at the
            Land Registry (Tabu), mortgage life insurance, and property
            insurance. Independent insurance policies are often cheaper than
            bank-offered ones.
          </p>
        </>
      ),
    },
    {
      id: "comparing-offers",
      title: "Comparing Banks and Offers",
      content: (
        <>
          <p className="mb-4">
            The 2022 Bank of Israel transparency reform made comparison
            significantly easier by requiring standardized formats, three
            standard mortgage compositions alongside custom offers, clear rate
            locks, and online submission.
          </p>
          <PullQuote>
            Research shows that obtaining just one comparison offer saves 7–8
            basis points. Four comparison offers save 16–20 basis points —
            potentially hundreds of thousands of shekels over the life of the
            loan.
          </PullQuote>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Major Banks
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>
              <strong>Bank Leumi</strong> — large portfolio, some international
              client experience
            </li>
            <li>
              <strong>Bank Hapoalim</strong> — one of the largest lenders
            </li>
            <li>
              <strong>Mizrahi-Tefahot</strong> — widely regarded as having the
              best English-speaking mortgage department
            </li>
            <li>
              <strong>Israel Discount Bank</strong> — standard products
            </li>
            <li>
              <strong>Mercantile Discount Bank</strong> — Discount subsidiary
            </li>
            <li>
              <strong>Bank of Jerusalem</strong> — competitive for foreign
              currency mortgages
            </li>
          </ul>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Use a Mortgage Broker
          </h3>
          <p className="mb-4">
            For English speakers, an English-speaking mortgage broker is close
            to a necessity. A good broker translates the process, structures
            your track composition, submits to multiple banks, and negotiates
            with competing offers as leverage. Brokers are typically paid by the
            bank, though some charge advisory fees — clarify upfront.
          </p>
        </>
      ),
    },
    {
      id: "common-mistakes",
      title: "Common Mistakes English Speakers Make",
      content: (
        <>
          <ol className="list-decimal pl-6 space-y-4 mb-4 marker:text-sage marker:font-semibold">
            <li>
              <strong>Focusing on rate instead of structure.</strong> In Israel,
              mortgage composition matters as much as the headline rate. A low
              prime-linked rate with 60% variable exposure may cost more than a
              slightly higher fixed-rate structure.
            </li>
            <li>
              <strong>Assuming the bank will guide you.</strong> Israeli banks
              process applications — they don't explain trade-offs, recommend
              compositions, or hold your hand through the process.
            </li>
            <li>
              <strong>Not understanding "no mortgage contingency."</strong>{" "}
              Once you sign the purchase contract, you owe the seller regardless
              of financing. This catches more English speakers off guard than
              almost anything else.
            </li>
            <li>
              <strong>Starting too late.</strong> Begin documentation, broker
              consultation, and ishur ekroni applications months before you
              expect to sign.
            </li>
            <li>
              <strong>Not comparing offers.</strong> Accepting the first offer
              is one of the costliest mistakes a borrower can make.
            </li>
            <li>
              <strong>Underestimating documentation.</strong> Foreign income
              documentation, certified translations, notarized statements — the
              burden is heavier than for native Israelis. Get it right before
              submitting.
            </li>
            <li>
              <strong>Ignoring the CPI-indexed track.</strong> Neither blind
              avoidance nor blind acceptance is appropriate. Understand how the{" "}
              <em>madad</em> affects your balance and make a conscious decision
              about CPI exposure.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "foreign-buyers",
      title: "Foreign Residents and Non-Citizens",
      content: (
        <>
          <p className="mb-4">
            If you are not an Israeli citizen or permanent resident — a diaspora
            investor or vacation-property buyer — the landscape is more
            restrictive.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>
              <strong>Lower LTV:</strong> Typically 50% (some banks up to 60%)
            </li>
            <li>
              <strong>Foreign currency tracks:</strong> More accessible and
              often beneficial if your income is in USD, EUR, or GBP
              <br />
              → If your income is in USD, EUR, or GBP, see our <Link to="/guides/exchange-rates" className="text-horizon-blue hover:underline">Exchange Rate Guide</Link> for strategies and risk management.
            </li>
            <li>
              <strong>Higher documentation burden:</strong> Expect a longer
              process with more back-and-forth
            </li>
            <li>
              <strong>No zakaut benefits:</strong> Government-subsidized
              mortgage is for olim only
            </li>
            <li>
              <strong>Higher purchase tax:</strong> Non-resident buyers pay
              significantly higher <em>mas rechisha</em> than first-time Israeli
              buyers
            </li>
          </ul>
          <p className="mb-4">
            Remote applications are possible — some banks and brokers handle
            them, typically requiring a local representative via power of
            attorney.
          </p>
        </>
      ),
    },
    {
      id: "additional-costs",
      title: "Additional Costs Beyond the Mortgage",
      content: (
        <>
          <ul className="list-disc pl-6 space-y-3 mb-4 marker:text-sage">
            <li>
              <strong>Lawyer's fees:</strong> 0.5–1% of purchase price + VAT
            </li>
            <li>
              <strong>Purchase tax (mas rechisha):</strong> First-time Israeli
              resident buyers pay 0% on the first ~
              <span className="text-horizon-blue font-semibold">
                {fmtNIS(1980000)}
              </span>
              , then 3.5% up to ~
              <span className="text-horizon-blue font-semibold">
                {fmtNIS(5340000)}
              </span>
              . Olim within 7 years get even better rates. Non-residents start
              at 8%.
              <br />
              → See our <Link to="/guides/purchase-tax" className="text-horizon-blue hover:underline">Purchase Tax Guide</Link> for the full bracket breakdown.
            </li>
            <li>
              <strong>Bank fees:</strong> Processing, appraisal, and related
              charges — typically{" "}
              <span className="text-horizon-blue font-semibold">
                {fmtNIS(3000)}–{fmtNIS(8000)}
              </span>
            </li>
            <li>
              <strong>Property appraisal (shuma):</strong>{" "}
              <span className="text-horizon-blue font-semibold">
                {fmtNIS(2000)}–{fmtNIS(4000)}
              </span>
            </li>
            <li>
              <strong>Mortgage life insurance:</strong> Required by the bank
            </li>
            <li>
              <strong>Property insurance:</strong> Also required — covers the
              physical structure
            </li>
            <li>
              <strong>Certified translations:</strong> Several thousand shekels
              for foreign documents
            </li>
            <li>
              <strong>Ongoing costs:</strong> Arnona (municipal tax), va'ad
              bayit (maintenance), utilities
              <br />
              → For a complete guide to arnona rates, discounts, and the olim discount, see our <Link to="/guides/arnona" className="text-horizon-blue hover:underline">Arnona Guide</Link>.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "rates-in-context",
      title: "Interest Rates in Context",
      content: (
        <>
          <p className="mb-4">
            Israel's rate environment has shifted significantly. After
            historically low rates, the BOI raised aggressively from 2022–2023
            (near-zero to 4.75% peak). The policy rate has since been
            gradually reduced to{" "}
            <LiveValue value={rates.boiRate} />, with the prime rate at{" "}
            <LiveValue value={rates.primeMargin} />.
          </p>
          <p className="mb-4">
            Rates are lower than their 2023 peak but remain well above the
            ultra-low levels of 2020–2021. This guide intentionally avoids
            forecasting. What matters is understanding how each track behaves
            under different rate scenarios and structuring your mortgage
            accordingly with professional help.
          </p>
          <CalloutBox>
            This guide is informational only and does not constitute legal or
            financial advice. Mortgage rates, regulations, and government
            benefits change frequently. Always verify details with a licensed
            mortgage broker, your bank, or the Bank of Israel.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "glossary",
      title: "Hebrew Mortgage Glossary",
      content: (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                  Hebrew
                </th>
                <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                  Transliteration
                </th>
                <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid-line font-body text-[14px]">
              {[
                ["משכנתא", "Mashkanta", "Mortgage"],
                ["מסלול", "Maslul", "Track — a component with its own rate"],
                ["ריבית", "Ribbit", "Interest rate"],
                ["מדד", "Madad", "CPI index used for inflation linkage"],
                ["קבועה לא צמודה", "Kvu'a lo tzamuda", "Non-indexed fixed rate"],
                ["קבועה צמודה", "Kvu'a tzamuda", "CPI-indexed fixed rate"],
                ["משתנה פריים", "Mishtana prime", "Prime-linked variable rate"],
                ["אישור עקרוני", "Ishur ekroni", "Approval in principle"],
                ["שומה", "Shuma", "Property appraisal"],
                ["טאבו", "Tabu", "Land Registry"],
                ["תעודת זכאות", "Teudat zakaut", "Eligibility certificate"],
                ["משכנתא זכאות", "Mashkanta zakaut", "Subsidized mortgage for olim"],
                ["חוזה רכישה", "Chozeh rechisha", "Purchase contract"],
                ["מס רכישה", "Mas rechisha", "Purchase tax"],
                ["ביטוח חיים", "Bituach chaim", "Mortgage life insurance"],
                ["ביטוח מבנה", "Bituach mivne", "Property insurance"],
                ["פירעון מוקדם", "Piraon mukdam", "Early repayment"],
                ["הון עצמי", "Hon atzmi", "Down payment / equity"],
                ["יועץ משכנתאות", "Yo'etz mashkanta'ot", "Mortgage broker"],
              ].map(([heb, trans, eng]) => (
                <tr key={trans}>
                  <td className="py-2 px-3 text-charcoal" dir="rtl">
                    {heb}
                  </td>
                  <td className="py-2 px-3 text-charcoal">{trans}</td>
                  <td className="py-2 px-3 text-charcoal">{eng}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <GuidePage
      title="Israeli Mortgages Explained — Complete English Guide"
      seoTitle="Israeli Mortgages Explained — Complete English Guide | Navlan"
      subtitle="Tracks, rates, olim benefits, and the approval process — everything English speakers need to know about the mashkanta."
      date="Last updated: March 2026"
      readTime="~25 min read"
      metaDescription="Complete English guide to Israeli mortgages (mashkanta). Mortgage tracks, current rates, olim benefits, Bank of Israel regulations, and the approval process — for English speakers, olim, and diaspora buyers."
      sections={sections}
      bottomNav={{
        prev: { label: "Dira BeHanacha Guide", to: "/guides/dira-behanacha" },
        next: { label: "Resources", to: "/resources" },
      }}
      related={[
        { label: "Current Mortgage Rates", to: "/market" },
        { label: "Dira BeHanacha Guide", to: "/guides/dira-behanacha" },
        { label: "Start Here Guide", to: "/guides/start-here" },
      ]}
      headerContent={<>{tldr}{quickRef}<CalloutBox title="Mortgage Calculator">Want to see what these rates mean for your monthly payment? Try our{" "}<Link to="/tools/mortgage-calculator" className="text-[#4A7F8B] underline hover:text-sage">Mortgage Calculator</Link> — estimate payments using live BOI rates across all four tracks.</CalloutBox></>}
    />
  );
};

export default MortgageGuidePage;
