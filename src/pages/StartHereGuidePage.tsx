import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";

const sections: GuideSection[] = [
  {
    id: "how-it-works",
    title: "How Israeli Real Estate Works",
    content: (
      <>
        <p className="mb-4">
          Israeli real estate operates under a fundamentally different legal and cultural framework than what most English speakers are accustomed to. If you're coming from the US, UK, Canada, or Australia, nearly every assumption you have about property — from how ownership works to how transactions close — needs to be recalibrated. Understanding these differences before you start shopping will save you significant time, money, and frustration.
        </p>
        <p className="mb-4">
          The market is heavily influenced by government land policy, immigration patterns, and geopolitical factors that don't exist in most Western markets. Prices are quoted in NIS (shekels), transactions are conducted through lawyers rather than title companies or escrow agents, and the mortgage system uses a unique multi-track structure that has no equivalent elsewhere.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          Leasehold vs. Freehold (Minhal vs. Tabu)
        </h3>
        <p className="mb-4">
          Approximately 93% of land in Israel is owned by the state, managed by the Israel Land Authority (formerly known as Minhal). Most urban residential properties sit on land that is leased from the state on long-term leases (typically 49 or 98 years, renewable). This is called <strong>leasehold</strong> (חכירה). In practice, these long-term leases function almost identically to freehold ownership — they're bought, sold, mortgaged, and inherited just like private property.
        </p>
        <p className="mb-4">
          <strong>Tabu registration</strong> (full private ownership) exists for some properties, particularly older ones in established neighborhoods. Whether a property is leasehold or Tabu-registered affects the registration process but rarely affects the practical experience of ownership. Your lawyer will verify the ownership type during due diligence.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          The Tabu (Land Registry)
        </h3>
        <p className="mb-4">
          The Tabu (טאבו) is Israel's official land registry, operated by the Ministry of Justice. All real estate transactions must ultimately be registered in the Tabu to be considered legally complete. The key document is the <strong>Nesach Tabu</strong> (נסח טאבו) — a title extract that shows the current registered owner, any liens or mortgages, easements, and other encumbrances.
        </p>
        <p className="mb-4">
          Before purchasing any property, your lawyer should obtain and review a fresh Nesach Tabu. This document is the closest equivalent to a title search in the US. It can be ordered online through the Tabu website for a small fee. Never rely on an old or seller-provided extract — always pull your own.
        </p>
      </>
    ),
  },
  {
    id: "purchase-process",
    title: "The Purchase Process Step by Step",
    content: (
      <>
        <p className="mb-4">
          The Israeli property purchase process is lawyer-driven, with no equivalent of the US title company or UK solicitor/conveyancer distinction. Both buyer and seller hire their own attorneys, who negotiate the contract, handle due diligence, and manage the transfer of funds and registration.
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4 marker:text-sage marker:font-semibold">
          <li>Define your budget and get mortgage pre-approval from an Israeli bank</li>
          <li>Search for properties — Yad2 (Israel's main listings site), broker, word of mouth</li>
          <li>Visit properties and conduct due diligence (Tabu check, building permits, etc.)</li>
          <li>Negotiate price and terms with seller or seller's broker</li>
          <li>Sign the purchase contract (<strong>Hozeh Mechira</strong>) with your lawyer present</li>
          <li>Pay purchase tax (<strong>Mas Rechisha</strong>) within 30-60 days of signing</li>
          <li>Complete the mortgage process with the bank</li>
          <li>Transfer payment according to contract schedule (usually 3-4 installments over several months)</li>
          <li>Receive keys and register ownership at Tabu</li>
        </ol>
        <blockquote className="border-l-[3px] border-sand-gold pl-5 my-6 bg-cream/50 py-3 pr-4 rounded-r-lg">
          <p className="font-body italic text-[16px] text-warm-gray">
            Typical timeline: 3-6 months from signing the contract to receiving the keys. New construction can take 2-4 years.
          </p>
        </blockquote>
      </>
    ),
  },
  {
    id: "costs",
    title: "Understanding Costs",
    content: (
      <>
        <p className="mb-4">
          Beyond the purchase price, Israeli real estate transactions involve several additional costs that can add 5-12% to your total outlay. Understanding these upfront is critical for accurate budgeting.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          Purchase Tax (Mas Rechisha)
        </h3>
        <p className="mb-4">
          Israel uses a sliding scale for purchase tax. For Israeli residents buying their sole residence: the first ~₪1.97M is exempt, then 3.5% up to ₪2.34M, then 5%, 8%, and 10% on higher brackets. Investors and second-home buyers pay 8% from the first shekel. <strong>Olim receive a significant exemption for 7 years after aliyah</strong>, which can save tens of thousands of shekels.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          Other Costs
        </h3>
        <p className="mb-2">
          <strong>Lawyer Fees:</strong> Typically 0.5%-1.5% of purchase price + VAT. Both buyer and seller hire their own lawyers — this is non-negotiable.
        </p>
        <p className="mb-2">
          <strong>Broker Fees:</strong> Usually 2% + VAT, paid by both buyer and seller separately. This is negotiable, especially on higher-value properties.
        </p>
        <p className="mb-4">
          <strong>Arnona (Property Tax):</strong> A municipal tax paid monthly or bimonthly. Varies dramatically by city — a similar apartment in Beer Sheva costs far less in arnona than in Tel Aviv. Olim get a 10% discount for 12 months.
        </p>

        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 px-4 rounded-tl-lg">Cost</th>
                <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 px-4">Typical Range</th>
                <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 px-4 rounded-tr-lg">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid-line">
              <tr><td className="py-3 px-4">Purchase Tax</td><td className="py-3 px-4">0-10%</td><td className="py-3 px-4 text-warm-gray text-[14px]">Sliding scale; olim exemptions apply</td></tr>
              <tr><td className="py-3 px-4">Lawyer</td><td className="py-3 px-4">0.5-1.5% + VAT</td><td className="py-3 px-4 text-warm-gray text-[14px]">Both sides hire lawyers</td></tr>
              <tr><td className="py-3 px-4">Broker</td><td className="py-3 px-4">2% + VAT</td><td className="py-3 px-4 text-warm-gray text-[14px]">Paid by each party separately</td></tr>
              <tr><td className="py-3 px-4">Arnona</td><td className="py-3 px-4">Varies by city</td><td className="py-3 px-4 text-warm-gray text-[14px]">Monthly municipal tax</td></tr>
              <tr><td className="py-3 px-4">Mortgage fees</td><td className="py-3 px-4">~0.25%</td><td className="py-3 px-4 text-warm-gray text-[14px]">Bank processing fees</td></tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "mortgages",
    title: "Mortgages for Olim and Foreign Buyers",
    content: (
      <>
        <p className="mb-4">
          Israeli banks lend to both olim (up to 75% loan-to-value) and foreign buyers (up to 50% LTV). The mortgage system is fundamentally different from what English speakers are used to — understanding it is critical before committing to a purchase.
        </p>
        <p className="mb-4">
          Israeli mortgages use a <strong>multi-track system</strong>: each mortgage is split across 3-4 "tracks" (masluim), each with its own interest rate structure and risk profile. The main track types are: <strong>non-indexed fixed rate</strong> (most common), <strong>prime-linked variable</strong> (fluctuates with Bank of Israel's prime rate), <strong>CPI-indexed fixed</strong> (lower rate but payments increase with inflation), and <strong>CPI-indexed variable</strong> (lowest initial rate, highest risk).
        </p>
        <p className="mb-4">
          Rates are published monthly by the Bank of Israel and vary by track type.{" "}
          <Link to="/market" className="text-horizon-blue hover:underline">
            See current average rates →
          </Link>
        </p>
        <p className="mb-4">
          Most anglo buyers work with a mortgage advisor (<strong>yo'etz mashkanta'ot</strong>) who helps structure the optimal track mix based on risk tolerance, timeline, and financial situation. This is one area where professional help is almost always worth the cost.
        </p>
      </>
    ),
  },
  {
    id: "new-vs-used",
    title: "New Construction vs. Second-Hand",
    content: (
      <>
        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-2 mb-3">
          New Construction (Yad Rishona)
        </h3>
        <p className="mb-4">
          Buying from a developer, often off-plan (before construction is complete). Payments are spread over the construction period (typically 2-3 years). VAT is included in the listed price. Developers must provide a bank guarantee or insurance policy under <strong>Hok HaMechira</strong> (the Sales Law), which protects buyers' payments if the developer goes bankrupt.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          Second-Hand (Yad Shniya)
        </h3>
        <p className="mb-4">
          Immediate or near-immediate availability. What you see is what you get — you can inspect the actual apartment, meet the neighbors, and understand the building dynamics before buying. Negotiation is direct (or through a broker), and the process is faster than new construction.
        </p>

        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
          Tama 38 / Pinui Binui
        </h3>
        <p className="mb-4">
          <strong>Tama 38</strong> and <strong>Pinui Binui</strong> are urban renewal programs designed to strengthen older buildings against earthquakes while adding new apartments. Tama 38 reinforces existing structures (often adding floors), while Pinui Binui demolishes and rebuilds entirely. These programs affect many older buildings in Israeli cities — if you're considering an older apartment, understanding whether the building is in or eligible for these programs is important.
        </p>
      </>
    ),
  },
  {
    id: "common-mistakes",
    title: "Common Mistakes Anglos Make",
    content: (
      <ul className="list-disc pl-6 space-y-3 marker:text-sage">
        <li><strong>Trusting a broker's market timing advice without checking data.</strong> Brokers earn commissions on sales — they're incentivized to tell you "now is the time to buy." Check the actual market data yourself.</li>
        <li><strong>Not hiring your own lawyer.</strong> Some buyers try to save money by using the seller's lawyer or skipping legal representation entirely. This is a recipe for disaster in Israel's lawyer-driven system.</li>
        <li><strong>Underestimating total costs beyond the purchase price.</strong> Purchase tax, lawyer fees, broker fees, renovation, appliances, arnona — these add up to 8-15% on top of the sticker price.</li>
        <li><strong>Not understanding the multi-track mortgage system.</strong> Taking the bank's default suggestion without consulting an independent mortgage advisor can cost you tens of thousands of shekels over the life of the loan.</li>
        <li><strong>Skipping the Tabu check and due diligence.</strong> Always pull a fresh Nesach Tabu, verify building permits, and check for any pending legal issues before signing.</li>
        <li><strong>Rushing to buy during the "olim panic" in the first year.</strong> Many new immigrants feel pressure to buy immediately. The market will still be there in year two — take time to learn the market and settle in.</li>
        <li><strong>Not factoring in ongoing costs.</strong> Arnona, vaad bayit (building maintenance fees), and utility costs vary significantly by city and building. Budget for these before committing.</li>
      </ul>
    ),
  },
  {
    id: "glossary",
    title: "Glossary of Hebrew Real Estate Terms",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-cream">
              <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 px-4 rounded-tl-lg">Hebrew Term</th>
              <th className="text-left font-body font-medium text-[14px] text-warm-gray py-3 px-4 rounded-tr-lg">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grid-line">
            <tr><td className="py-3 px-4">נדל"ן (Nadlan)</td><td className="py-3 px-4">Real estate</td></tr>
            <tr><td className="py-3 px-4">טאבו (Tabu)</td><td className="py-3 px-4">Land registry</td></tr>
            <tr><td className="py-3 px-4">נסח טאבו (Nesach Tabu)</td><td className="py-3 px-4">Title extract / ownership document</td></tr>
            <tr><td className="py-3 px-4">מס רכישה (Mas Rechisha)</td><td className="py-3 px-4">Purchase tax</td></tr>
            <tr><td className="py-3 px-4">ארנונה (Arnona)</td><td className="py-3 px-4">Municipal property tax</td></tr>
            <tr><td className="py-3 px-4">ועד בית (Vaad Bayit)</td><td className="py-3 px-4">Building maintenance committee / fees</td></tr>
            <tr><td className="py-3 px-4">משכנתא (Mashkanta)</td><td className="py-3 px-4">Mortgage</td></tr>
            <tr><td className="py-3 px-4">יועץ משכנתאות (Yo'etz Mashkanta'ot)</td><td className="py-3 px-4">Mortgage advisor</td></tr>
            <tr><td className="py-3 px-4">חוזה מכירה (Hozeh Mechira)</td><td className="py-3 px-4">Sale contract</td></tr>
            <tr><td className="py-3 px-4">מנהל (Minhal)</td><td className="py-3 px-4">Israel Land Authority</td></tr>
            <tr><td className="py-3 px-4">תמ"א 38 (Tama 38)</td><td className="py-3 px-4">Earthquake reinforcement / urban renewal program</td></tr>
            <tr><td className="py-3 px-4">פינוי בינוי (Pinui Binui)</td><td className="py-3 px-4">Evacuate and rebuild program</td></tr>
            <tr><td className="py-3 px-4">דירה בהנחה (Dira BeHanacha)</td><td className="py-3 px-4">Subsidized apartment / government housing program</td></tr>
            <tr><td className="py-3 px-4">יד ראשונה (Yad Rishona)</td><td className="py-3 px-4">New construction (first hand)</td></tr>
            <tr><td className="py-3 px-4">יד שנייה (Yad Shniya)</td><td className="py-3 px-4">Second-hand / resale</td></tr>
            <tr><td className="py-3 px-4">שמאי (Shamai)</td><td className="py-3 px-4">Property appraiser</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
];

const StartHereGuidePage = () => (
  <GuidePage
    title="Buying Property in Israel: A Guide for English Speakers"
    subtitle="Everything you need to know about the Israeli real estate market — the purchase process, costs, mortgages, and common pitfalls."
    date="Last updated: March 2026"
    metaDescription="A comprehensive English-language guide to buying property in Israel. Covers the purchase process, costs, mortgages, legal framework, and common mistakes for olim and foreign buyers."
    sections={sections}
    bottomNav={{
      prev: { label: "Back to Home", to: "/" },
      next: { label: "Dira BeHanacha Guide", to: "/guides/dira-behanacha" },
    }}
    related={[
      { label: "Explore Cities", to: "/#explore-cities" },
      { label: "Current Mortgage Rates", to: "/market" },
      { label: "Dira BeHanacha Guide", to: "/guides/dira-behanacha" },
    ]}
  />
);

export default StartHereGuidePage;
