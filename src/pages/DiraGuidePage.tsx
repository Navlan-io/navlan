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
import { Link } from "react-router-dom";
import { useSiteParameters } from "@/hooks/useSiteParameters";

const quickRef = (
  <Card className="bg-cream border-0 shadow-card p-6 mb-8">
    <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Quick Reference</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody className="divide-y divide-grid-line font-body text-[15px]">
          <tr><td className="py-2 pr-4 text-warm-gray font-medium w-40">Program name</td><td className="py-2 text-charcoal">Dira BeHanacha (דירה בהנחה) — "Apartment at a Discount"</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Run by</td><td className="py-2 text-charcoal">Ministry of Construction and Housing + Israel Land Authority</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Discount</td><td className="py-2 text-charcoal">Typically 20-30% below market price</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Eligibility</td><td className="py-2 text-charcoal">Israeli residents who don't own property (chaser dira)</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Process</td><td className="py-2 text-charcoal">Lottery system — register, win, then purchase</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Timeline</td><td className="py-2 text-charcoal">2-4 years from winning lottery to receiving keys</td></tr>
          <tr><td className="py-2 pr-4 text-warm-gray font-medium">Website</td><td className="py-2 text-charcoal"><a href="https://dira.moch.gov.il" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">dira.moch.gov.il</a> (Hebrew only)</td></tr>
        </tbody>
      </table>
    </div>
  </Card>
);

const DiraGuidePageComponent = () => {
  const { data: params } = useSiteParameters();

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• Dira BeHanacha is a government lottery program offering new apartments at 20–30% below market price — savings of hundreds of thousands of shekels.</li>
        <li>• The core eligibility requirement is "chaser dira" status — you don't currently own residential property in Israel. Olim are fully eligible.</li>
        <li>• The process is lottery-based: register during a project's window, wait for eligibility verification, then hope your number is drawn.</li>
        <li>• Expect a 2–4 year timeline from winning the lottery to receiving keys, since apartments are typically new construction.</li>
        <li>• There's a minimum holding period (usually <span className="text-[#4A7F8B] font-medium">{params?.dira_behanacha_holding_period?.display_label || '5 years'}</span>) before you can sell — this prevents speculation.</li>
        <li>• Combining Dira BeHanacha with the olim purchase tax exemption can save 30–40% compared to a market-price purchase by a non-oleh investor.</li>
        <li>• The entire process is in Hebrew — seriously consider hiring an English-speaking lawyer.</li>
      </ul>
    </div>
  );

  const sections: GuideSection[] = [
    {
      id: "what-is-it",
      title: "What is Dira BeHanacha?",
      content: (
        <>
          <p className="mb-4">
            Dira BeHanacha (דירה בהנחה, literally "apartment at a discount") is an Israeli government program offering new apartments at below-market prices to eligible residents. The program evolved from and incorporates the older "Mechir LaMishtaken" (Buyer's Price) framework, expanding it into a broader initiative with multiple tracks, and has become one of the most significant paths to homeownership for young Israelis and new immigrants.
          </p>
          <PullQuote>Dira BeHanacha discounts typically range from 20-30% below market price — savings of hundreds of thousands of shekels for eligible buyers.</PullQuote>
          <p className="mb-4">
            The mechanics are straightforward: private developers build apartments on government-owned land, with price caps set by the state. The discounts typically range from 20-30% below comparable market prices, representing savings of hundreds of thousands of shekels in most locations.
          </p>
          <p className="mb-4">
            Projects are available across Israel, with a concentration in peripheral and developing areas. Central locations (Tel Aviv, Herzliya) rarely have Dira BeHanacha projects, while cities like Beer Sheva, Ashkelon, and Beit Shemesh frequently do. The program is one of the government's primary tools for addressing Israel's housing affordability crisis.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "Who is Eligible?",
      content: (
        <>
          <p className="mb-4">
            The primary eligibility requirement is <strong>chaser dira</strong> status — you don't currently own residential property anywhere in Israel. This is the single most important criterion and is verified both at registration and at the time of purchase.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li><strong>Age minimum:</strong> Married couples and common-law partners have no minimum age requirement. Singles must be 35 or older, with exceptions for single parents with minor children, widows/widowers (21+), and individuals with recognized disabilities (21+).</li>
            <li><strong>Olim (immigrants) are eligible</strong> — this is a significant benefit for new immigrants looking to establish themselves</li>
            <li>If you previously owned and sold, you may still qualify (specific conditions apply — verify with the program)</li>
            <li>Married couples register together as one household</li>
            <li>A <strong>priority points system</strong> influences your lottery ranking: age, number of children, years of marriage, military service, and living in peripheral areas all affect your score</li>
          </ul>
          <CalloutBox title="Eligibility Warning">
            Eligibility is checked at registration AND at the time of purchase. Your chaser dira status must hold throughout the entire process — if you purchase a property between registering and winning, you'll be disqualified.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "lottery",
      title: "How the Lottery Works",
      content: (
        <>
          <p className="mb-4">
            The Dira BeHanacha program uses a computer-generated lottery to allocate apartments fairly. Here's how the process works from announcement to selection:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>New projects are announced on <a href="https://dira.moch.gov.il" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">dira.moch.gov.il</a> (Hebrew only)</li>
            <li>Registration windows are typically 2-4 weeks per project</li>
            <li>You submit your registration online with all required documents</li>
            <li>A computer lottery assigns random priority numbers to all eligible registrants</li>
            <li>Winners are invited in order of their lottery number to choose apartments</li>
            <li>If you don't win, your registration may carry over to future lotteries for some programs</li>
            <li>Processing time for eligibility verification: 2-4 weeks after registration closes</li>
          </ul>
          <p className="mb-4">
            The lottery is genuinely random — there's no way to influence the outcome beyond having more priority points, which only affect certain tiebreaker scenarios. Many applicants register for multiple projects across different cities to improve their chances.
          </p>
          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "how-to-apply",
      title: "Step-by-Step Application Process",
      content: (
        <ol className="list-decimal pl-6 space-y-3 mb-4 marker:text-sage marker:font-semibold">
          <li>Check your eligibility on the program website</li>
          <li>Gather required documents: Teudat Zehut, marriage certificate (if applicable), proof of non-ownership, military service documents, income verification</li>
          <li>Wait for a project announcement in your desired area</li>
          <li>Register online during the registration window (2-4 weeks)</li>
          <li>Submit all required documents digitally</li>
          <li>Wait for eligibility verification (2-4 weeks after window closes)</li>
          <li>If eligible, wait for lottery results</li>
          <li>If selected, attend the apartment selection event in person</li>
          <li>Sign purchase agreement with the developer</li>
          <li>Arrange mortgage and begin payment schedule according to the construction timeline</li>
        </ol>
      ),
    },
    {
      id: "before-applying",
      title: "What You Need to Know Before Applying",
      content: (
        <ul className="list-disc pl-6 space-y-3 mb-4 marker:text-sage">
          <li><strong>Minimum holding period:</strong> You must hold the apartment for a minimum period before selling — typically <span className="text-[#4A7F8B] font-medium">{params?.dira_behanacha_holding_period?.display_label || '5 years'}</span> from receiving occupancy (Tofes 4), though the restriction can also be measured as 7 years from the lottery date, whichever comes first. Selling earlier requires returning some or all of the discount to the government. After the restriction period expires, you can sell freely. This prevents speculation and ensures the program serves genuine homebuyers.</li>
          <li><strong>It's a discount, not a grant:</strong> The apartment is purchased through a standard mortgage — the discount is on the purchase price, not free money. You still need to qualify for and pay a mortgage. <br />→ For a complete guide to Israeli mortgages, see our <Link to="/guides/mortgages" className="text-horizon-blue hover:underline">Mortgage Guide</Link>.</li>
          <li><strong>Construction timeline:</strong> Construction takes 2-4 years, so you won't move in immediately after winning. Plan your living situation accordingly.</li>
          <li><strong>Deposit required:</strong> You may need to put down a deposit (typically 10-15%) shortly after winning. Make sure you have this liquidity available.</li>
          <li><strong>Location limitations:</strong> Most projects are in peripheral or developing areas, not central Tel Aviv or Herzliya. Be realistic about where Dira BeHanacha apartments are available.</li>
          <li><strong>Quality varies:</strong> Different developers have different track records. Research the developer before committing — check their previous projects, delivery timelines, and online reviews.</li>
        </ul>
      ),
    },
    {
      id: "for-olim",
      title: "Dira BeHanacha for Olim",
      content: (
        <>
          <p className="mb-4">
            Olim (new immigrants) are fully eligible for the Dira BeHanacha program, and the program represents one of the most significant financial benefits available to new immigrants alongside other olim benefits.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-sage">
            <li>Olim benefits may positively affect your priority points in the lottery</li>
            <li>The <strong>7-year purchase tax exemption</strong> for olim still applies to Dira BeHanacha purchases, meaning additional savings on top of the program discount. → See our <Link to="/guides/purchase-tax" className="text-horizon-blue hover:underline">Purchase Tax Guide</Link> for the full breakdown of olim tax benefits.</li>
            <li>The language barrier is the biggest practical challenge — the entire process, website, and documentation are in Hebrew. Seriously consider hiring a lawyer who speaks English.</li>
            <li>Nefesh B'Nefesh can provide initial guidance on navigating the process and understanding your eligibility</li>
            <li>If you're buying with foreign currency, see our <Link to="/guides/exchange-rates" className="text-horizon-blue hover:underline">Exchange Rate Guide</Link> for how currency fluctuations affect your savings.</li>
            <li>After purchase, ongoing costs include arnona (municipal property tax) — see our <Link to="/guides/arnona" className="text-horizon-blue hover:underline">Arnona Guide</Link> for rates, discounts, and the olim discount.</li>
          </ul>
          <p className="mb-4">
            Combining olim tax benefits with the Dira BeHanacha discount can result in savings of 30-40% compared to buying an equivalent property at market price as a non-oleh investor. This makes the program particularly attractive for new immigrants planning to stay long-term.
          </p>
          <p className="mb-4 text-warm-gray text-[15px]">
            Many Dira BeHanacha applicants are currently renting — see our <Link to="/guides/renting" className="text-horizon-blue hover:underline">Renting Guide</Link> for tips on navigating the rental market while you wait.
          </p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "Current Projects and How to Track Them",
      content: (
        <>
          <p className="mb-4">
            All active and upcoming Dira BeHanacha projects are listed on the official program website at{" "}
            <a href="https://dira.moch.gov.il" target="_blank" rel="noopener noreferrer" className="text-horizon-blue hover:underline">
              dira.moch.gov.il
            </a>. Unfortunately, the site is entirely in Hebrew with no English version available.
          </p>
          <p className="mb-4">
            No official English-language tracker currently exists. Anglo community Facebook groups (Janglo, Secret Tel Aviv, various city-specific groups) often share lottery announcements in English and can be helpful for staying informed.
          </p>
          <blockquote className="border-l-[3px] border-sand-gold pl-5 my-6 bg-cream/50 py-3 pr-4 rounded-r-lg">
            <p className="font-body italic text-[16px] text-warm-gray">
              Navlan is building an English-language Dira BeHanacha tracker. Sign up for The Navlan Report to be notified when it launches.
            </p>
          </blockquote>
        </>
      ),
    },
    {
      id: "faq",
      title: "Frequently Asked Questions",
      content: (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {[
            { q: "Can olim apply for Dira BeHanacha?", a: "Yes. Olim who don't own property in Israel are eligible. The 7-year purchase tax exemption also applies to Dira BeHanacha purchases, making it particularly advantageous for new immigrants." },
            { q: "Can I apply if I own property abroad?", a: "Generally yes — the program checks Israeli property ownership, not worldwide. However, you must be an Israeli citizen or permanent resident to participate at all. Foreign nationals who have not made aliyah are not eligible regardless of their property holdings." },
            { q: "How much is the discount?", a: "Typically 20-30% below comparable market prices, depending on the specific project and location. Central locations tend to offer larger absolute discounts but may have smaller percentage discounts." },
            { q: "Can I sell the apartment after buying?", a: (<>Yes, but there's a mandatory holding period — typically <span className="text-[#4A7F8B] font-medium">{params?.dira_behanacha_holding_period?.display_label || '5 years'}</span> from receiving occupancy (Tofes 4), though the restriction can also be measured as 7 years from the lottery date, whichever comes first. Selling earlier requires returning some or all of the discount to the government. After the restriction period expires, you can sell freely.</>) },
            { q: "Is there an age limit?", a: "Married couples and common-law partners have no minimum age requirement. Singles must be 35 or older, with exceptions for single parents with minor children, widows/widowers (21+), and individuals with recognized disabilities (21+). There is no maximum age limit." },
            { q: "Can I choose which apartment I get?", a: "Lottery winners choose apartments in order of their lottery number. Earlier numbers get first pick of available units — including floor, direction, and size options within the project." },
            { q: "What if I don't win?", a: "You can register for future lotteries. Some programs allow your registration to carry over automatically. Many applicants register for multiple projects simultaneously to improve their chances." },
            { q: "Do I need a mortgage advisor?", a: "Highly recommended. The mortgage process for Dira BeHanacha follows the same multi-track system as regular purchases. A good advisor can save you significantly over the life of the loan." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-cream rounded-lg border-0 px-5">
              <AccordionTrigger className="font-heading font-semibold text-[16px] text-charcoal hover:no-underline py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="font-body text-[15px] text-charcoal leading-[1.7] pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content: (
        <p className="text-warm-gray text-[14px] leading-relaxed">
          This guide is provided by navlan.io for informational purposes only. It does not constitute legal, financial, or tax advice. Information may change — always verify with qualified professionals before making decisions.
        </p>
      ),
    },
  ];

  return (
    <GuidePage
      title="Dira BeHanacha: Israel's Subsidized Housing Program"
      seoTitle="Dira BeHanacha: Israel's Subsidized Housing Program — Complete English Guide | Navlan.io"
      subtitle="The most complete English-language guide to Israel's government housing lottery — eligibility, how to apply, and what to expect."
      date="Last updated: March 2026"
      readTime="~20 min read"
      metaDescription="English guide to Dira BeHanacha, Israel's subsidized housing lottery. Eligibility, the application process, and how olim can get discounted apartments."
      sections={sections}
      bottomNav={{
        prev: { label: "Start Here Guide", to: "/guides/start-here" },
        next: { label: "Resources", to: "/resources" },
      }}
      related={[
        { label: "Explore Cities", to: "/#explore-cities" },
        { label: "Current Mortgage Rates", to: "/market" },
        { label: "Start Here Guide", to: "/guides/start-here" },
      ]}
      headerContent={<>{tldr}{quickRef}</>}
    />
  );
};

export default DiraGuidePageComponent;
