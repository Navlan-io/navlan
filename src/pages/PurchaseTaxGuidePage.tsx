// PURCHASE TAX BRACKETS: Frozen 2025-2027 per government decision.
// Values must be updated when new brackets are published (expected 2028).
// Source: Israel Tax Authority mas rechisha brackets.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import { Card } from "@/components/ui/card";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";
import { supabase } from "@/integrations/supabase/client";
import { useSiteParameters } from "@/hooks/useSiteParameters";
import { AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Live-data hook — fetches latest USD exchange rate from Supabase     */
/* ------------------------------------------------------------------ */

function useUsdRate(): { usdRate: number; loading: boolean } {
  const [state, setState] = useState({ usdRate: 3.688, loading: true });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("exchange_rates")
          .select("rate")
          .eq("currency", "USD")
          .order("rate_date", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setState({ usdRate: data[0].rate, loading: false });
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    };
    fetch_();
  }, []);

  return state;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const PurchaseTaxGuidePage = () => {
  const { usdRate } = useUsdRate();
  const { data: params } = useSiteParameters();

  /** Convert NIS to approximate USD using live rate */
  const nisToUsd = (nis: number) => {
    const usd = Math.round(nis / usdRate / 1000) * 1000;
    return `~$${usd.toLocaleString()}`;
  };

  /* ---------------------------------------------------------------- */
  /*  TL;DR                                                            */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• Purchase tax is a one-time tax paid by the buyer — the single largest variable cost in an Israeli property transaction.</li>
        <li>• Israeli residents buying their sole dwelling pay 0% on the first ~₪1.98M, then 3.5%–10% on higher amounts. Investors and foreign buyers pay 8% from the first shekel.</li>
        <li>• Olim get the best rates: 0% up to ~₪1.99M, then only 0.5% up to ~₪6.05M. On a ₪4M apartment, an oleh pays ~₪10K vs. ~₪95K for a standard resident.</li>
        <li>• The olim benefit is available for <span className="text-[#4A7F8B] font-medium">{params?.olim_purchase_tax_window?.display_label || '7 years'}</span> after aliyah. Filing is due within 30 days of signing; payment within 60 days.</li>
        <li>• Tax brackets are frozen from 2025 through <span className="text-[#4A7F8B] font-medium">{params?.purchase_tax_freeze_end?.display_label || '2027'}</span> — no inflation adjustments, which is effectively a stealth tax increase.</li>
        <li>• If you buy a new home and sell your old one within 24 months, you can retroactively qualify for the lower sole-dwelling rate.</li>
        <li>• Your lawyer handles the entire filing and payment process.</li>
      </ul>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Quick Reference box                                              */
  /* ---------------------------------------------------------------- */

  const quickRef = (
    <CalloutBox title="Quick Reference: Key Facts at a Glance">
      <ul className="list-disc pl-4 space-y-1.5 mt-2">
        <li>
          <strong>What it is:</strong> A one-time tax paid by the BUYER on every
          real estate purchase in Israel
        </li>
        <li>
          <strong>Filing deadline:</strong> Declaration (shuma atzmit) must be
          filed within 30 days of signing the purchase contract
        </li>
        <li>
          <strong>Payment deadline:</strong> 60 days from signing the purchase
          contract — not from closing or key handover
        </li>
        <li>
          <strong>Sole dwelling (dira yechida) benefit:</strong> Israeli
          residents buying their only home pay 0% on the first ~₪1,978,745
        </li>
        <li>
          <strong>Investment / additional property rate:</strong> 8% from the
          first shekel (no zero bracket)
        </li>
        <li>
          <strong>Olim benefit:</strong> 0% on the first ~₪1,988,090 and only
          0.5% up to ~₪6,055,070 — available within <span className="text-[#4A7F8B] font-medium">{params?.olim_purchase_tax_window?.display_label || '7 years'}</span> of aliyah
        </li>
        <li>
          <strong>Foreign residents:</strong> Pay the same elevated rate as
          investors — 8% from the first shekel
        </li>
        <li>
          <strong>Bracket freeze:</strong> Tax thresholds are frozen from 2025
          through <span className="text-[#4A7F8B] font-medium">{params?.purchase_tax_freeze_end?.display_label || '2027'}</span> (no inflation adjustments)
        </li>
        <li>
          <strong>Commercial and land:</strong> Flat 6% rate on all
          non-residential property purchases
        </li>
      </ul>
    </CalloutBox>
  );

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "what-is-purchase-tax",
      title: "What Is Purchase Tax (Mas Rechisha)?",
      content: (
        <>
          <p className="mb-4">
            Purchase tax — mas rechisha (מס רכישה) — is a one-time transaction
            tax levied on the buyer of any real estate in Israel. If you are
            buying property, you pay this tax. The seller does not.
          </p>
          <p className="mb-4">
            This is worth emphasizing because it catches many English speakers
            off guard. In the United States, transfer taxes are typically split
            between buyer and seller, or paid primarily by the seller. In the
            UK, Stamp Duty Land Tax is paid by the buyer — so British buyers
            will find this more familiar. In Israel, there is no ambiguity: the
            buyer pays, every time, on every type of real estate.
          </p>
          <p className="mb-4">
            Mas rechisha applies to all real property transactions: apartments,
            houses, commercial buildings, offices, land, parking spaces, and
            storage units. It applies whether you are buying from an individual,
            a developer, or at auction. It applies whether you are an Israeli
            citizen, a new immigrant, or a foreign national. The only variable
            is the rate — and the rate differences between buyer categories are
            dramatic.
          </p>
          <p className="mb-4">
            The tax is calculated on the full purchase price stated in the
            contract. If the Israel Tax Authority (<em>rashut hamissim</em>,
            רשות המיסים) believes the declared price is below market value, it
            has the authority to reassess the value upward and calculate the tax
            on that higher figure.
          </p>
          <p className="mb-4">
            One important distinction: purchase tax is entirely separate from
            VAT (<em>ma'am</em>, מע"מ). New apartments purchased from a
            developer include <span className="text-[#4A7F8B] font-medium">{params?.vat_rate?.display_label || '18%'}</span> VAT in the listed price. Purchase tax is then
            calculated on the full VAT-inclusive purchase price.
          </p>
        </>
      ),
    },
    {
      id: "current-brackets",
      title: "Current Tax Brackets (2025–2027)",
      content: (
        <>
          <p className="mb-4">
            Israel's purchase tax operates on a tiered bracket system — similar
            in concept to income tax brackets. You do not pay one flat rate on
            the entire purchase price. Instead, different portions of the price
            fall into different brackets, each taxed at its own rate. Your total
            tax bill is the sum of the amounts calculated within each bracket.
          </p>

          <CalloutBox title="Important: The Bracket Freeze (2025–2027)" icon={AlertTriangle}>
            Normally, the NIS thresholds for each bracket are updated annually
            based on changes in the Consumer Price Index. However, as part of
            broader fiscal measures, the government froze all purchase tax
            brackets from 2025 through <span className="text-[#4A7F8B] font-medium">{params?.purchase_tax_freeze_end?.display_label || '2027'}</span>. This means the thresholds listed
            below will not be adjusted for inflation during this period.
            Indexation is expected to resume in 2028. The practical effect: as
            property prices continue to rise but bracket thresholds stay flat,
            more of the purchase price falls into higher tax brackets. This is
            effectively a stealth tax increase.
          </CalloutBox>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Category 1: Israeli Residents — Sole Dwelling (Dira Yechida)
          </h3>
          <p className="mb-4">
            This is the most favorable rate schedule, available to Israeli
            residents purchasing what qualifies as their only residential
            property (<em>dira yechida</em>, דירה יחידה). The rules for what
            counts as a "sole dwelling" are covered in detail in Section 3.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Property Value (NIS)
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">Up to ₪1,978,745</td>
                  <td className="py-2 px-3 text-charcoal">0%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪1,978,746 – ₪2,347,040
                  </td>
                  <td className="py-2 px-3 text-charcoal">3.5%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪2,347,041 – ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">5%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪6,055,071 – ₪20,183,565
                  </td>
                  <td className="py-2 px-3 text-charcoal">8%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Above ₪20,183,565
                  </td>
                  <td className="py-2 px-3 text-charcoal">10%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            These are the 2024 thresholds, which remain frozen through <span className="text-[#4A7F8B] font-medium">{params?.purchase_tax_freeze_end?.display_label || '2027'}</span>
            under the bracket freeze. Under this schedule, an Israeli resident
            buying their sole dwelling for ₪1,900,000 pays zero purchase tax.
            That is a significant benefit — and it is the reason the "sole
            dwelling" classification matters so much.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Category 2: Israeli Residents — Additional Property (Investment /
            Second Home)
          </h3>
          <p className="mb-4">
            If you are an Israeli resident purchasing a property that is not
            your sole dwelling — whether it is an investment property, a second
            home, a vacation apartment, or any additional residential property —
            the rates are dramatically higher.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Property Value (NIS)
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">8%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Above ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">10%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            There is no 0% bracket here. Tax is charged from the first shekel
            at 8%. On a ₪2,500,000 investment apartment, that is ₪200,000 in
            purchase tax. These elevated investment rates were introduced as a
            temporary measure to cool the housing market. They have been
            extended multiple times and currently remain in effect through at
            least December 31, 2026.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Category 3: New Immigrants (Olim Chadashim)
          </h3>
          <p className="mb-4">
            Olim receive the most favorable purchase tax treatment of any buyer
            category. Following a significant law change in August 2024, the
            rates for eligible olim are:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Property Value (NIS)
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪1,988,090
                  </td>
                  <td className="py-2 px-3 text-charcoal">0%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪1,988,091 – ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">0.5%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Above ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">
                    Standard rates (8% / 10%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            <strong>Maximum property value cap:</strong> If the total purchase
            price exceeds approximately ₪20,183,565, the oleh benefit cannot be
            used at all, and standard rates apply to the entire purchase.
          </p>
          <p className="mb-4">
            The middle bracket — 0.5% — is what makes the olim benefit so
            powerful. A regular Israeli resident buying a sole dwelling at
            ₪4,000,000 would pay approximately ₪95,500 in purchase tax. An
            eligible oleh buying the same apartment would pay approximately
            ₪10,060.
          </p>
          <PullQuote>
            The difference is enormous. An oleh purchasing at ₪4,000,000 pays
            ~₪10,060 in purchase tax — compared to ~₪95,500 for a standard
            Israeli resident. That is not a typo.
          </PullQuote>
          <p className="mb-4">
            These rates apply to purchase contracts signed after August 15,
            2024. Olim who made aliyah before that date have the option to
            choose whether to use the pre-August 2024 rates or the new rates —
            whichever is more favorable. Full details on olim eligibility are in
            Section 4.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Category 4: Foreign Residents / Non-Citizens
          </h3>
          <p className="mb-4">
            Foreign residents — anyone who is not an Israeli citizen or permanent
            resident — are taxed at the same rates as Israeli investors buying
            additional properties:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Property Value (NIS)
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">8%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Above ₪6,055,070
                  </td>
                  <td className="py-2 px-3 text-charcoal">10%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            This applies regardless of whether the property is the foreign
            buyer's only real estate holding in Israel or worldwide. The "sole
            dwelling" benefit is not available to foreign residents. A diaspora
            buyer purchasing a single ₪3,000,000 apartment in Jerusalem pays
            ₪240,000 in purchase tax — the same rate as an Israeli investor
            buying a fifth rental property. For some buyers, this differential
            alone is a meaningful factor in aliyah timing decisions.
          </p>
          <p className="mb-4 text-sm text-charcoal/70 italic">
            → Planning to rent before buying? See our <Link to="/guides/renting" className="text-horizon-blue hover:underline">Renting Guide</Link>.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Non-Residential Property: Commercial, Office, and Land
          </h3>
          <p className="mb-4">
            Commercial property, office space, and undeveloped land are taxed at
            a flat rate of <strong>6%</strong> of the purchase price, regardless
            of the buyer's residency status or how many properties they own.
            This flat rate applies to commercial buildings, retail space, office
            units, undeveloped land, industrial property, and warehouses. There
            is no tiered bracket system for non-residential purchases.
          </p>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "sole-dwelling-rules",
      title: "The \"Sole Dwelling\" (Dira Yechida) Rules",
      content: (
        <>
          <p className="mb-4">
            The difference between the sole dwelling rate and the investment
            rate is so large — potentially hundreds of thousands of shekels —
            that the classification of your purchase as a "sole dwelling" is one
            of the most consequential determinations in the buying process.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            What Qualifies as a Sole Dwelling
          </h3>
          <p className="mb-4">
            To qualify for the dira yechida (דירה יחידה) tax rate, you must
            meet ALL of the following conditions at the time of purchase:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-4 marker:text-sage marker:font-semibold">
            <li>
              <strong>You are an Israeli resident</strong> for tax purposes (
              <em>toshav yisrael</em>, תושב ישראל). This is determined by your
              "center of life" — where you live, work, and have family — not
              solely by citizenship or visa status.
            </li>
            <li>
              <strong>
                You do not own any other residential property in Israel.
              </strong>{" "}
              This means no apartments, no houses, no residential units of any
              kind — not even a partial ownership share.
            </li>
            <li>
              <strong>
                The property you are purchasing is a residential dwelling.
              </strong>{" "}
              Commercial property, land, and other non-residential purchases do
              not qualify for this benefit regardless of your ownership status.
            </li>
          </ol>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Exception: Owning a Small Share
          </h3>
          <p className="mb-4">
            There is a partial exception: if you own a share of one-third or
            less in another residential property, that small share is
            disregarded when determining sole dwelling status. This provision
            exists because many Israelis end up with fractional shares in family
            property through inheritance. A one-quarter share in your late
            grandmother's apartment does not, by itself, disqualify you from
            the sole dwelling rate.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The 24-Month Sale Window
          </h3>
          <CalloutBox title="Extended Window: 24 Months (Since June 2025)">
            If you buy a new apartment and sell your existing apartment within
            24 months, you can retroactively qualify for the sole dwelling rate
            on the new purchase. This window was extended from 18 months to 24
            months as of June 1, 2025. In practice: you file and pay at the
            higher (additional property) rate at the time of purchase, sell
            your existing apartment within 24 months, then apply for a
            reassessment and receive a refund. For off-plan purchases, the
            24-month window starts from the date the apartment is available for
            your use — typically the date you receive the keys — not from the
            contract signing date.
          </CalloutBox>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Does Property Owned Abroad Count?
          </h3>
          <CalloutBox title="Property Abroad Generally Does Not Disqualify You">
            The dira yechida test looks at residential property owned in
            Israel. A house in New Jersey, a flat in London, or an apartment
            in Melbourne does not, by itself, prevent you from claiming the
            sole dwelling rate on an Israeli purchase. However, your foreign
            property ownership may be relevant to the determination of your tax
            residency. If you own a home abroad and spend significant time
            there, the Tax Authority may question whether your "center of life"
            is really in Israel.
          </CalloutBox>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Joint Ownership Scenarios
          </h3>
          <p className="mb-4">
            <strong>Married couples:</strong> Under Israeli law, a married
            couple is treated as a single unit for purchase tax purposes. If
            either spouse owns residential property in Israel, neither spouse
            qualifies for the sole dwelling rate on a new purchase. This
            applies even if the existing property was purchased by one spouse
            before the marriage.
          </p>
          <p className="mb-4">
            <strong>Unmarried partners and common-law couples</strong> (
            <em>yadua betzibur</em>, ידוע/ה בציבור): Generally treated the
            same as married couples.
          </p>
          <p className="mb-4">
            <strong>Siblings or unrelated co-buyers:</strong> Each buyer's
            status is assessed independently. One sibling could qualify for the
            sole dwelling rate while the other pays the investment rate on their
            share.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Inherited Property
          </h3>
          <p className="mb-4">
            Inheriting residential property in Israel counts as ownership for
            sole dwelling purposes — with the one-third share exception noted
            above. If you inherited a full apartment (or more than one-third of
            one), you are considered a property owner and cannot claim the sole
            dwelling rate unless you sell or transfer the inherited property
            first. This catches many Anglo families off guard.
          </p>
        </>
      ),
    },
    {
      id: "olim-benefits",
      title: "Olim Benefits",
      content: (
        <>
          <p className="mb-4">
            The purchase tax discount for new immigrants is one of the most
            valuable financial benefits available to olim buying property in
            Israel. It has undergone significant changes in recent years, most
            notably with the August 2024 reform.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Who Qualifies as an "Oleh" for Purchase Tax Purposes?
          </h3>
          <p className="mb-4">
            Eligibility is based on having made aliyah under the Law of Return
            and holding a valid <em>teudat oleh</em> (תעודת עולה). You must
            have recognized oleh status; simply being an Israeli citizen is not
            sufficient if you did not immigrate under the Law of Return.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Eligibility Window: 7 Years
          </h3>
          <p className="mb-4">
            An oleh can use the purchase tax benefit for a property purchased
            within a window that begins <strong>one year before</strong> making
            aliyah and extends <strong><span className="text-[#4A7F8B] font-medium">{params?.olim_purchase_tax_window?.display_label || '7 years'}</span> after</strong> the date of
            aliyah. The one-year-before provision exists because many olim
            purchase property in Israel while preparing for their move.
          </p>
          <p className="mb-4">
            After the window expires, the benefit is gone. There is no mechanism to
            restart or extend it. For olim who made aliyah more
            than <span className="text-[#4A7F8B] font-medium">{params?.olim_purchase_tax_window?.display_label || '7 years'}</span> ago: you are assessed under the standard Israeli
            resident brackets, which still include the generous sole dwelling
            rates if you are buying your only home.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The August 2024 Reform: Old Rules vs. New Rules
          </h3>
          <p className="mb-4">
            The August 2024 amendment created the current structure: 0% up to
            ₪1,988,090, then 0.5% up to ₪6,055,070. This made the benefit
            substantially more generous for olim purchasing in the ₪2–6 million
            range — exactly where most Anglo olim buying in Jerusalem, Tel
            Aviv, Ra'anana, and other popular cities land.
          </p>
          <CalloutBox>
            <strong>Important for olim who made aliyah before August 15, 2024:</strong>{" "}
            You have the right to choose whichever rate schedule is more
            favorable — the pre-amendment rates or the post-amendment rates. In
            most cases the new rates will be better, but if your purchase falls
            in an unusual price range, have your lawyer run the numbers both
            ways.
          </CalloutBox>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            How It Interacts With the Sole Dwelling Discount
          </h3>
          <p className="mb-4">
            The olim benefit is a separate and distinct rate schedule — it is
            not stacked on top of the sole dwelling benefit. You use one or the
            other, not both. The post-August 2024 olim benefit is only
            available for purchases that qualify as the oleh's sole residential
            property.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Toshav Chozer (Returning Residents)
          </h3>
          <p className="mb-4">
            A <em>toshav chozer vatik</em> (veteran returning resident) — an
            Israeli who lived abroad for at least 10 consecutive years —
            receives benefits broadly similar to those available to new olim.
            A regular <em>toshav chozer</em> (6+ years abroad, fewer than 10)
            receives some benefits, but they are generally less generous.
            Consult a tax attorney for current rates specific to your situation.
          </p>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "how-to-calculate",
      title: "How to Calculate Your Tax",
      content: (
        <>
          <p className="mb-4">
            Purchase tax is calculated by applying each bracket's rate to the
            portion of the purchase price that falls within that bracket, then
            summing the results.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Example 1: Israeli Resident — Sole Dwelling at ₪2,500,000
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Bracket
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Portion
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Rate
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪1,978,745
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪1,978,745</td>
                  <td className="py-2 px-3 text-charcoal">0%</td>
                  <td className="py-2 px-3 text-charcoal">₪0</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪1,978,746 – ₪2,347,040
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪368,295</td>
                  <td className="py-2 px-3 text-charcoal">3.5%</td>
                  <td className="py-2 px-3 text-charcoal">₪12,890</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪2,347,041 – ₪2,500,000
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪152,960</td>
                  <td className="py-2 px-3 text-charcoal">5%</td>
                  <td className="py-2 px-3 text-charcoal">₪7,648</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2 px-3 text-charcoal">Total</td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal">₪20,538</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            That is roughly 0.82% of the purchase price — far lower than what
            many English speakers expect from the term "purchase tax." Now
            compare: if this same buyer were purchasing a second property at
            the same price, the tax would be ₪2,500,000 × 8% ={" "}
            <strong>₪200,000</strong>.
          </p>
          <PullQuote>
            The sole dwelling classification just saved ₪179,462. That is the
            difference between 0.82% and 8% — on the exact same apartment.
          </PullQuote>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Example 2: Oleh — Purchasing Within the Benefit Window at
            ₪3,500,000
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Bracket
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Portion
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Rate
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪1,988,090
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪1,988,090</td>
                  <td className="py-2 px-3 text-charcoal">0%</td>
                  <td className="py-2 px-3 text-charcoal">₪0</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    ₪1,988,091 – ₪3,500,000
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪1,511,910</td>
                  <td className="py-2 px-3 text-charcoal">0.5%</td>
                  <td className="py-2 px-3 text-charcoal">₪7,560</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2 px-3 text-charcoal">Total</td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal">₪7,560</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            For comparison, a non-oleh Israeli resident would pay approximately
            ₪70,538 on the same ₪3,500,000 sole dwelling. The oleh saves
            approximately ₪63,000 on this transaction. On more expensive
            properties, the savings grow even larger.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            Example 3: Investor — Second Property at ₪2,500,000
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Bracket
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Portion
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Rate
                  </th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">
                    Up to ₪2,500,000
                  </td>
                  <td className="py-2 px-3 text-charcoal">₪2,500,000</td>
                  <td className="py-2 px-3 text-charcoal">8%</td>
                  <td className="py-2 px-3 text-charcoal">₪200,000</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2 px-3 text-charcoal">Total</td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal"></td>
                  <td className="py-2 px-3 text-charcoal">₪200,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            That is 8% of the purchase price — a very significant cost that
            must be factored into any investment return calculation. For a
            foreign resident buying the same apartment at the same price, the
            tax is identical: ₪200,000.
          </p>
        </>
      ),
    },
    {
      id: "when-and-how-to-pay",
      title: "When and How to Pay",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            The Filing Obligation: Shuma Atzmit
          </h3>
          <p className="mb-4">
            Within <strong>30 days</strong> of signing the purchase contract (
            <em>chozeh rechisha</em>), the buyer must file a self-assessment
            declaration — <em>shuma atzmit</em> (שומה עצמית) — with the Land
            Taxation Authority (<em>misui mekarkein</em>, מיסוי מקרקעין). In
            practice, your real estate lawyer handles this filing. It is a
            standard part of the lawyer's role.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Payment Deadline: 60 Days
          </h3>
          <p className="mb-4">
            The purchase tax must be paid within <strong>60 days</strong> of
            signing the purchase contract. Not 60 days from closing. Not 60
            days from receiving the keys. Sixty days from the date the contract
            is signed. This catches some buyers off guard, particularly those
            buying off-plan where the move-in date might be years away.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            What Happens If You Pay Late
          </h3>
          <p className="mb-4">
            Late payment triggers interest and linkage differentials (
            <em>hatzamada veribit</em>, הצמדה וריבית) — the overdue amount is
            indexed to inflation and charged interest from the date it was
            originally due. The Tax Authority can also impose financial
            penalties for late filing. There is no grace period.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Lawyer's Role
          </h3>
          <p className="mb-4">
            In an Israeli real estate transaction, the lawyer (<em>orech din</em>
            , עורך דין) handles the entire purchase tax process: calculating
            the tax, preparing and filing the shuma atzmit, arranging payment,
            handling correspondence with misui mekarkein, and applying for
            refunds or reassessments. The lawyer's fee for the overall
            transaction — typically <span className="text-[#4A7F8B] font-medium">{params?.lawyer_fee_range?.display_label || '0.5–1.5% + VAT'}</span> of the purchase price —
            includes purchase tax filing.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Tax Authority's Assessment
          </h3>
          <p className="mb-4">
            After receiving the shuma atzmit, the Tax Authority may accept the
            self-assessment or issue its own assessment (<em>shuma</em>) if it
            disagrees with the declared price, buyer classification, or
            calculation. The Tax Authority actively reviews declarations —
            particularly those claiming the sole dwelling rate or olim
            benefits.
          </p>
        </>
      ),
    },
    {
      id: "common-scenarios",
      title: "Common Scenarios Anglos Face",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            "I own a home in the US — does that affect my rate?"
          </h3>
          <p className="mb-4">
            If you are an Israeli tax resident (your center of life is in
            Israel), owning property abroad does not by itself affect your
            purchase tax rate in Israel. The sole dwelling test looks at
            Israeli residential property ownership, not worldwide property
            ownership. However, if you maintain a home abroad and spend
            significant time there, the Tax Authority may question your Israeli
            tax residency.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            "My parents are gifting me the down payment"
          </h3>
          <p className="mb-4">
            A gift of money to fund a down payment does not trigger purchase
            tax. However, if parents transfer <em>property</em> to the child,
            that transfer is itself a transaction subject to purchase tax —
            even if no money changes hands. Close-family transfers receive a
            reduced rate: purchase tax at one-third of the normal applicable
            rate.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            "We're buying as a couple but only one of us is an oleh"
          </h3>
          <p className="mb-4">
            For a married couple, the Tax Authority looks at the couple as a
            unit. In general, if one spouse is an oleh within the eligibility
            window, the couple can claim the olim benefit — provided the
            purchase qualifies as their sole dwelling. If the non-oleh spouse
            owns existing residential property in Israel, that may disqualify
            the couple from both the olim benefit and the sole dwelling rate.
            Professional advice is particularly important here.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            "We want to buy now and sell our current apartment within 2 years"
          </h3>
          <p className="mb-4">
            This is the 24-month sale window scenario described in Section 3.
            You will initially be assessed at the investment rate (8%/10%).
            After selling your existing apartment within 24 months, your lawyer
            files a <em>tikkun shuma</em> (amended assessment) requesting the
            refund. Budget for having the higher tax amount out of pocket for
            the interim period.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            "I'm buying off-plan — when does the tax clock start?"
          </h3>
          <p className="mb-4">
            The filing deadline (30 days) and payment deadline (60 days) run
            from the date you sign the purchase contract — even if the
            apartment has not been built yet. However, for the 24-month sale
            window, the clock for selling your old property starts from the
            date the new apartment is available for use — typically the key
            handover date.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            "I inherited a share of my grandmother's apartment"
          </h3>
          <p className="mb-4">
            If you inherited one-third or less, that share is disregarded for
            sole dwelling classification purposes. If you inherited more than
            one-third, you are considered an owner of residential property and
            cannot claim the sole dwelling rate unless you sell or transfer the
            inherited share first. The one-third threshold is assessed per
            property.
          </p>
        </>
      ),
    },
    {
      id: "cost-comparison",
      title: "Purchase Tax vs. Other Buying Costs",
      content: (
        <>
          <p className="mb-4">
            Purchase tax is the single largest variable cost in an Israeli
            property transaction — but it is not the only cost. Understanding
            where mas rechisha fits within the full cost picture helps with
            budgeting.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            The Full Cost Breakdown
          </h3>
          <ul className="list-disc pl-6 space-y-3 mb-4 marker:text-sage">
            <li>
              <strong>Purchase tax (mas rechisha):</strong> 0% for eligible
              sole dwelling buyers at lower price points to 8–10% for investors
              and foreign residents.
            </li>
            <li>
              <strong>Lawyer's fees:</strong> <span className="text-[#4A7F8B] font-medium">{params?.lawyer_fee_range?.display_label || '0.5–1.5% + VAT'}</span> of purchase price.
            </li>
            <li>
              <strong>Real estate agent fees:</strong> Typically 2% + VAT per
              side.
            </li>
            <li>
              <strong>Mortgage-related costs:</strong> Appraisal (₪2,000–
              ₪4,000), bank processing fees (₪3,000–₪8,000), mortgage life
              insurance, property insurance.
            </li>
            <li>
              <strong>Betterment tax (hetel hashbacha):</strong> Paid by the
              seller, not the buyer — though sellers sometimes try to negotiate
              that the buyer absorbs it.
            </li>
            <li>
              <strong>VAT on new construction:</strong> <span className="text-[#4A7F8B] font-medium">{params?.vat_rate?.display_label || '18%'}</span> — typically
              included in the listed sale price from developers.
            </li>
          </ul>
          <p className="mb-4 text-sm text-charcoal/70 italic">
            → For ongoing costs after purchase including arnona, see our <Link to="/guides/arnona" className="text-horizon-blue hover:underline">Arnona Guide</Link>.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            How Israel Compares to the US and UK
          </h3>
          <p className="mb-4">
            <strong>
              Israel — sole dwelling buyer at ₪2,500,000 ({nisToUsd(2500000)}):
            </strong>{" "}
            Purchase tax ~₪20,000, lawyer ~₪40,000, agent ~₪59,000, mortgage
            costs ~₪10,000.{" "}
            <strong>
              Total: approximately ₪129,000 (roughly 5.2% of purchase price).
            </strong>
          </p>
          <p className="mb-4">
            <strong>Israel — investor/foreign buyer at ₪2,500,000:</strong>{" "}
            Purchase tax ₪200,000, lawyer ~₪40,000, agent ~₪59,000, mortgage
            costs ~₪10,000.{" "}
            <strong>
              Total: approximately ₪309,000 (roughly 12.4% of purchase price).
            </strong>
          </p>
          <p className="mb-4">
            In the US, typical buyer closing costs run 2–5%. In the UK, Stamp
            Duty plus legal and survey costs run roughly 3–4% at a comparable
            price point. The takeaway: for sole dwelling buyers, Israel's total
            costs are broadly comparable. For investors and foreign buyers, the
            8% purchase tax makes Israel meaningfully more expensive.
          </p>
          <p className="mb-4 text-sm text-charcoal/70 italic">
            → See our <Link to="/guides/exchange-rates" className="text-horizon-blue hover:underline">Exchange Rate Guide</Link> for understanding NIS-USD conversions.
          </p>
        </>
      ),
    },
    {
      id: "appeals-and-corrections",
      title: "Appeals and Corrections",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
            If You Think You Were Assessed Incorrectly
          </h3>
          <p className="mb-4">
            If the Tax Authority issues an assessment that you disagree with,
            you have the right to file an objection (<em>hashaga</em>, השגה)
            within <strong>30 days</strong> of receiving the assessment notice.
            The objection is filed with the regional misui mekarkein office.
            Your lawyer typically handles this.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            If the Objection Is Rejected
          </h3>
          <p className="mb-4">
            You can appeal to the District Court sitting as a Land Taxation
            Appeals Committee (<em>va'adat erurim</em>, ועדת ערורים). The
            appeal must be filed within <strong>30 days</strong> of receiving
            the Tax Authority's response. In practice, many disputes are
            resolved at the objection stage.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-6 mb-3">
            If Your Circumstances Changed After Filing
          </h3>
          <p className="mb-4">
            The most common scenario: you purchased at the investment rate and
            then sold your existing property within 24 months. You file a{" "}
            <em>tikkun shuma</em> (תיקון שומה) — an amended assessment request.
            Processing typically takes several months, but the refund can be
            substantial.
          </p>
        </>
      ),
    },
    {
      id: "glossary",
      title: "Hebrew Tax Terms Glossary",
      content: (
        <>
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
                  ["מס רכישה", "Mas rechisha", "Purchase tax — the buyer's transaction tax on real estate"],
                  ["דירה יחידה", "Dira yechida", "Sole dwelling — triggers the lowest residential tax rates"],
                  ["שומה עצמית", "Shuma atzmit", "Self-assessment — filed within 30 days of signing"],
                  ["שומה", "Shuma", "Assessment — the Tax Authority's own determination"],
                  ["תיקון שומה", "Tikkun shuma", "Amended assessment — request to revise a previous assessment"],
                  ["השגה", "Hashaga", "Objection — a formal dispute of the assessment"],
                  ["ערעור", "Irur", "Appeal — taking a dispute to court"],
                  ["מיסוי מקרקעין", "Misui mekarkein", "Land Taxation — handles real estate taxes"],
                  ["רשות המיסים", "Rashut hamissim", "Israel Tax Authority"],
                  ["היטל השבחה", "Hetel hashbacha", "Betterment tax — levy on value increase from planning changes"],
                  ["טאבו", "Tabu", "Land Registry — Israel's property registration system"],
                  ["עולה חדש", "Oleh chadash", "New immigrant under the Law of Return"],
                  ["תושב חוזר", "Toshav chozer", "Returning resident"],
                  ["תושב חוזר ותיק", "Toshav chozer vatik", "Veteran returning resident (10+ years abroad)"],
                  ["מע\"מ", "Ma'am (VAT)", "Value Added Tax — Israel's standard rate"],
                  ["חוזה רכישה", "Chozeh rechisha", "Purchase contract"],
                  ["הצמדה וריבית", "Hatzamada veribit", "Linkage and interest — inflation + interest on overdue payments"],
                  ["עורך דין", "Orech din", "Lawyer / attorney"],
                  ["דמי תיווך", "Dmei tivuch", "Brokerage / agent fees"],
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
          <CalloutBox>
            This guide is informational only and does not constitute legal or
            financial advice. Tax brackets, regulations, and government
            benefits change frequently. Always verify current details with a
            qualified Israeli tax attorney or accountant.
          </CalloutBox>
        </>
      ),
    },
  ];

  return (
    <GuidePage
      title="Israel Purchase Tax (Mas Rechisha) — Complete English Guide"
      seoTitle="Israel Purchase Tax (Mas Rechisha) — Complete English Guide | Navlan"
      subtitle="Tax brackets, olim benefits, sole dwelling rules, worked calculations, and the scenarios every Anglo buyer faces."
      date="Last updated: March 2026"
      readTime="~22 min read"
      metaDescription="Israel's purchase tax (mas rechisha) explained — 2025–2027 brackets, olim exemptions, sole dwelling rules, and worked calculations for common Anglo scenarios."
      sections={sections}
      bottomNav={{
        prev: { label: "Mortgages Guide", to: "/guides/mortgages" },
        next: { label: "Resources", to: "/resources" },
      }}
      related={[
        { label: "Israeli Mortgages Guide", to: "/guides/mortgages" },
        { label: "Dira BeHanacha Guide", to: "/guides/dira-behanacha" },
        { label: "Start Here Guide", to: "/guides/start-here" },
      ]}
      headerContent={<>{tldr}{quickRef}</>}
    />
  );
};

export default PurchaseTaxGuidePage;
