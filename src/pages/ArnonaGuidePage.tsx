import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const ArnonaGuidePage = () => {
  /* ---------------------------------------------------------------- */
  /*  TL;DR                                                            */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• Arnona is Israel's municipal property tax, paid by whoever occupies the property — usually the tenant if rented, the owner if vacant or owner-occupied.</li>
        <li>• It's calculated per square meter based on your property's zone, type, and size — NOT based on property value (unlike US property tax).</li>
        <li>• Rates vary dramatically by city: the same 80sqm apartment can cost ₪3,200/year in Beer Sheva and ₪9,600/year in Tel Aviv.</li>
        <li>• New olim get a 70–90% discount for 12 months during their first two years in Israel — but you have to apply for it, it's not automatic.</li>
        <li>• You cannot register a property transfer (at the Tabu) with outstanding arnona debt — the municipality must issue a clearance certificate.</li>
        <li>• Always transfer the arnona account when moving in or out. Failure to do so can leave you liable for someone else's bill.</li>
        <li>• Payment options include bi-monthly, monthly direct debit (usually with a small discount), or annual lump sum (1–2% discount).</li>
      </ul>
    </div>
  );

  const headerContent = <>{tldr}</>;

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "what-is-arnona",
      title: "What Is Arnona?",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            Arnona (ארנונה) is the municipal property tax levied by every local authority in Israel — whether that's a city (iriya/עירייה) or a local council (mo'atza mekomit/מועצה מקומית). It's collected to fund municipal services: waste collection, street maintenance, parks, local infrastructure, public lighting, and similar services.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            A few things that make arnona different from what you might be used to:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>It's paid by the occupant, not the owner.</strong> If you rent, you're typically the one paying arnona — not your landlord. This is the default unless your lease agreement explicitly states otherwise. If you own and live in your apartment, you pay. If you own and the apartment is empty, you still pay (though different rules may apply — see Section 5).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>It's a municipal tax, not a national one.</strong> There is no single arnona rate for Israel. Each municipality sets its own rate schedule, which must be approved annually by the Ministry of Interior. This means the same size apartment can cost dramatically different amounts in different cities — or even in different neighborhoods of the same city.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>It's based on property size, not value.</strong> This is the biggest conceptual difference from US property tax. Your arnona bill has nothing to do with what your apartment is worth on the market. It's calculated based on square meters, the zone your property falls in, and the property type. A ₪3M apartment and a ₪1.5M apartment on the same street, with the same floor area, pay the same arnona.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            For Anglo context: arnona is closer to UK council tax than US property tax, in the sense that it funds local services and the rate depends on the property's classification rather than its market valuation. But it's calculated differently from council tax too — there are no banding systems. It's a straight per-square-meter calculation.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            For a full overview of buying costs (including arnona as an ongoing expense), see our{" "}
            <Link to="/guides/start-here" className="text-horizon-blue hover:underline">Start Here Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "how-arnona-is-calculated",
      title: "How Arnona Is Calculated",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            The arnona formula has four main inputs:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Property size (square meters).</strong> The municipality has a measurement on file for your property. This is the single biggest factor in your bill. More square meters = higher arnona. The municipality's measurement may not match your own — and if it doesn't, you can dispute it (see Section 9).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Zone (ezor/אזור).</strong> Every municipality divides its territory into zones (ezorim/אזורים), and each zone has a different rate per square meter. Center-city zones are typically more expensive than peripheral ones. The zone system means that two apartments of identical size in the same city can have significantly different arnona bills purely based on location within the municipal boundaries.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            How zones work varies by city. Tel Aviv uses numbered zones (1 through 4, with 1 being the most expensive). Jerusalem uses Hebrew letter classifications (Alef through Dalet). Other cities have their own systems. The zone boundaries are set by the municipality and don't always align with what you'd intuitively think of as "center" versus "periphery."
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Property type.</strong> Residential properties pay different rates than commercial or industrial ones. If you have a home office, this generally doesn't change your classification — but if you're running a commercial operation out of a residential space, the municipality could reclassify you (and the commercial rate is significantly higher).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Building age.</strong> Some municipalities factor in the age of the building, with newer buildings sometimes falling into different rate categories. This is less significant than size and zone but can affect your bill.
          </p>

          <CalloutBox title="What arnona is NOT based on">
            <p className="text-charcoal leading-relaxed">
              Market value, purchase price, rental income, number of occupants, or the quality of finishes in your apartment. A luxury penthouse and a modest apartment of the same size in the same zone pay the same arnona.
            </p>
          </CalloutBox>

          <div className="mt-6">
            <InlineNewsletterCTA />
          </div>
        </>
      ),
    },
    {
      id: "how-much-does-arnona-cost",
      title: "How Much Does Arnona Cost?",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the question everyone asks, and the honest answer is: it depends on where you live. Arnona rates vary so much between cities that giving a single number would be misleading. Here's what you're actually looking at, as of 2026:
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">
            Representative Annual Arnona Costs (Residential, ~80–100sqm)
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">City</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Approximate Annual Range (NIS)</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">Tel Aviv</td>
                  <td className="py-2 px-3 text-charcoal">₪6,800–₪12,000</td>
                  <td className="py-2 px-3 text-charcoal">Highest rates in the country; varies significantly by zone</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">Jerusalem</td>
                  <td className="py-2 px-3 text-charcoal">₪3,200–₪9,000</td>
                  <td className="py-2 px-3 text-charcoal">Wide range due to many zones (Alef–Dalet); central neighborhoods highest</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">Haifa</td>
                  <td className="py-2 px-3 text-charcoal">₪3,200–₪8,800</td>
                  <td className="py-2 px-3 text-charcoal">Ranges from Carmel Center to peripheral neighborhoods</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">Ra'anana</td>
                  <td className="py-2 px-3 text-charcoal">₪5,000–₪8,500</td>
                  <td className="py-2 px-3 text-charcoal">Mid-to-upper range; popular Anglo community</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">Netanya</td>
                  <td className="py-2 px-3 text-charcoal">₪2,800–₪6,600</td>
                  <td className="py-2 px-3 text-charcoal">Lower overall; peripheral zones significantly cheaper</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">Beer Sheva</td>
                  <td className="py-2 px-3 text-charcoal">₪2,500–₪5,000</td>
                  <td className="py-2 px-3 text-charcoal">Among the lowest major-city rates</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-warm-gray text-[14px] leading-relaxed mb-4 italic">
            These figures are approximate ranges for typical residential apartments of 80–100sqm, based on published 2025/2026 municipal rate schedules. Actual amounts depend on your specific zone, property size, and classification. Rates are updated annually.
          </p>

          <p className="text-charcoal leading-relaxed mb-4">
            The key takeaway: the same apartment can cost 2–3x as much in arnona depending on which city you live in. Within a city, the zone difference can double your bill. If you're comparing neighborhoods or cities, arnona should be part of your ongoing cost calculation.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Annual rate increases.</strong> The national government sets a baseline automatic increase formula each year — for 2026, the automatic increase is 1.626% over 2025 levels. This formula averages 50% of the CPI change with 50% of the public sector wage index change. Municipalities can request increases above this baseline, but must get approval from the Ministry of Interior — and many such requests get trimmed or rejected.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            If you're budgeting in USD, GBP, or EUR, remember that arnona is an ongoing shekel-denominated cost. See our{" "}
            <Link to="/guides/exchange-rates" className="text-horizon-blue hover:underline">Exchange Rates Guide</Link>{" "}
            for how currency fluctuations affect your effective costs.
          </p>
        </>
      ),
    },
    {
      id: "payment-options",
      title: "Payment Options",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            Arnona is billed bi-monthly (every two months), resulting in 6 payment periods per year. But you have options for how you actually pay:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Bi-monthly payments (default).</strong> You receive a bill every two months and pay it by the due date. This is the standard arrangement. Payment can be made online through your municipality's website, at the post office, at a bank, or in person at the municipality offices (iriya).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Monthly direct debit (hora'at keva/הוראת קבע).</strong> You set up automatic monthly payments from your bank account. Many municipalities offer a small discount (typically 1–2%) for using direct debit. This is the most convenient option once you're set up — no missed payments, no late fees, no remembering due dates. Setting this up usually requires a visit to the municipal offices or completing a form on their website.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Annual lump sum.</strong> Pay the entire year's arnona upfront and receive a discount — typically 1–2%. If you have the cash flow and want to simplify, this is the best deal. The annual payment is usually due in January or February.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Where to pay:</strong> The most common channels are your municipality's website (quality varies — most are Hebrew-dominant but increasingly have some English functionality), your bank (in person or online), the post office (Israel Post), and in person at the municipality's arnona department.
          </p>

          <PullQuote>
            Set up hora'at keva as soon as you move in. It takes one trip to the iriya (or one online form) and eliminates the risk of missed payments and late fees for your entire residency.
          </PullQuote>
        </>
      ),
    },
    {
      id: "discounts-and-exemptions",
      title: "Discounts and Exemptions (Hana'khot)",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            Israel offers several arnona discounts (hana'khot/הנחות) — but you almost always have to apply for them. They are not automatic. Here are the main categories:
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">New Olim (Immigrants)</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the big one for our audience. New immigrants are eligible for a significant arnona discount:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-charcoal leading-relaxed mb-4">
            <li><strong>Discount: 70–90%</strong> on arnona for properties up to 100 square meters</li>
            <li><strong>Duration: 12 months</strong>, which must be used during your first two years after aliyah (you choose which 12-month period)</li>
            <li><strong>For properties over 100sqm:</strong> The discount is prorated — you get the full discount on the first 100sqm and pay the standard rate on the remainder</li>
            <li><strong>Application:</strong> You must apply at your municipality's arnona office with proof of aliyah status (teudat oleh) and your rental contract (minimum 12 months) or proof of ownership</li>
            <li><strong>Important:</strong> The exact discount percentage varies by municipality. Most fall in the 70–90% range, but check with your specific iriya.</li>
          </ul>

          <CalloutBox title="Don't leave this on the table">
            <p className="text-charcoal leading-relaxed">
              Many olim don't realize they're eligible, or they assume it's automatic. It's not. You need to physically go to the arnona department at your municipality (or, in some cities, apply online) with your documents. Do it as soon as you move in. The discount can save you thousands of shekels.
            </p>
          </CalloutBox>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Seniors (Ages 65+/70+)</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Senior citizens may qualify for arnona discounts based on age and income thresholds. The exact eligibility criteria and discount percentages vary by municipality. Generally, you need to be of qualifying age and below a certain income level. Apply at your local iriya with proof of age and income.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Disabled Persons</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Individuals with a disability percentage recognized by Bituach Leumi (National Insurance Institute) may be eligible for a discount. The discount amount typically correlates with the disability percentage. Apply with documentation from Bituach Leumi.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Low Income</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Means-tested arnona discounts are available for individuals and families below certain income thresholds. Documentation of income required. Apply at your municipality.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Students</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            There is no dedicated national "student discount" for arnona. However, students who meet the low-income criteria may qualify for a low-income discount. Foreign students on A-class visas are eligible for discounts during their valid visa period — documentation must be renewed annually at the arnona office.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">National Service / IDF</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Certain exemptions and discounts may apply for those completing national service or IDF service. Check with your municipality for current eligibility.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Empty Properties</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            If your property is empty (no persons or possessions), different rules apply:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-charcoal leading-relaxed mb-4">
            <li><strong>New property (first owner, never occupied):</strong> Eligible for 100% exemption for up to 12 months</li>
            <li><strong>Non-new empty property:</strong> Up to 100% discount for the first 6 months, up to 66.66% for the next 6 months, and up to 50% for the following 2 years</li>
            <li><strong>Critical detail:</strong> This exemption is generally available only once per ownership period</li>
            <li><strong>You must apply</strong> — the property must genuinely be empty, and the municipality may inspect</li>
          </ul>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">How to Apply for Discounts</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            The process is similar across municipalities:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-charcoal leading-relaxed mb-4">
            <li>Visit your municipal arnona office (or check if online application is available)</li>
            <li>Bring supporting documents: teudat zehut (ID), proof of eligibility (teudat oleh, Bituach Leumi documentation, income proof, lease agreement, etc.)</li>
            <li>Fill out the discount application form (typically in Hebrew)</li>
            <li>The discount usually takes effect from the beginning of the current billing period if approved</li>
          </ol>

          <InlineNewsletterCTA />
        </>
      ),
    },
    {
      id: "renters-vs-owners",
      title: "Arnona for Renters vs. Owners",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>The default rule: the occupant pays.</strong> In Israel, arnona is the responsibility of whoever occupies the property — which typically means the tenant in a rental situation.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            That said, your lease agreement (hozeh skhirut) can specify otherwise. Some landlords, particularly in deals with Anglo tenants, agree to include arnona in the rent or pay it directly. Read your contract. If the lease is silent on the question, the legal default is that the occupant pays.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Moving In: Transferring the Account</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            When you move into an apartment — whether as a renter or an owner — you need to transfer the arnona account into your name. This is called a transfer of occupant (ha'avarat sokher/ha'avarat ba'alut) and it's done at the municipal arnona office.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>You'll need:</strong> Your teudat zehut, the rental contract or purchase documentation, and the previous occupant's details. Some municipalities require both the outgoing and incoming occupant to appear together, though this varies.
          </p>

          <CalloutBox title="Why this matters critically">
            <p className="text-charcoal leading-relaxed">
              If you don't formally transfer the account, the previous occupant remains on record — and they can be billed (or conversely, you may receive bills meant for someone else). Worse, if the previous tenant left unpaid arnona, the municipality may look to you to settle it if you didn't do a clean transfer.
            </p>
          </CalloutBox>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Moving Out: Don't Just Leave</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            When you leave an apartment, make sure the arnona account is transferred to the next occupant (or back to the owner, if the apartment will be vacant). Get documentation confirming the transfer date. This protects you from being billed for periods after you've left.
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">What Happens If You Don't Pay</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            Arnona is not something you can ignore. Unpaid arnona accrues late fees (ribit pigruim). If it remains unpaid long enough, the municipality can pursue collection through the Execution Office (Hotza'ah LaPo'al), place liens on property, and — critically — block property transfers. An apartment with outstanding arnona debt cannot be sold or have its ownership transferred at the Tabu until the debt is cleared.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            For a full breakdown of rental costs including arnona, see our{" "}
            <Link to="/guides/renting" className="text-horizon-blue hover:underline">Renting Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "arnona-when-buying",
      title: "Arnona When Buying Property",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            If you're buying an apartment, arnona intersects with your purchase process in several important ways:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Proration at closing.</strong> Arnona is prorated between buyer and seller at the time of the transaction. Your lawyer (and the seller's lawyer) will calculate how much of the current billing period each party owes. This is handled as part of the closing process — you shouldn't need to negotiate it yourself.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Municipal clearance certificate (ishur iriya/אישור עירייה).</strong> Before you can register the property in your name at the Tabu (Land Registry), you need an ishur iriya — a certificate from the municipality confirming that all municipal obligations have been met, including arnona, and any applicable betterment levy (hetel hashbacha). If the seller has outstanding arnona debt, the certificate won't be issued, and you can't complete the registration.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Your lawyer will handle this.</strong> The ishur iriya is a standard part of the purchase process, and your real estate lawyer will manage it. But it's worth understanding what it is, because if there's a delay in getting the certificate, it usually means there's an outstanding municipal debt that needs to be resolved — and that can delay your closing.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Budget for arnona as an ongoing cost.</strong> When calculating the total cost of owning an apartment in Israel, arnona is one of the fixed ongoing expenses you need to plan for, alongside va'ad bayit (building maintenance), building insurance, and utilities. It's not optional, and it doesn't go away.
          </p>
          <p className="text-warm-gray text-[14px] leading-relaxed italic">
            For a complete overview of buying costs, see our{" "}
            <Link to="/guides/start-here" className="text-horizon-blue hover:underline">Start Here Guide</Link>.
            {" "}For purchase tax specifically, see our{" "}
            <Link to="/guides/purchase-tax" className="text-horizon-blue hover:underline">Purchase Tax Guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "common-anglo-pain-points",
      title: "Common Anglo Pain Points",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            After talking to hundreds of English-speaking olim and property buyers, these are the arnona issues that come up most often:
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Hebrew-only payment portals.</strong> Most municipal websites are primarily in Hebrew. Some larger cities (Tel Aviv, Jerusalem) have partial English interfaces, but the arnona payment systems are rarely fully translated. You'll likely need to navigate these with a Hebrew-speaking friend or Google Translate the first few times.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Not realizing you're eligible for the olim discount.</strong> This is heartbreakingly common. Olim move in, start paying full arnona, and only learn about the 70–90% discount months later — sometimes after the eligibility window has passed. Apply on day one.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Getting charged for a previous tenant's unpaid arnona.</strong> If the arnona account wasn't properly transferred when you moved in, the municipality may try to collect the previous occupant's debt from the current one. Always — always — do a formal transfer of the arnona account when you move in, and keep documentation.
          </p>

          <PullQuote>
            Arnona is a municipal tax paid to the city. Va'ad bayit is a building maintenance fee paid to your building's maintenance committee. Both are required. Both are ongoing. They go to different places.
          </PullQuote>

          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Confusion between arnona and va'ad bayit.</strong> These are completely different things. Arnona is a municipal tax paid to the city. Va'ad bayit (ועד בית) is a building maintenance fee paid to your building's maintenance committee — it covers things like stairwell cleaning, elevator maintenance, garden upkeep, and building insurance. Both are required. Both are ongoing. They go to different places.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Zone classification surprises.</strong> Your apartment might be on a street that intuitively feels "central" but falls in a lower arnona zone — or vice versa. The zone lines don't always match neighborhood perception. If you're comparing apartments, it's worth checking the arnona zone before signing.
          </p>
          <p className="text-charcoal leading-relaxed">
            <strong>Commercial vs. residential classification disputes.</strong> If you work from home (common among Anglo tech workers and freelancers), your property should still be classified as residential for arnona purposes. However, if the municipality determines you're running a commercial operation from the premises, they could reclassify part or all of the property at the much higher commercial rate. This is rare for standard work-from-home setups but worth being aware of.
          </p>
        </>
      ),
    },
    {
      id: "disputing-your-arnona",
      title: "Disputing Your Arnona",
      content: (
        <>
          <p className="text-charcoal leading-relaxed mb-4">
            If you believe your arnona assessment is incorrect, you have the right to file an objection (hashaga/השגה). Common grounds for objection include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-charcoal leading-relaxed mb-4">
            <li><strong>Property size:</strong> The municipality's measurement on file doesn't match the actual size of your apartment</li>
            <li><strong>Zone classification:</strong> You believe your property is in the wrong zone</li>
            <li><strong>Property type:</strong> Residential property classified as commercial, or vice versa</li>
            <li><strong>Occupancy status:</strong> You're being charged as an occupant when you're not occupying the property</li>
            <li><strong>Billing errors:</strong> Charges for periods before you moved in, duplicate bills, etc.</li>
          </ul>

          <h3 className="text-lg font-semibold text-charcoal mb-3 font-serif">The Objection Process</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Deadline: 90 days</strong> from receiving the payment notice. This is critical — if you miss the 90-day window, you lose the right to object for that billing period.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Step 1:</strong> File a written objection (hashaga) with your municipality's arnona department. Explain clearly what you're disputing and why. Include supporting documentation (measurement by a licensed surveyor, lease dates, etc.).
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Step 2:</strong> The municipality reviews your objection and responds. Timelines vary but expect several weeks to a few months.
          </p>
          <p className="text-charcoal leading-relaxed mb-4">
            <strong>Step 3:</strong> If you're dissatisfied with the municipality's response, you can file an appeal (irur/ערעור) with the Appeal Committee within 30 days of receiving the response.
          </p>

          <CalloutBox title="Important: Filing does not pause payment">
            <p className="text-charcoal leading-relaxed">
              Filing an objection does NOT pause your payment obligation. You must continue paying your arnona while the objection is being processed. If the objection is successful, you'll receive a refund or credit for the overpayment.
            </p>
          </CalloutBox>

          <h3 className="text-lg font-semibold text-charcoal mb-3 mt-8 font-serif">Property Measurement Disputes</h3>
          <p className="text-charcoal leading-relaxed mb-4">
            This is the most common type of arnona dispute for Anglo property owners. The municipality's records may show a different floor area than what you believe your apartment to be. If you think the measurement is wrong:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-charcoal leading-relaxed mb-4">
            <li>Hire a licensed surveyor (memodad/מדוד) to measure your property</li>
            <li>Compare their measurement with what the municipality has on file (available from the arnona department)</li>
            <li>If there's a discrepancy, file a hashaga with the surveyor's report as supporting evidence</li>
            <li>The municipality may send their own surveyor to remeasure</li>
          </ol>
          <p className="text-charcoal leading-relaxed">
            The cost of hiring a surveyor is modest (typically a few hundred shekels) and can save you significantly on arnona if the municipality's measurement is inflated.
          </p>
        </>
      ),
    },
    {
      id: "glossary",
      title: "Glossary of Hebrew Arnona Terms",
      content: (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Hebrew</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Transliteration</th>
                  <th className="py-2 px-3 text-left font-body font-medium text-warm-gray text-[14px]">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line font-body text-[14px]">
                <tr>
                  <td className="py-2 px-3 text-charcoal">ארנונה</td>
                  <td className="py-2 px-3 text-charcoal">Arnona</td>
                  <td className="py-2 px-3 text-charcoal">Municipal property tax</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">עירייה</td>
                  <td className="py-2 px-3 text-charcoal">Iriya</td>
                  <td className="py-2 px-3 text-charcoal">City municipality</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">מועצה מקומית</td>
                  <td className="py-2 px-3 text-charcoal">Mo'atza Mekomit</td>
                  <td className="py-2 px-3 text-charcoal">Local council</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">אזורים</td>
                  <td className="py-2 px-3 text-charcoal">Ezorim</td>
                  <td className="py-2 px-3 text-charcoal">Zones (arnona classification areas)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">אזור</td>
                  <td className="py-2 px-3 text-charcoal">Ezor</td>
                  <td className="py-2 px-3 text-charcoal">Zone (singular)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">הנחה</td>
                  <td className="py-2 px-3 text-charcoal">Hana'kha</td>
                  <td className="py-2 px-3 text-charcoal">Discount</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">הנחות</td>
                  <td className="py-2 px-3 text-charcoal">Hana'khot</td>
                  <td className="py-2 px-3 text-charcoal">Discounts (plural)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">הוראת קבע</td>
                  <td className="py-2 px-3 text-charcoal">Hora'at Keva</td>
                  <td className="py-2 px-3 text-charcoal">Standing payment order / direct debit</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">אישור עירייה</td>
                  <td className="py-2 px-3 text-charcoal">Ishur Iriya</td>
                  <td className="py-2 px-3 text-charcoal">Municipal clearance certificate</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">השגה</td>
                  <td className="py-2 px-3 text-charcoal">Hashaga</td>
                  <td className="py-2 px-3 text-charcoal">Objection / formal dispute</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">ערעור</td>
                  <td className="py-2 px-3 text-charcoal">Irur</td>
                  <td className="py-2 px-3 text-charcoal">Appeal</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">ועד בית</td>
                  <td className="py-2 px-3 text-charcoal">Va'ad Bayit</td>
                  <td className="py-2 px-3 text-charcoal">Building maintenance committee</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">ביטוח לאומי</td>
                  <td className="py-2 px-3 text-charcoal">Bituach Leumi</td>
                  <td className="py-2 px-3 text-charcoal">National Insurance Institute</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">תעודת זהות</td>
                  <td className="py-2 px-3 text-charcoal">Teudat Zehut</td>
                  <td className="py-2 px-3 text-charcoal">Identity document</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">תעודת עולה</td>
                  <td className="py-2 px-3 text-charcoal">Teudat Oleh</td>
                  <td className="py-2 px-3 text-charcoal">Oleh (immigrant) status certificate</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">היטל השבחה</td>
                  <td className="py-2 px-3 text-charcoal">Hetel Hashbacha</td>
                  <td className="py-2 px-3 text-charcoal">Betterment levy</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">הוצאה לפועל</td>
                  <td className="py-2 px-3 text-charcoal">Hotza'ah LaPo'al</td>
                  <td className="py-2 px-3 text-charcoal">Execution Office (debt collection)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">טאבו</td>
                  <td className="py-2 px-3 text-charcoal">Tabu</td>
                  <td className="py-2 px-3 text-charcoal">Land Registry</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">שוכר</td>
                  <td className="py-2 px-3 text-charcoal">Sokher</td>
                  <td className="py-2 px-3 text-charcoal">Tenant</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">משכיר</td>
                  <td className="py-2 px-3 text-charcoal">Maskir</td>
                  <td className="py-2 px-3 text-charcoal">Landlord</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">מדד</td>
                  <td className="py-2 px-3 text-charcoal">Madad</td>
                  <td className="py-2 px-3 text-charcoal">CPI (Consumer Price Index)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">העברת שוכר</td>
                  <td className="py-2 px-3 text-charcoal">Ha'avarat Sokher</td>
                  <td className="py-2 px-3 text-charcoal">Transfer of tenant (arnona account transfer)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">ריבית פיגורים</td>
                  <td className="py-2 px-3 text-charcoal">Ribit Pigrurim</td>
                  <td className="py-2 px-3 text-charcoal">Late payment interest/penalties</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-charcoal">מ"ר</td>
                  <td className="py-2 px-3 text-charcoal">Meter Meruba</td>
                  <td className="py-2 px-3 text-charcoal">Square meter (sqm)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#FAF8F5] border border-grid-line p-4 rounded-lg">
            <p className="text-warm-gray text-[14px] leading-relaxed">
              <strong>Disclaimer:</strong> This guide is provided by navlan.io for informational purposes only. It does not constitute legal, financial, or tax advice. Arnona rates, discounts, and municipal regulations vary by location and change annually. Always verify current rates and eligibility with your municipality's arnona department. For specific legal questions about arnona disputes or obligations, consult a qualified Israeli attorney.
            </p>
          </div>
        </>
      ),
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <GuidePage
      title="Arnona Explained: Israel's Property Tax in English"
      seoTitle="Arnona Explained: Israel's Property Tax in English | Navlan"
      subtitle="The one tax everyone in Israel pays — and almost no English-language resource explains properly."
      date="Last updated: March 2026"
      readTime="~22 min read"
      metaDescription="English guide to arnona, Israel's municipal property tax. How it's calculated, olim and new immigrant discounts, payment options, and how to dispute your bill."
      sections={sections}
      bottomNav={{
        prev: { label: "Renting Guide", to: "/guides/renting" },
        next: { label: "Exchange Rates Guide", to: "/guides/exchange-rates" },
      }}
      related={[
        { label: "Start Here Guide", to: "/guides/start-here" },
        { label: "Renting Guide", to: "/guides/renting" },
        { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
      ]}
      headerContent={headerContent}
    />
  );
};

export default ArnonaGuidePage;
