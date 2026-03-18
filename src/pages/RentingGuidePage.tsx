import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AlertTriangle, Info } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Live-data hook — fetches latest average rents from city_rentals    */
/* ------------------------------------------------------------------ */

interface CityRentRow {
  city_name: string;
  period: string;
  avg_rent_total: number | null;
  avg_rent_2_5_3_rooms: number | null;
  avg_rent_3_5_4_rooms: number | null;
}

const RENT_CITIES = ["Jerusalem", "Tel Aviv - Yafo", "Haifa", "Beer Sheva"];

function useCityRents() {
  const [state, setState] = useState<{
    data: CityRentRow[];
    period: string;
    loading: boolean;
    error: boolean;
  }>({ data: [], period: "", loading: true, error: false });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        // Get latest period
        const { data: latest } = await supabase
          .from("city_rentals")
          .select("period")
          .order("period", { ascending: false })
          .limit(1);

        if (!latest || latest.length === 0) {
          setState((s) => ({ ...s, loading: false, error: true }));
          return;
        }

        const period = latest[0].period;

        const { data } = await supabase
          .from("city_rentals")
          .select("city_name, period, avg_rent_total, avg_rent_2_5_3_rooms, avg_rent_3_5_4_rooms")
          .eq("period", period)
          .in("city_name", RENT_CITIES);

        if (data && data.length > 0) {
          setState({ data, period, loading: false, error: false });
        } else {
          setState((s) => ({ ...s, loading: false, error: true }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false, error: true }));
      }
    };
    fetch_();
  }, []);

  return state;
}

/* ------------------------------------------------------------------ */
/*  Rent formatting helper                                              */
/* ------------------------------------------------------------------ */

function useFormatRent() {
  const { currency, rates } = useCurrency();
  return (nis: number | null) => {
    if (nis == null) return "—";
    if (currency === "₪") return `₪${Math.round(nis).toLocaleString()}`;
    const rate = currency === "$" ? rates.USD : rates.EUR;
    return `${currency}${Math.round(nis / rate).toLocaleString()}`;
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const RentingGuidePage = () => {
  const rents = useCityRents();
  const formatRent = useFormatRent();

  const displayName = (name: string) => {
    if (name === "Tel Aviv - Yafo") return "Tel Aviv";
    if (name === "Beer Sheva") return "Be'er Sheva";
    return name;
  };

  const sections: GuideSection[] = [
    {
      id: "how-renting-works",
      title: "How Renting Works in Israel — The Basics",
      content: (
        <>
          <p className="mb-4">
            About 30% of Israeli households rent their homes, and that number
            has been climbing steadily over the past decade. If you're making
            aliyah or relocating to Israel, you'll almost certainly rent before
            you buy — and even if you plan to rent long-term, that's completely
            normal here.
          </p>
          <p className="mb-4">
            But Israeli renting has its own logic, and it's different enough
            from the US, UK, Canada, or Australia that you'll want to understand
            the landscape before you start apartment hunting.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            There's no centralized listing system
          </h3>
          <p className="mb-4">
            Israel has no MLS equivalent. The rental market is fragmented across
            websites, Facebook groups, WhatsApp messages, and word of mouth.
            This can feel chaotic at first, but you'll get the hang of it.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            The standard lease is 12 months with option periods
          </h3>
          <p className="mb-4">
            Most Israeli leases run for one year, with one or two "option years"
            (optzia / אופציה) built into the contract. Here's the key part that
            surprises many Anglo renters: the option belongs to the tenant. If
            your contract includes a tenant option, you have the right to extend
            the lease at pre-agreed terms. The landlord can't say no.
          </p>
          <p className="mb-4">
            This is a powerful protection — make sure your lease includes it,
            and make sure it's a tenant-only option, not a mutual one (which
            gives the landlord veto power).
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "Unfurnished" means something different here
          </h3>
          <p className="mb-4">
            In the US, an unfurnished apartment still has a kitchen, built-in
            appliances, and light fixtures. In Israel, "unfurnished" can mean
            truly bare walls.
          </p>
          <p className="mb-4">
            Most rental apartments come with a kitchen already installed from
            previous owners or tenants. However, in newly built apartments being
            rented for the first time, or in some cases where the previous
            tenant removed their kitchen (which is legal — kitchens are
            sometimes considered the tenant's property), you may encounter an
            apartment without one. This is more common in the{" "}
            <Link
              to="/guides/start-here"
              className="text-horizon-blue no-underline hover:underline"
            >
              buying market
            </Link>{" "}
            than the rental market, but it's worth asking explicitly what's
            included.
          </p>
          <p className="mb-4">
            The broader point stands: "unfurnished" in Israel means less than
            what you'd expect, so always clarify what comes with the apartment.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Appliances are usually not included
          </h3>
          <p className="mb-4">
            Expect to supply your own refrigerator, washing machine, oven, and
            sometimes even light fixtures. Air conditioning units (mazgan /
            מזגן) are sometimes included if they're already installed, and the
            solar water heater (dud shemesh / דוד שמש) on the roof is part of
            the building. But don't assume anything — ask, and put it in the
            contract.
          </p>

          <CalloutBox title="What's Included? Always Ask" icon={Info}>
            While most rentals come with a kitchen already installed, it's not
            guaranteed — especially in new-build apartments or cases where the
            previous tenant took theirs. "Unfurnished" in Israel often means
            less than you'd expect. Always ask the landlord exactly what's
            included before signing, and get it in writing. Many Anglo-friendly
            rentals in cities like{" "}
            <Link
              to="/city/raanana"
              className="text-horizon-blue no-underline hover:underline"
            >
              Ra'anana
            </Link>
            ,{" "}
            <Link
              to="/city/modiin"
              className="text-horizon-blue no-underline hover:underline"
            >
              Modi'in
            </Link>
            , and{" "}
            <Link
              to="/city/jerusalem"
              className="text-horizon-blue no-underline hover:underline"
            >
              Jerusalem
            </Link>
            's Anglo neighborhoods come with kitchens already installed.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "finding-an-apartment",
      title: "Finding an Apartment",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Yad2 — The Big One
          </h3>
          <p className="mb-4">
            Yad2 (yad2.co.il) is Israel's dominant classifieds site and the
            first place most Israelis look for rentals. The interface is in
            Hebrew, which can be a barrier, but browser translation tools make
            it navigable. Some non-Israeli IP addresses may be geo-blocked —
            using a VPN set to Israel can help. Listings are posted by both
            landlords and agents, and the site lets you filter by city,
            neighborhood, price, and number of rooms.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Facebook Groups
          </h3>
          <p className="mb-4">
            For many English-speaking renters, Facebook is actually the primary
            search tool. Nearly every Israeli city and major neighborhood has
            Anglo community groups where apartments are posted regularly. These
            groups are also where you can ask questions, get recommendations for
            movers, and find people selling the kitchen and appliances from
            their current apartment (yes, this is a thing).
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Real Estate Agents (Metavchim)
          </h3>
          <p className="mb-4">
            Israeli rental agents work differently than what you may be used to.
            The agent typically represents the landlord, not the tenant —
            there's no Israeli equivalent of a "tenant's agent" in the rental
            market. And here's the part that shocks Americans: the tenant
            usually pays the agent's commission.
          </p>
          <p className="mb-4">
            The standard commission is one month's rent plus VAT (currently 18%
            as of January 2025). So if your rent is ₪7,000/month, expect to pay
            around ₪8,260 to the agent. This is a one-time fee at lease
            signing, and it's not charged on renewals with the same landlord.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Word of Mouth and WhatsApp
          </h3>
          <p className="mb-4">
            Never underestimate the power of personal networks in Israel's
            rental market. Tell everyone you know that you're looking — your
            ulpan classmates, your synagogue community, your kids' school
            parents, your colleagues. Many of the best rentals in Anglo
            communities never hit Yad2 or Facebook — they pass from one Anglo
            tenant to the next through word of mouth. Direct-from-landlord
            rentals (no agent) are increasingly common in these circles, and
            they save you the full commission.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Other Platforms
          </h3>
          <p className="mb-4">
            OnMap (onmap.co.il) has a particularly good map-based interface that
            lets you visualize exactly where apartments are relative to your
            work, your kids' school, or the beach. Homeless (homeless.co.il) is
            a well-established Hebrew site with a wide range of listings, and
            Realta aggregates listings from multiple platforms into one search.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Timing Your Search
          </h3>
          <p className="mb-4">
            The rental market is seasonal. The busiest period runs from June
            through September as families try to settle before the school year
            starts in September. August and September are peak chaos — expect
            bidding competition and less negotiating room. The quietest months
            are November through February, and that's when you'll have the most
            leverage on price and terms. If your schedule allows any flexibility,
            searching in the off-season can save you real money and stress.
          </p>

          <CalloutBox title="The Apartment Search Toolkit">
            Start your search with these resources: Yad2 (yad2.co.il) for the
            broadest listings, Facebook community groups for your target city,
            and OnMap (onmap.co.il) for map-based searching. Tell everyone in
            your network that you're looking — many of the best apartments are
            found through personal connections, not websites.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "what-things-cost",
      title: "What Things Cost",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Upfront Costs
          </h3>
          <p className="mb-4">
            Before you get the keys, you'll need to have a significant amount of
            cash ready. Here's the typical breakdown:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6 marker:text-sage">
            <li>First month's rent (paid in advance)</li>
            <li>
              Security deposit (pikadon / פיקדון): Typically 1–3 months' rent.
              Legally capped at the lower of three months' rent or one-third of
              the total rent for the full lease period.
            </li>
            <li>
              Agent commission (if applicable): One month's rent + 18% VAT
            </li>
          </ul>
          <p className="mb-4">
            This means you may need 3 to 5 months' rent in cash before you even
            move in. Plan your finances accordingly.
          </p>

          <CalloutBox title="Budget for Move-In Day" icon={AlertTriangle}>
            A realistic upfront budget for a ₪6,000/month apartment with an
            agent: First month (₪6,000) + deposit (₪6,000–18,000) + agent fee
            (₪7,080) = ₪19,080–31,080. Without an agent, you save the
            commission — but you still need first month plus deposit ready.
          </CalloutBox>

          {/* Dynamic rental data callout */}
          {!rents.loading && !rents.error && rents.data.length > 0 && (
            <div className="mt-6">
              <CalloutBox title={`Average Monthly Rents as of ${rents.period}`}>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-grid-line">
                        <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                          City
                        </th>
                        <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                          2.5–3 rooms
                        </th>
                        <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                          3.5–4 rooms
                        </th>
                        <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                          Overall avg
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grid-line">
                      {rents.data.map((row) => (
                        <tr key={row.city_name}>
                          <td className="py-2 px-3 text-charcoal font-medium">
                            {displayName(row.city_name)}
                          </td>
                          <td className="py-2 px-3 text-charcoal">
                            {formatRent(row.avg_rent_2_5_3_rooms)}
                          </td>
                          <td className="py-2 px-3 text-charcoal">
                            {formatRent(row.avg_rent_3_5_4_rooms)}
                          </td>
                          <td className="py-2 px-3 text-charcoal">
                            {formatRent(row.avg_rent_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 font-body text-[13px] text-warm-gray">
                  Source: Israel Central Bureau of Statistics. See{" "}
                  <Link
                    to="/market"
                    className="text-horizon-blue no-underline hover:underline"
                  >
                    Market Data
                  </Link>{" "}
                  for the latest trends.
                </p>
              </CalloutBox>
            </div>
          )}

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Ongoing Monthly Costs You'll Pay as a Tenant
          </h3>
          <p className="mb-4">
            Beyond rent, tenants in Israel are responsible for several costs
            that might be covered by landlords in other countries:
          </p>
          <p className="mb-4">
            <strong>Arnona (ארנונה) — Municipal property tax.</strong> This is
            the big one that surprises Anglo renters. In Israel, the tenant pays
            arnona, not the landlord. Arnona varies dramatically by city and
            even by neighborhood — it's calculated based on property size,
            location, and use. It can range from a few hundred to over a
            thousand shekels per month. Check the arnona zone before signing
            your lease. New olim may be eligible for an arnona discount in their
            first year — ask your municipality.
          </p>
          <p className="mb-4">
            <strong>Va'ad bayit (ועד בית) — Building maintenance fees.</strong>{" "}
            This monthly fee covers shared building expenses: cleaning common
            areas, elevator maintenance, garden upkeep, shared utilities.
            Amounts vary widely — from around ₪80/month in a basic walkup to
            ₪3,000/month in a luxury building with a pool and gym. Tenants pay
            the regular monthly va'ad bayit, but major building repairs and
            special assessments (like a new roof or elevator replacement) are
            the landlord's responsibility.
          </p>
          <p className="mb-4">
            <strong>Utilities.</strong> Electricity, water, and gas are all paid
            by the tenant. You'll set up accounts in your name. Internet and TV
            are also your responsibility to arrange and pay.
          </p>
          <p className="mb-4">
            <strong>
              Home insurance (bituach dira / ביטוח דירה).
            </strong>{" "}
            Not legally required for tenants, but highly recommended. A renter's
            policy covers your belongings against theft, fire, and water damage,
            and includes liability coverage. It typically costs a few hundred
            shekels per year — well worth it in a country where water heater
            leaks and plumbing adventures are not uncommon.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            What the Landlord Pays
          </h3>
          <p className="mb-4">
            The landlord is responsible for building structural insurance, major
            repairs (roof, plumbing infrastructure, structural issues), and
            property-level taxes on the asset itself (separate from arnona). The
            landlord also bears responsibility for any major building-level
            special assessments voted on by the va'ad bayit — such as elevator
            replacement, roof renovation, or building-wide infrastructure
            upgrades. These costs should never be passed on to the tenant,
            though some landlords try. Know the difference between regular va'ad
            bayit fees (your responsibility) and special assessments (theirs).
          </p>

          <PullQuote>
            Arnona, va'ad bayit, utilities, internet — the costs beyond rent add
            up fast. Budget for an additional 25–40% on top of your monthly rent
            to cover all tenant-paid expenses.
          </PullQuote>
        </>
      ),
    },
    {
      id: "rental-contract",
      title: "The Rental Contract (Hozeh Skhirut / חוזה שכירות)",
      content: (
        <>
          <p className="mb-4">
            Israeli rental contracts are typically 5–15 pages — more digestible
            than the 50-page monsters common in the US. But what they lack in
            length, they make up for in importance. Every clause matters.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Key Clauses to Understand
          </h3>
          <p className="mb-4">
            <strong>Duration and option periods.</strong> The contract should
            clearly state the initial lease term (usually 12 months) and any
            option periods, including who holds the option and what the terms
            are for renewal.
          </p>
          <p className="mb-4">
            <strong>Rent amount and payment schedule.</strong> Rent is typically
            paid monthly, and here comes culture shock number two: postdated
            cheques. On the day you sign the lease, you'll write 12 cheques
            dated for each month of the year ahead and hand them all to the
            landlord.
          </p>
          <p className="mb-4">
            This is completely normal in Israel. It's not sketchy. It's not a
            scam. It's how rent has been paid here for decades. Israeli banks
            accept postdated cheques, and the landlord deposits each one on the
            specified date. If you're coming from a country where you haven't
            written a cheque since 2005, welcome to Israel — you'll need a
            chequebook. (Bank transfers are becoming more common but cheques
            remain the standard for rent.)
          </p>
          <p className="mb-4">
            <strong>Rent increases.</strong> During the lease term, your rent
            cannot be raised. For option periods, the contract should specify
            any allowed increase — typically 3–5% per year, though this is
            negotiable. As of mid-2024, there is no statutory cap on rent
            increases in Israel (a temporary 25% cap expired in July 2024). This
            means the only protection you have is what's written in your
            contract. Negotiate the option-period increase before you sign.
          </p>
          <p className="mb-4">
            <strong>Security and guarantees.</strong> See Section 5 — this gets
            its own section because it's the part that causes the most anxiety.
          </p>
          <p className="mb-4">
            <strong>Maintenance responsibilities.</strong> The contract should
            specify who handles what. The general rule: structural and
            infrastructure issues are the landlord's responsibility; day-to-day
            wear and maintenance inside the apartment is the tenant's. Make sure
            this is clearly defined.
          </p>
          <p className="mb-4">
            <strong>Early termination.</strong> If you need to break your lease,
            the standard Israeli mechanism is to find a replacement tenant
            (dayar chalifee). The landlord must accept a reasonable
            replacement — meaning someone who can demonstrate the financial
            ability to meet the lease obligations. Your contract should spell
            out the process, including any notice periods and who is responsible
            for finding the replacement.
          </p>
          <p className="mb-4">
            <strong>Subletting.</strong> Most standard Israeli contracts
            restrict or prohibit subletting without the landlord's written
            consent. If there's any chance you might need to sublet (for
            example, if you travel frequently for work), negotiate this clause
            before signing.
          </p>
          <p className="mb-4">
            <strong>Pets.</strong> Pet policies are often not addressed in the
            standard contract, and this leads to misunderstandings. If you have
            a pet or plan to get one, ask explicitly and add a clause to the
            lease. Some landlords will agree to pets with an additional deposit
            or a clause about damage responsibility.
          </p>
          <p className="mb-4">
            <strong>Modifications.</strong> Want to paint the walls, hang
            shelves, or install a bookcase? Israeli contracts often require you
            to return the apartment to its original condition. Clarify what
            modifications you're allowed to make and whether you need to restore
            things at the end of the lease. Some landlords are flexible —
            especially if your modifications improve the apartment — but get it
            in writing.
          </p>

          <PullQuote>
            On the day you sign your lease, you'll hand the landlord 12
            postdated cheques — one for each month of the year ahead. This is
            completely normal. It's how rent works in Israel.
          </PullQuote>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Getting the Contract in English
          </h3>
          <p className="mb-4">
            You have the right to understand what you're signing. Options
            include requesting a bilingual (Hebrew-English) contract, having the
            contract translated, or — the best option — having an Israeli real
            estate lawyer review it for you. The Tel Aviv Municipality publishes
            a plain-language lease template that can serve as a reference point,
            though there's no single national standard form.
          </p>
          <p className="mb-4">
            Our strong recommendation: have a lawyer review the first lease you
            sign in Israel. It's a relatively small cost (typically
            ₪1,000–2,000) for significant protection, especially when you're
            still learning the local norms. A good real estate lawyer will flag
            problematic clauses, explain your rights, and potentially save you
            far more than their fee.
          </p>
        </>
      ),
    },
    {
      id: "guarantees-security",
      title: "Guarantees and Security — The Part That Scares Everyone",
      content: (
        <>
          <p className="mb-4">
            This is the section of the rental process that generates the most
            anxiety for Anglo renters. Israeli landlords typically ask for
            multiple forms of security, and some of them can feel intimidating
            if you're not used to them. Let's break it down.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Security Deposit (Pikadon / פיקדון)
          </h3>
          <p className="mb-4">
            Cash (or a cheque) held by the landlord for the duration of the
            lease, returned at the end minus any legitimate deductions for
            damages beyond normal wear and tear. The legal maximum is the lower
            of three months' rent or one-third of the total rent for the full
            lease period. In practice, one to two months is common. The deposit
            must be returned within 60 days of the lease ending (or 60 days
            after the tenant settles any outstanding debts).
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Bank Guarantee (Arevut Bankarit / ערבות בנקאית)
          </h3>
          <p className="mb-4">
            A letter from your bank guaranteeing a set amount to the landlord.
            If you breach the contract, the landlord can present the letter to
            the bank and collect. To get one, you'll need to have the guaranteed
            amount frozen in your bank account for the duration of the lease.
            There's also a bank fee. Bank guarantees are common in higher-end
            rentals but not universal.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Promissory Note (Shtar Chov / שטר חוב)
          </h3>
          <p className="mb-4">
            This is the one that terrifies Anglo renters. A shtar chov is a
            signed legal document in which you promise to pay a specified
            amount. If you breach the lease, the landlord can deposit the note
            with the Execution Office (hotza'ah lapo'al) for collection.
          </p>
          <p className="mb-4">Here's what you need to know:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6 marker:text-sage">
            <li>
              It's standard in Israel — not a scam. Almost every Israeli renter
              has signed one.
            </li>
            <li>
              The amount should be reasonable — typically equivalent to a few
              months' rent. Amounts of ₪30,000–₪60,000 are common; ₪100,000+
              may be excessive for a standard rental.
            </li>
            <li>
              It should be returned to you at the end of the lease in good
              standing.
            </li>
            <li>
              Never sign a blank promissory note. Make sure the amount, your
              name, the landlord's name, the date, and the connection to the
              rental contract are all filled in.
            </li>
            <li>
              If a landlord asks for an unreasonable amount, push back. This is
              negotiable.
            </li>
          </ul>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Guarantors (Arvim / ערבים)
          </h3>
          <p className="mb-4">
            Some landlords require one or two Israeli guarantors — people who
            co-sign and take on financial liability if you default. This can be
            challenging for new olim who don't have established local
            connections. If you can't find guarantors, you may be able to offer
            a larger security deposit or bank guarantee instead. This is
            negotiable.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            What's Reasonable?
          </h3>
          <p className="mb-4">
            A landlord typically asks for two of the above, not all of them.
            Common combinations include security deposit + promissory note, or
            security deposit + bank guarantee. If a landlord is demanding all
            four forms of security, that's a red flag — or at least a
            negotiation opportunity.
          </p>

          <CalloutBox title="Don't Panic About Guarantees">
            The guarantee system feels overwhelming at first, but it's standard
            practice in Israel. Most landlords want two forms of security —
            typically a deposit plus either a promissory note or bank guarantee.
            All of these are negotiable. A lawyer can review the terms to make
            sure everything is reasonable.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "tenant-rights",
      title: "Your Rights as a Tenant",
      content: (
        <>
          <p className="mb-4">
            Israeli rental law, governed primarily by the Fair Rental Law of
            2017 (Hok Skhirut Hogenet), provides important protections for
            tenants. Here's what you're entitled to:
          </p>
          <p className="mb-4">
            <strong>Your landlord cannot enter without permission.</strong> Even
            though they own the property, the apartment is your home during the
            lease. The landlord needs your consent to enter, except in genuine
            emergencies.
          </p>
          <p className="mb-4">
            <strong>The apartment must be habitable.</strong> The landlord is
            legally required to maintain the property in livable condition —
            functional plumbing, working electrical systems, structural
            integrity, proper ventilation, natural lighting, and a lockable
            front door. These requirements cannot be waived by contract.
          </p>
          <p className="mb-4">
            <strong>Repairs follow a clear framework.</strong> Under the Fair
            Rental Law, the landlord must complete standard repairs within 30
            days of written notice, and urgent repairs (loss of essential
            services like water, electricity, or heating) within 3 days. If they
            don't, the tenant may arrange repairs and deduct the cost from rent,
            depending on the contract terms. As a last resort, small claims
            court is available.
          </p>
          <p className="mb-4">
            For appliances that came with the apartment — like a built-in air
            conditioner or electric water heater — the landlord is generally
            responsible for repair or replacement, as these are considered part
            of the apartment's basic functionality. But this should be specified
            in your lease to avoid disputes.
          </p>
          <p className="mb-4">
            <strong>Eviction protections.</strong> Your landlord cannot evict you
            mid-lease without legitimate cause (non-payment, substantial
            property damage, illegal use of the property). Even with cause,
            eviction must go through the court system — self-help evictions
            (changing locks, cutting off utilities) are illegal.
          </p>
          <p className="mb-4">
            Your landlord must give you at least 90 days' notice if they don't
            intend to renew the lease. You must give the landlord at least 60
            days' notice if you plan to vacate.
          </p>
          <p className="mb-4">
            At the end of the lease, you must return the apartment in the same
            condition you received it, minus normal wear and tear. This is where
            those move-in photos become critical (see{" "}
            <button
              onClick={() => {
                const el = document.getElementById("tips-from-veterans");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-horizon-blue no-underline hover:underline bg-transparent border-none cursor-pointer p-0 font-body text-[16px]"
            >
              Section 9
            </button>
            ).
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Rent During the Contract Period
          </h3>
          <p className="mb-4">
            One point worth emphasizing: during your lease term, the landlord
            cannot raise your rent. Period. This is a legal protection, not just
            a contract term. Rent adjustments can only happen between lease
            periods (at option renewal), and only according to whatever increase
            mechanism is specified in the original contract. If no increase is
            specified and you exercise your option, the rent stays the same.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            A Note on Discrimination
          </h3>
          <p className="mb-4">
            Israeli rental law does not include the same explicit
            anti-discrimination protections that exist in the US Fair Housing
            Act or similar Anglo-country legislation. There's no equivalent of
            the Fair Housing Act that specifically prohibits discrimination in
            private residential rentals based on race, religion, family status,
            or national origin. In practice, discrimination in the rental market
            does occur — and it affects various populations, including Arab
            citizens, Ethiopian-Israelis, single mothers, and new olim. Legal
            remedies in the housing context are limited compared to what exists
            in most Western countries. If you encounter discrimination,
            organizations like the Association for Civil Rights in Israel (ACRI)
            may be able to provide guidance. This is an area where Israeli law
            is significantly less developed than in the US, UK, or Canada.
          </p>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "olim-rental-assistance",
      title: "Rental Assistance for Olim",
      content: (
        <>
          <p className="mb-4">
            If you're making aliyah, several government programs can help offset
            rental costs during your absorption period.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Sal Klita (Absorption Basket)
          </h3>
          <p className="mb-4">
            Every new oleh receives the sal klita — a financial package from the
            Ministry of Aliyah and Integration to help with initial absorption
            costs, including housing. For a single oleh, the total is
            approximately ₪21,000, distributed as an initial cash payment at
            the airport (around ₪3,000–3,500) plus six monthly installments.
            Family amounts are higher and scale with household size. Exact
            figures are adjusted annually — use the Nefesh B'Nefesh Sal Klita
            Calculator for current numbers.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Ministry of Housing Rental Assistance (Siyua BeSdira / סיוע בשדירה)
          </h3>
          <p className="mb-4">
            This is the primary ongoing rental subsidy for eligible olim.
          </p>
          <p className="mb-4">
            <strong>Amounts:</strong> Up to approximately ₪2,500/month for
            singles and ₪3,000/month for families. Additional supplements are
            available for those living in national priority areas (Negev and
            Galilee) — up to ₪973 extra for singles and ₪1,341 for families.
          </p>
          <p className="mb-4">
            <strong>Eligibility and timing:</strong> For olim arriving after
            March 1, 2024, payments begin in month 7 after aliyah and continue
            until month 30. Eligibility extends up to 4 years from receiving
            oleh status. For olim who arrived earlier, slightly different
            timelines apply.
          </p>
          <p className="mb-4">
            <strong>How to apply:</strong> For most olim, the payments are
            processed automatically through the Ministry of Housing. For special
            cases (changes in marital status, for example), contact the Ministry
            directly at *2310 or through Nefesh B'Nefesh.
          </p>
          <p className="mb-4">
            These amounts change periodically — always check with Nefesh
            B'Nefesh or the Ministry of Aliyah for current figures before making
            financial plans.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Absorption Centers (Merkaz Klita)
          </h3>
          <p className="mb-4">
            New olim can apply for temporary subsidized housing at absorption
            centers, which offer below-market-rate apartments alongside Hebrew
            ulpan classes, employment support, and social programming. Stays are
            typically around 6 months. Centers operate in several cities
            including Be'er Sheva, Ashkelon, Kiryat Tivon,{" "}
            <Link
              to="/city/haifa"
              className="text-horizon-blue no-underline hover:underline"
            >
              Haifa
            </Link>
            , Hadera, and others.
          </p>
          <p className="mb-4">
            Apply through the Jewish Agency emissary (shaliach) during your
            pre-aliyah process — spots are limited and should be requested
            early, ideally several months before your aliyah date. Absorption
            centers are generally available for olim up to age 55, and
            availability is assessed on a case-by-case basis. They're not
            available for those making aliyah from within Israel in most cases.
          </p>
          <p className="mb-4">
            Living in an absorption center can be a gentle landing pad — you're
            surrounded by other new olim, you have structured support, and you
            can take time to explore different neighborhoods before committing
            to a lease. The trade-off is limited privacy and the communal living
            environment, which isn't for everyone.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            Other Programs
          </h3>
          <p className="mb-4">
            Shivat Zion, which primarily serves olim from Europe and Latin
            America, provides comprehensive housing guidance through their
            information portal and may offer specialized rental assistance for
            program participants. Their pilot community programs in select
            locations sometimes include furnished apartments and hands-on
            relocation support.
          </p>

          <CalloutBox title="Check Current Benefits" icon={AlertTriangle}>
            Olim benefits — including sal klita amounts, rental assistance, and
            absorption center availability — change regularly. For the most
            current information, check with Nefesh B'Nefesh (nbn.org.il), the
            Ministry of Aliyah and Integration, or Shivat Zion
            (shivat-zion.com) if you're making aliyah from Europe or Latin
            America. Don't rely on numbers from even a year ago.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "common-problems",
      title: "Common Problems and How to Handle Them",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "My landlord won't fix the AC / boiler / plumbing."
          </h3>
          <p className="mb-4">
            Start with written notice (email or WhatsApp message — something
            documented). The landlord has 30 days for standard repairs and 3
            days for urgent issues (like no hot water in winter or no AC when
            temperatures are dangerous). If they don't respond within the legal
            timeframe, you may be able to arrange the repair yourself and deduct
            the cost from rent — but check your contract first. If the landlord
            still won't cooperate, small claims court (bet mishpat le'tavi'ot
            ktanot) is available for disputes up to ₪38,900 (as of January
            2025). You don't need a lawyer for small claims.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "My landlord wants to raise rent 15% at renewal."
          </h3>
          <p className="mb-4">
            This depends entirely on what your lease says. If you have an option
            clause with a specified increase (say, 3–5%), the landlord is bound
            by that. If your option period has expired and you're negotiating a
            new lease, the landlord can propose market rate — there's no
            statutory cap on increases. Your leverage: it's expensive and
            time-consuming for landlords to find new tenants too. Negotiate.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "I need to break my lease early."
          </h3>
          <p className="mb-4">
            The standard Israeli mechanism is to find a replacement tenant
            (dayar chalifee). You're responsible for finding someone the
            landlord can reasonably accept — "reasonable" meaning someone who
            can meet the financial obligations. The landlord can't reject a
            qualified replacement without good cause. Give proper notice (at
            least 60 days), start looking early, and document everything.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "The apartment has mold or moisture problems that were there before
            I moved in."
          </h3>
          <p className="mb-4">
            Pre-existing structural issues — including chronic mold from
            building defects — are the landlord's responsibility. Document the
            problem with photos and timestamps, notify the landlord in writing,
            and give them the legally required time to address it. If they
            don't, you have grounds for rent reduction or, in severe cases,
            lease termination. This is one reason why thorough move-in
            documentation is so important.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "My landlord won't return my security deposit."
          </h3>
          <p className="mb-4">
            This is one of the most common disputes in Israeli rentals. Your
            first step is a written demand specifying the amount owed and the
            legal requirement to return it within 60 days. If the landlord
            claims deductions for "damages," ask for documentation. If you can't
            resolve it directly, file a claim in small claims court. The current
            limit is ₪38,900, and you don't need a lawyer. Bring your move-in
            photos, your lease, and any correspondence.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "The apartment I'm renting might not be legal."
          </h3>
          <p className="mb-4">
            Israel has a grey market of converted storage rooms, divided
            apartments, and units built without proper permits. These can be
            cheaper, but they come with risks: no habitability standard
            enforcement, insurance issues, and potential eviction if the
            municipality cracks down. Before signing, ask whether the apartment
            has a proper occupancy permit (te'udat gmar). If you discover your
            apartment is illegal after moving in, consult a lawyer about your
            options — you may have grounds to terminate the lease.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "My landlord wants to sell the apartment. Do I have to leave?"
          </h3>
          <p className="mb-4">
            Not during your lease term. A new owner inherits your existing lease
            and all its terms — this is a fundamental principle of Israeli
            rental law. However, once your lease expires (including option
            periods), the new owner has no obligation to renew. If your landlord
            tells you they're selling, you can't be forced out before the lease
            ends, but you should start planning for what happens when it does.
            Also be aware that during a sale process, the landlord may want to
            show the apartment to potential buyers — they should coordinate with
            you on reasonable times, and you have the right to say no to
            unreasonable intrusions.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-7 mb-3">
            "My neighbors are incredibly noisy and the landlord won't do
            anything."
          </h3>
          <p className="mb-4">
            Noise issues between tenants are generally a matter between
            neighbors, not a landlord obligation — unless the lease specifically
            includes a quiet enjoyment clause (rare in Israel) or the noise is
            caused by a building defect (like inadequate insulation). For
            persistent noise issues, Israeli municipalities have bylaws about
            noise hours, and you can file a complaint with the municipal
            inspectorate (pikuach ironi). In extreme cases, this could be
            grounds for lease termination if the apartment is genuinely
            uninhabitable, but that's a high bar to meet.
          </p>
        </>
      ),
    },
    {
      id: "tips-from-veterans",
      title: "Renting Tips from Anglo Veterans",
      content: (
        <>
          <p className="mb-4">
            These are the things nobody tells you until you've already learned
            them the hard way.
          </p>
          <p className="mb-4">
            <strong>Document everything on move-in day.</strong> Photograph
            every room, every scratch, every stain, every crack, every
            appliance. Open every faucet. Test every outlet. Check the AC in
            every room. Email the photos to yourself and the landlord on the
            same day. This is your single most important protection when the
            deposit dispute inevitably happens at the end of your lease.
          </p>
          <p className="mb-4">
            <strong>Get the contract translated or reviewed.</strong> Never sign
            a document you don't understand. A bilingual contract, a
            professional translation, or a lawyer's review — pick at least one.
            This is non-negotiable.
          </p>
          <p className="mb-4">
            <strong>
              Check the water pressure and hot water during your viewing.
            </strong>{" "}
            Israeli apartments can have creative plumbing. Turn on the shower.
            Flush the toilet. Run the kitchen sink. You'll thank yourself later.
          </p>
          <p className="mb-4">
            <strong>Ask about the neighbors.</strong> Noise levels, building
            culture, whether there's an active va'ad bayit that actually
            maintains the building — these things dramatically affect your
            quality of life.
          </p>
          <p className="mb-4">
            <strong>Check the arnona before you sign.</strong> Arnona can vary
            by hundreds of shekels per month between neighborhoods in the same
            city. The municipality's website will tell you the rate for a
            specific address. Also verify that the previous tenant or landlord
            doesn't have outstanding arnona debts on the property.
          </p>
          <p className="mb-4">
            <strong>Pay attention to apartment direction (kivun).</strong> In
            Israel's climate, a west-facing apartment gets brutal afternoon sun
            in summer. East-facing gets morning sun. South-facing gets sun most
            of the day. North-facing stays coolest. This affects your comfort
            and your electricity bill (AC costs add up fast).
          </p>
          <p className="mb-4">
            <strong>
              The "Anglo premium" is anecdotal but worth knowing about.
            </strong>{" "}
            Some Anglo renters report that landlords quote higher prices when
            they hear an English accent or foreign name. Whether this is
            systematic or incidental, having an Israeli friend or colleague help
            with negotiations can't hurt — and might save you real money.
          </p>
          <p className="mb-4">
            <strong>Negotiate!</strong> The Israeli rental market is negotiable.
            Almost everything — rent, deposit amount, option-year increases,
            included appliances, painting, minor repairs — is on the table.
            Don't accept the first price. Start lower, meet in the middle. Your
            negotiating power is strongest in winter (November–February) when
            demand is lowest.
          </p>
          <p className="mb-4">
            <strong>Verify ownership.</strong> Before handing over money, confirm
            that the person you're dealing with actually owns the apartment.
            Your lawyer can check the tabu (land registry) for a small fee.
            Rental scams — where someone rents out an apartment they don't
            own — do exist.
          </p>
          <p className="mb-4">
            <strong>Understand what "rooms" means.</strong> In Israeli listings,
            "rooms" (chadarim) counts differently than what you're used to. The
            living room counts as a room. So a "3-room apartment" is typically a
            living room plus two bedrooms — roughly equivalent to a
            one-bedroom in American terms. A "4-room" apartment has a living
            room and three bedrooms. Half-rooms (like "3.5 rooms") indicate a
            small extra space, often used as a study or nursery.
          </p>
          <p className="mb-4">
            <strong>Budget for the unexpected.</strong> Between appliance
            purchases, kitchen installation (if needed), moving costs, and the
            various deposits and fees, the first month in a new Israeli
            apartment is expensive. Build a buffer into your budget. Many olim
            underestimate the startup costs and end up stressed during what
            should be an exciting transition.
          </p>
          <p className="mb-4">
            <strong>Get renter's insurance.</strong> It's not required, but a
            basic bituach dira policy costs a few hundred shekels per year and
            covers theft, water damage, fire, and liability. Given that Israeli
            apartments often have water heater issues and plumbing surprises,
            this is money well spent.
          </p>

          <PullQuote>
            Photograph every room, every scratch, every stain on move-in day.
            Email the photos to yourself and the landlord. This is your single
            most important protection when the deposit dispute happens.
          </PullQuote>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "glossary",
      title: "Glossary of Hebrew Rental Terms",
      content: (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream">
                  <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                    Hebrew
                  </th>
                  <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                    Transliteration
                  </th>
                  <th className="py-2 px-3 font-heading font-semibold text-[14px] text-charcoal">
                    English
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-line">
                {[
                  ["שכירות", "Skhirut", "Rental; the act of renting"],
                  ["חוזה שכירות", "Hozeh Skhirut", "Rental contract / lease agreement"],
                  ["משכיר", "Maskir", "Landlord"],
                  ["שוכר", "Sokher", "Tenant"],
                  ["דמי שכירות", "Dmei Skhirut", "Rent payment"],
                  ["פיקדון", "Pikadon", "Security deposit"],
                  ["ערבות בנקאית", "Arevut Bankarit", "Bank guarantee"],
                  ["שטר חוב", "Shtar Chov", "Promissory note"],
                  ["ערבים", "Arvim", "Guarantors"],
                  ["מתווך", "Metavech", "Real estate agent / broker"],
                  ["דמי תיווך", "Dmei Tivuch", "Brokerage commission / agent fee"],
                  ["ארנונה", "Arnona", "Municipal property tax (paid by the tenant)"],
                  ["ועד בית", "Va'ad Bayit", "Building committee / building maintenance fees"],
                  ["דוד שמש", "Dud Shemesh", "Solar water heater (the tank on the roof)"],
                  ["דוד חשמל", "Dud Chashmal", "Electric water heater (backup when there's no sun)"],
                  ["מזגן", "Mazgan", "Air conditioner (split unit, wall-mounted)"],
                  ["ארון מטבח", "Aron Mitbach", "Kitchen cabinet"],
                  ["אופציה", "Optzia", "Option period; the tenant's right to extend the lease"],
                  ["דייר חליפי", "Dayar Chalifee", "Replacement tenant (for early lease termination)"],
                  ["ביטוח דירה", "Bituach Dira", "Home insurance / renter's insurance"],
                  ["תעודת זכאות", "Teudat Zakaut", "Eligibility certificate (for government rental assistance)"],
                  ["סיוע בשדירה", "Siyua BeSdira", "Rental assistance (government program)"],
                  ["בית משפט לתביעות קטנות", "Bet Mishpat LeTavi'ot Ktanot", "Small claims court"],
                  ["טאבו", "Tabu / Tabo", "Land registry"],
                  ["תעודת גמר", "Te'udat Gmar", "Occupancy permit / certificate of completion"],
                  ["חוק שכירות הוגנת", "Hok Skhirut Hogenet", "Fair Rental Law (2017)"],
                  ["הוצאה לפועל", "Hotza'ah LaPo'al", "Execution Office (where promissory notes can be enforced)"],
                  ["דייר מוגן", "Dayar Mukhan", "Protected tenant (under the old Tenant Protection Law — rare today)"],
                  ["חדרים", "Chadarim", "Rooms (in listings, includes the living room — a \"3-room\" apartment has 2 bedrooms)"],
                  ["כיוון", "Kivun", "Direction / orientation (which way the apartment faces — affects sun exposure)"],
                  ["משרד השיכון", "Misrad HaShikun", "Ministry of Housing (administers rental assistance programs)"],
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
            This guide provides general information about renting in Israel and
            is not legal or financial advice. Rental laws and government
            programs change periodically. For specific legal questions, consult
            an Israeli real estate lawyer. For current olim benefits, contact
            Nefesh B'Nefesh (nbn.org.il), the Ministry of Aliyah and
            Integration, or Shivat Zion (shivat-zion.com).
          </CalloutBox>

          <p className="mt-6 font-body text-[15px] text-warm-gray">
            See also:{" "}
            <Link
              to="/cities"
              className="text-horizon-blue no-underline hover:underline"
            >
              City Pages
            </Link>{" "}
            for current rental data in specific cities |{" "}
            <Link
              to="/guides/mortgages"
              className="text-horizon-blue no-underline hover:underline"
            >
              Mortgage Guide
            </Link>{" "}
            for when you're ready to buy |{" "}
            <Link
              to="/guides/purchase-tax"
              className="text-horizon-blue no-underline hover:underline"
            >
              Purchase Tax Guide
            </Link>{" "}
            for understanding mas rechisha |{" "}
            <Link
              to="/market"
              className="text-horizon-blue no-underline hover:underline"
            >
              Market Data
            </Link>{" "}
            for the latest market trends
          </p>
        </>
      ),
    },
  ];

  return (
    <GuidePage
      title="Renting an Apartment in Israel: The Complete English Guide"
      seoTitle="Renting an Apartment in Israel — Complete English Guide | Navlan"
      subtitle="Everything you need to know about finding, securing, and living in a rental apartment in Israel — from your first Yad2 search to getting your security deposit back."
      date="Last updated: March 2026"
      readTime="~20 min read"
      metaDescription="The complete English-language guide to renting in Israel — finding apartments, lease agreements, tenant rights, security deposits, olim benefits, and tips from Anglo veterans."
      sections={sections}
      bottomNav={{
        prev: { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
      }}
      related={[
        { label: "Start Here: Buying Property", to: "/guides/start-here" },
        { label: "Israeli Mortgages Guide", to: "/guides/mortgages" },
        { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
      ]}
    />
  );
};

export default RentingGuidePage;
