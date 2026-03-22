import { Link } from "react-router-dom";
import GuidePage, { GuideSection } from "@/components/guides/GuidePage";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import PullQuote from "@/components/ui/PullQuote";
import CalloutBox from "@/components/ui/CalloutBox";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const PinuiBinuiGuidePage = () => {
  /* ---------------------------------------------------------------- */
  /*  TL;DR box                                                        */
  /* ---------------------------------------------------------------- */

  const tldr = (
    <div className="bg-[#FAF8F5] border-l-4 border-[#4A7F8B] p-6 my-8 rounded-r-lg">
      <h2 className="text-lg font-semibold text-[#2D3234] mb-3 font-serif">TL;DR</h2>
      <ul className="space-y-2 text-[#2D3234]/80 text-sm leading-relaxed">
        <li>• Urban renewal accounts for ~30% of all new housing starts nationally (64% in Tel Aviv) — it's reshaping Israel's built environment at massive scale.</li>
        <li>• Tama 38 expired in August 2024 for most of Israel; Pinui Binui is now the primary framework.</li>
        <li>• If you live in or buy a pre-1980 building, renewal may give you a brand-new, larger apartment (typically 12–25 sqm bigger) with elevator, parking, mamad, and modern finishes — at no cost to you.</li>
        <li>• The catch: timelines are 7–15 years, nothing is guaranteed until permits are issued, and living in an aging building during the wait is not easy.</li>
        <li>• Only 66% of apartment owners need to agree for a project to proceed — holdouts can be compelled by court order.</li>
        <li>• Never pay a "Pinui Binui premium" based on a broker's verbal promise. Verify independently through your lawyer.</li>
        <li>• Tax treatment is favorable: the apartment swap is generally exempt from capital gains tax, and rent subsidies during construction are tax-free.</li>
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
          <strong>What it is:</strong> Government-incentivized programs to
          demolish or strengthen Israel's aging buildings (mostly pre-1980) and
          replace them with modern construction
        </li>
        <li>
          <strong>Tama 38 status:</strong> Expired in most of Israel as of
          August 29, 2024. A handful of municipalities that filed alternative
          plans have extensions until May 2026. Projects approved before
          expiration continue; no new Tama 38 permits are being issued in most
          municipalities
        </li>
        <li>
          <strong>Pinui Binui status:</strong> Active and expanding — this is
          now the primary framework for urban renewal in Israel
        </li>
        <li>
          <strong>Scale:</strong> Urban renewal accounts for roughly 30% of all
          new housing starts nationally, and about 50% of all planning approvals
          in 2025. See the latest construction data on our{" "}
          <Link to="/market" className="text-horizon-blue hover:underline">
            Market Data
          </Link>{" "}
          page
        </li>
        <li>
          <strong>Resident consent threshold:</strong> 66% of apartment owners
          must agree for a project to move forward (reduced from 80% in 2018)
        </li>
        <li>
          <strong>What residents get:</strong> A new, larger apartment (typically
          12–25 sqm bigger) in a modern building, plus parking, storage room,
          mamad (safe room), and elevator — at no cost
        </li>
        <li>
          <strong>Typical timeline:</strong> 7–15 years from initial designation
          to moving into the new apartment, though some projects take longer
        </li>
        <li>
          <strong>Tax treatment:</strong> Replacement apartments are generally
          exempt from capital gains tax; rent subsidies during construction are
          tax-free
        </li>
        <li>
          <strong>Why it matters to buyers:</strong> If you're looking at an
          apartment in a building constructed before approximately 1980, urban
          renewal may dramatically affect that property's future
        </li>
      </ul>
    </CalloutBox>
  );

  /* ---------------------------------------------------------------- */
  /*  Sections                                                         */
  /* ---------------------------------------------------------------- */

  const sections: GuideSection[] = [
    {
      id: "what-is-urban-renewal",
      title: "1. What Is Urban Renewal in Israel?",
      content: (
        <>
          <p className="mb-4">
            Walk through almost any Israeli city and you will see them: four- or
            five-story concrete apartment buildings, no elevator, narrow
            stairwells, cracked facades, and rebar poking through the balconies.
            These buildings — sometimes called <em>shikunim</em> — were the
            backbone of Israel's housing in the 1950s, 1960s, and 1970s. They
            were built fast to house waves of immigration, and they were built to
            the construction standards of their time, which is to say: no
            earthquake reinforcement, no safe rooms, no underground parking, and
            limited structural longevity.
          </p>
          <p className="mb-4">
            Israel sits on the Syrian-African Rift, a seismically active fault
            line. A major earthquake — which seismologists consider overdue —
            could cause catastrophic damage to tens of thousands of these older
            buildings. Beyond earthquake risk, these structures are simply aging
            out. They lack basic modern amenities. Many have no elevator, which
            effectively traps elderly residents on upper floors. They have no
            mamad (safe room), which became a life-or-death feature during
            rocket attacks. Plumbing, electrical, and waterproofing systems are
            well past their design life.
          </p>
          <p className="mb-4">
            The government's solution was elegant in concept: rather than
            spending public money to retrofit or replace these buildings, create
            incentives for private developers to do it. The mechanism is building
            rights. A developer agrees to strengthen or demolish and rebuild an
            old building, covering all costs for existing residents. In exchange,
            the government grants the developer permission to build additional
            floors and apartments on the same plot, which the developer then
            sells at market price. The profit from those additional units is what
            funds the entire project.
          </p>
          <p className="mb-4">
            This approach has produced two major programs.{" "}
            <strong>Tama 38</strong> (National Outline Plan 38) was introduced
            in 2005 and focused on individual buildings.{" "}
            <strong>Pinui Binui</strong> (literally "evacuate and build") evolved
            in parallel and operates at a larger neighborhood or complex scale.
            Tama 38 expired for most of Israel in August 2024. Pinui Binui is
            now the dominant framework and is expected to shape Israeli real
            estate for decades to come.
          </p>
          <p className="mb-4">
            The numbers tell the story of how central urban renewal has become.
            According to Israel's Central Bureau of Statistics, roughly 30% of
            all new housing starts in 2024 were urban renewal projects. In{" "}
            <Link
              to="/city/tel-aviv"
              className="text-horizon-blue hover:underline"
            >
              Tel Aviv
            </Link>
            , the figure was closer to 64%. In 2025, fully half of all planning
            approvals nationwide were for urban renewal projects. The Government
            Urban Renewal Authority has projected that approximately 530,000
            housing units across the country could be renewed under
            comprehensive city plans. This is not a niche program — it is a
            transformation of Israel's built environment. See the latest
            construction data on our{" "}
            <Link to="/market" className="text-horizon-blue hover:underline">
              Market Data
            </Link>{" "}
            page.
          </p>
          <p className="mb-4">
            For anyone buying property in Israel, understanding urban renewal is
            not optional. If the apartment you are considering was built before
            roughly 1980, there is a reasonable chance that building will
            eventually be a candidate for demolition and reconstruction. That
            possibility changes everything about how you evaluate the purchase:
            the price, the timeline, the livability during the wait, and the
            eventual upside.
          </p>
        </>
      ),
    },
    {
      id: "tama-38",
      title: "2. Tama 38 — What It Was and Why It Ended",
      content: (
        <>
          <p className="mb-4">
            Tama 38 — formally National Outline Plan 38 (<em>Tochnit Mitar
            Artzit 38</em>, תמ"א 38) — was approved in 2005 as a direct
            response to earthquake risk. The plan applied nationwide and allowed
            property owners in buildings constructed before 1980 to work with a
            developer to strengthen or replace their building, with the developer
            compensated through additional building rights.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Tama 38/1: Strengthening and Addition
          </h3>
          <p className="mb-4">
            The original version — commonly called Tama 38/1 — involved
            retrofitting an existing building for earthquake resistance while
            adding space. In a typical project, the developer would reinforce the
            building's structure (adding shear walls, strengthening columns), and
            in exchange would build one or two additional floors on top. Existing
            residents would often receive expanded apartments — a sealed balcony
            converted to a room, an added mamad, upgraded building systems —
            while the developer sold the new rooftop apartments at market price.
          </p>
          <p className="mb-4">
            These projects were attractive because residents did not have to
            leave their homes during construction (though they lived through
            months or years of noise and disruption). They were also faster than
            full demolition projects.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Tama 38/2: Demolition and Reconstruction
          </h3>
          <p className="mb-4">
            The more ambitious version — Tama 38/2 — was essentially demolition
            and reconstruction of a single building. The old building was torn
            down entirely and replaced with a new, larger building. Existing
            residents received new apartments (typically bigger than their
            originals) in the new building, and the developer sold additional
            units to fund the project.
          </p>
          <p className="mb-4">
            Tama 38/2 became increasingly popular because it produced a far
            better end result: a completely new building rather than a patched-up
            old one. Over time, Tama 38/2 projects grew so large and ambitious
            that the distinction between Tama 38/2 and Pinui Binui became
            blurry.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Why Tama 38 Ended
          </h3>
          <p className="mb-4">
            Tama 38 was meant to solve earthquake vulnerability, but it evolved
            into something else entirely. Several problems accumulated over
            nearly two decades:
          </p>
          <p className="mb-4">
            Developers used the framework to build luxury additions in upscale
            neighborhoods that had little to do with earthquake safety. Neighbors
            in adjacent buildings opposed projects that blocked their light,
            added traffic, and strained local infrastructure. Local planning
            authorities were overwhelmed by the volume of applications, each
            handled as an individual building permit rather than part of a
            coordinated neighborhood plan. Infrastructure — roads, sewers,
            schools, parks — could not keep up with the added density.
          </p>
          <p className="mb-4">
            The government decided that urban renewal needed to shift from
            building-by-building permits to comprehensive neighborhood and
            city-level planning. Tama 38 officially expired on August 29, 2024
            for most of Israel. However, the situation is more nuanced than a
            single cutoff date:
          </p>
          <p className="mb-4">
            In cities like{" "}
            <Link
              to="/city/tel-aviv"
              className="text-horizon-blue hover:underline"
            >
              Tel Aviv
            </Link>
            , Bnei Brak, and{" "}
            <Link
              to="/city/bat-yam"
              className="text-horizon-blue hover:underline"
            >
              Bat Yam
            </Link>{" "}
            — which did not submit alternative municipal renewal plans before the
            deadline — Tama 38 is no longer in effect. In certain municipalities
            that did file alternative plans, such as{" "}
            <Link
              to="/city/rishon-lezion"
              className="text-horizon-blue hover:underline"
            >
              Rishon LeZion
            </Link>
            , Tama 38 applications remain open until May 2026 or until the
            replacement plan is approved, whichever comes first. Projects that
            received approved building permits before the expiration date
            continue and will be completed under their original Tama 38
            approvals — thousands of these pipeline projects are still under
            construction across the country.
          </p>

          <CalloutBox title="Is Your Building a Tama 38 Pipeline Project?">
            If a building already had an approved Tama 38 permit before August
            2024, that project continues as planned. If you are buying an
            apartment in such a building, the Tama 38 project is still
            happening. Ask the seller or the building committee (
            <em>va'ad bayit</em>) what stage the project has reached and whether
            permits were issued before the cutoff.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "pinui-binui-how-it-works",
      title: "3. Pinui Binui — How It Works Now",
      content: (
        <>
          <p className="mb-4">
            Pinui Binui — literally "evacuation and construction" (פינוי בינוי)
            — is now the primary framework for urban renewal in Israel. Unlike
            Tama 38, which operated building by building, Pinui Binui typically
            operates at the scale of a complex (<em>mithcham</em>, מתחם):
            multiple buildings, sometimes an entire neighborhood block,
            designated together for demolition and reconstruction.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            How a Project Gets Started
          </h3>
          <p className="mb-4">
            The process begins with designation. The government — through the
            Urban Renewal Authority (<em>Rashut Lehithadshut Ironit</em>) or
            local planning committees — identifies and declares a "renewal
            complex" (<em>mithcham hithadshut</em>, מתחם התחדשות). Designation
            is based on factors including building age and condition, earthquake
            vulnerability, population density, infrastructure needs, and the
            area's potential for increased housing.
          </p>
          <p className="mb-4">
            Once an area is designated, the process unfolds roughly as follows:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>
              A developer (<em>yozem</em>, יזם) proposes a plan for the complex.
            </li>
            <li>
              The plan goes through municipal and sometimes national planning
              committee (<em>ve'adat tikhnun</em>) approval.
            </li>
            <li>
              The developer negotiates agreements with apartment owners.
            </li>
            <li>
              Once sufficient owners sign, the project moves toward building
              permits (<em>heeter bniya</em>).
            </li>
            <li>
              Construction begins: old buildings are demolished and new ones are
              built.
            </li>
            <li>
              Residents return to new apartments in the completed buildings.
            </li>
          </ol>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Consent Threshold
          </h3>
          <p className="mb-4">
            This is one of the most critical numbers in Israeli urban renewal:{" "}
            <strong>66% of apartment owners</strong> in a building must agree
            for a Pinui Binui project to proceed. This threshold was reduced
            from 80% in a landmark 2018 amendment to the Evacuation and
            Construction Rights Law (Amendment 4). The reduction was
            specifically designed to limit the power of holdout owners (
            <em>sarvanim</em>) to block projects that the majority wanted.
          </p>
          <p className="mb-4">
            In buildings with fewer than four units, the rules differ and
            typically require a higher proportion of consent.
          </p>
          <p className="mb-4">
            Once the 66% threshold is reached, the developer or consenting
            owners can petition the court to compel holdout owners to
            participate. The court examines whether the holdouts' objections are
            based on justified grounds — such as genuine hardship, inadequate
            compensation, or a fundamentally flawed project — or whether they
            are simply refusing without reasonable cause.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            What Gets Built
          </h3>
          <p className="mb-4">
            Pinui Binui projects are transformative. Where there might have been
            a cluster of four-story walkups with 20–30 apartments each, the new
            development might include towers of 15–25 stories with hundreds of
            apartments. The increased density is the economic engine: the
            additional units that the developer can sell at market price are what
            fund the entire project, including new apartments for all existing
            residents, temporary housing, and infrastructure improvements.
          </p>
          <p className="mb-4">
            New developments typically include underground parking, commercial
            space on ground floors, landscaped common areas, and modern building
            systems including elevators, safe rooms, and energy-efficient
            construction.
          </p>

          <PullQuote>
            Pinui Binui is not just about replacing individual buildings — it is
            about reimagining entire neighborhoods. A cluster of aging walkups
            becomes a modern residential complex with infrastructure, parking,
            and public space that the original neighborhood never had.
          </PullQuote>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Timeline Reality
          </h3>
          <p className="mb-4">
            This is where expectations need management. A Pinui Binui project
            from initial designation to handing residents the keys to their new
            apartments typically takes <strong>7–15 years</strong>. Some
            projects have taken longer. The stages — feasibility studies,
            planning approval, resident agreements, permit applications,
            construction — each involve their own delays, negotiations, and
            potential setbacks.
          </p>
          <p className="mb-4">
            If someone tells you a Pinui Binui project will be completed in
            three years, be skeptical. These are enormous, complex undertakings
            involving hundreds of families, multiple regulatory bodies, and
            major construction in dense urban areas.
          </p>
        </>
      ),
    },
    {
      id: "what-residents-get",
      title: "4. What Residents Actually Get (The Deal)",
      content: (
        <>
          <p className="mb-4">
            The fundamental exchange in Pinui Binui is straightforward: you give
            up your old apartment, and you receive a new one in the building
            that replaces it. You pay nothing for the new apartment. But the
            details matter enormously, and they vary from project to project.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            What You Typically Receive
          </h3>
          <p className="mb-4">
            <strong>A new apartment, typically larger than your original.</strong>{" "}
            In most Pinui Binui agreements, the replacement apartment is 12–25
            square meters larger than the original. The exact size increase
            depends on the project economics, the developer's agreement with
            residents, and the specific terms negotiated. As a reference point,
            it is common for a resident with a 65-square-meter apartment to
            receive an 80–90-square-meter replacement.
          </p>
          <p className="mb-4">
            However, it is worth noting that the Urban Renewal Authority has
            recently moved to limit the size addition to 12 square meters in
            some projects, citing concerns about project profitability. This cap
            has been controversial and may not apply uniformly.
          </p>
          <p className="mb-4">
            <strong>A mamad (safe room).</strong> Older buildings almost never
            have safe rooms. Every apartment in a new building is required by
            law to include one. For families who have lived through rocket
            attacks sheltering in stairwells, this alone can be transformative.
          </p>
          <p className="mb-4">
            <strong>An elevator.</strong> Older walkups have no elevator. The
            new building will. For elderly residents, this changes their daily
            quality of life dramatically.
          </p>
          <p className="mb-4">
            <strong>A parking space.</strong> Most older buildings have no
            designated parking. Pinui Binui projects typically include
            underground parking with at least one space per apartment.
          </p>
          <p className="mb-4">
            <strong>A storage room.</strong> Usually in the building's basement
            level.
          </p>
          <p className="mb-4">
            <strong>Modern construction standards.</strong> New plumbing,
            electrical systems, insulation, earthquake reinforcement, and
            energy-efficient building envelope.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Temporary Housing During Construction
          </h3>
          <p className="mb-4">
            While the old building is demolished and the new one is built — a
            construction period that typically runs 2–3 years — residents need
            somewhere to live. The developer is contractually obligated to
            provide alternative housing (<em>diyyur chalufi</em>, דיור חלופי).
            In most cases, this means the developer pays a monthly rent subsidy
            so that residents can rent a nearby apartment during construction.
          </p>
          <p className="mb-4">
            As of a July 2025 Tax Authority clarification, these rent payments
            from the developer are fully exempt from both income tax and capital
            gains tax. Residents do not need to report them on their annual tax
            return.
          </p>
          <p className="mb-4">
            The specific amount of the rent subsidy is negotiated in the
            resident agreement and should be sufficient to cover rental costs
            for a comparable apartment in the same area. Moving costs are also
            typically covered by the developer.
          </p>
          <p className="mb-4 text-sm italic">
            → For arnona rates and discounts during the renewal period, see our{" "}
            <Link to="/guides/arnona" className="text-horizon-blue hover:underline">
              Arnona Guide
            </Link>
            .
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            What You Do NOT Get
          </h3>
          <p className="mb-4">
            <strong>Cash.</strong> In most projects, residents receive a new
            apartment, not money. In rare cases — particularly for elderly
            residents who do not wish to return — there may be a cash buyout
            option, but this is the exception.
          </p>
          <p className="mb-4">
            <strong>Identical views or orientation.</strong> Your new apartment
            will be in a different building (even though it is on the same
            plot). The floor, orientation, and views may differ from what you
            had.
          </p>
          <p className="mb-4">
            <strong>A predictable timeline.</strong> Construction delays are
            common. The agreement should include penalties for developer delays,
            but the reality is that timelines slip.
          </p>
          <p className="mb-4">
            <strong>A guarantee the project happens at all.</strong> Some
            projects stall at various stages — insufficient resident consent,
            planning objections, developer financial difficulties, or market
            downturns. Designation as a renewal complex does not guarantee that
            a project will reach completion.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Tax Treatment
          </h3>
          <p className="mb-4">
            This is an area where residents receive meaningful protection.
            Replacement apartments in Pinui Binui are generally exempt from
            capital gains tax (<em>mas shevach</em>) — the swap of your old
            apartment for a new one is not treated as a taxable sale. There is
            also an exemption from betterment levy (<em>hetel hashbacha</em>)
            for the original residents. Developers benefit from reduced purchase
            tax and VAT benefits that make the project economics viable. For a
            full breakdown of purchase tax rules, see our{" "}
            <Link
              to="/guides/purchase-tax"
              className="text-horizon-blue hover:underline"
            >
              Purchase Tax Guide
            </Link>
            .
          </p>
          <p className="mb-4">
            For the specifics of your situation — particularly if you own more
            than one property, are a foreign resident, or have unusual ownership
            structures — consult a tax attorney. The exemptions have conditions
            and thresholds that vary based on individual circumstances.
          </p>

          <CalloutBox title="Tax Bottom Line for Residents">
            The swap of your old apartment for a new, larger one in a Pinui
            Binui project is generally not a taxable event. You do not pay
            capital gains tax on the "upgrade." Rent subsidies during
            construction are tax-free. But edge cases exist, and individual tax
            situations vary — always confirm with a professional.
          </CalloutBox>
        </>
      ),
    },
    {
      id: "buying-renewal-candidate",
      title: "5. Buying an Apartment in a Renewal-Candidate Building",
      content: (
        <>
          <p className="mb-4">
            This is the section that matters most if you are actively shopping
            for property in Israel. Buying an apartment in a building that is a
            candidate for urban renewal can be an extraordinary opportunity — or
            a frustrating experience. The difference comes down to realistic
            expectations and thorough due diligence.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            How to Identify Renewal Candidates
          </h3>
          <p className="mb-4">
            The most basic indicator is the building's age. If it was built
            before approximately 1980, it was constructed without modern
            earthquake standards and is a potential renewal candidate. Buildings
            from the 1950s through 1970s — the classic Israeli{" "}
            <em>shikunim</em> — are the primary targets.
          </p>
          <p className="mb-4">
            Beyond age, look for: low-rise construction (3–5 floors) in areas
            zoned for much higher density, no elevator, no safe rooms, no
            underground parking, visible structural deterioration, and location
            in neighborhoods where land values significantly exceed the value of
            the existing structures.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            How to Check Project Status
          </h3>
          <p className="mb-4">
            If a building is already in the urban renewal pipeline, this
            information is (in principle) available through several channels:
          </p>
          <p className="mb-4">
            <strong>MAVAT</strong> (the national planning repository at
            mavat.iplan.gov.il) lists plans that have been submitted to planning
            committees. If a Pinui Binui plan has been filed for the building's
            area, it should appear here. The interface is in Hebrew and can be
            difficult to navigate, so you may want help from your lawyer or real
            estate agent.
          </p>
          <p className="mb-4">
            <strong>The local planning committee</strong> (
            <em>ve'adat tikhnun mekomit</em>) maintains records of building
            permits and plan submissions in their jurisdiction. Your attorney
            can query them.
          </p>
          <p className="mb-4">
            <strong>The building committee</strong> (<em>va'ad bayit</em>). In
            many cases, the residents themselves are the best source of
            information. If a developer has been in contact and negotiations are
            underway, the building committee will know.
          </p>
          <p className="mb-4">
            <strong>Your attorney.</strong> This is not optional. If you are
            considering buying into a building with renewal potential, your
            attorney should be investigating the building's status as part of
            standard due diligence.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Opportunity
          </h3>
          <p className="mb-4">
            Here is the scenario that gets people excited: You buy a
            70-square-meter apartment in a 1960s building for a price that
            reflects the aging condition of the building. Several years later,
            the building is designated for Pinui Binui. After the project is
            completed, you receive an 85–95-square-meter apartment in a
            brand-new building with an elevator, parking, safe room, and modern
            finishes. The market value of the new apartment is substantially
            higher than what you paid for the old one.
          </p>
          <p className="mb-4">
            This has happened thousands of times in Israel, particularly in{" "}
            <Link
              to="/city/tel-aviv"
              className="text-horizon-blue hover:underline"
            >
              Tel Aviv
            </Link>
            ,{" "}
            <Link
              to="/city/ramat-gan"
              className="text-horizon-blue hover:underline"
            >
              Ramat Gan
            </Link>
            , Givatayim, and other central cities. It is a real phenomenon, not
            a fantasy.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Risks
          </h3>
          <p className="mb-4">
            But here is the other side, which you will not hear from a broker
            trying to sell you an apartment:
          </p>
          <p className="mb-4">
            <strong>Timeline uncertainty.</strong> Even if a building is
            designated as a renewal complex today, it could be 10–15 years
            before you move into the new apartment. During that time, you are
            living in (or renting out) an aging building with all its
            limitations.
          </p>
          <p className="mb-4">
            <strong>Not every old building will be selected.</strong> Designation
            depends on many factors: location, density, infrastructure capacity,
            developer interest, and resident willingness. Plenty of pre-1980
            buildings will never undergo renewal because the economics do not
            work or the residents cannot agree.
          </p>
          <p className="mb-4">
            <strong>You may be paying a premium.</strong> Sellers know about
            Pinui Binui potential, and they price it in. If you pay a "Pinui
            Binui premium" and the project never materializes, you overpaid for
            an old apartment.
          </p>
          <p className="mb-4">
            <strong>Livability during the wait.</strong> An old building without
            an elevator, with leaky plumbing and no safe room, is not easy to
            live in — especially with young children or elderly family members.
            The wait for renewal tests people's patience.
          </p>
          <p className="mb-4">
            <strong>Holdout residents can delay or kill projects.</strong> Even
            though the consent threshold is 66%, getting there is not guaranteed.
            And even with sufficient consent, holdouts can create legal delays.
          </p>
          <p className="mb-4">
            <strong>Developer insolvency.</strong> Construction is a volatile
            industry. Developers can and do go bankrupt mid-project. Bank
            guarantees exist to protect residents in this scenario, but the
            disruption is significant.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Due Diligence Checklist
          </h3>
          <p className="mb-4">
            Before buying an apartment in a building with potential (or active)
            urban renewal, make sure you or your attorney have clear answers to
            these questions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Has the building or complex been formally designated as a renewal
              area?
            </li>
            <li>Is there an existing agreement with a developer?</li>
            <li>
              What stage is the project at — feasibility, planning approval,
              resident agreements, permits, or construction?
            </li>
            <li>What percentage of residents have signed?</li>
            <li>Has a bank guarantee been issued?</li>
            <li>
              What do the specific agreement terms say about apartment size,
              floor assignment, timeline, temporary housing, and penalties for
              delays?
            </li>
            <li>
              What is the developer's track record — have they completed similar
              projects?
            </li>
          </ul>

          <CalloutBox title="The Golden Rule">
            Never buy an apartment at a "Pinui Binui premium" based solely on a
            broker's verbal assurance that the building is "about to go Pinui
            Binui." Verify independently, through your attorney, the actual
            status of any renewal project. "About to happen" in Israeli
            construction timelines can mean a decade.
          </CalloutBox>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "the-agreement",
      title: "6. The Agreement — What to Watch For",
      content: (
        <>
          <p className="mb-4">
            The resident agreement (<em>hskem</em>, הסכם) between apartment
            owners and the developer is the single most important document in
            the urban renewal process. It determines exactly what you will
            receive, when you will receive it, and what protections you have if
            things go wrong.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Key Terms to Understand
          </h3>
          <p className="mb-4">
            <strong>
              Apartment specifications (<em>mifrat techni</em>, מפרט טכני).
            </strong>{" "}
            The agreement should specify in detail what your new apartment looks
            like: size in square meters, floor number, orientation, number of
            rooms, finish quality (kitchen counters, bathroom fixtures, flooring,
            electrical outlets — everything). The more detailed the technical
            specifications, the better protected you are.
          </p>
          <p className="mb-4">
            <strong>Timeline and delay penalties.</strong> The agreement should
            commit the developer to a completion date and specify financial
            penalties for delays. These penalties incentivize the developer to
            stay on schedule and compensate residents when they do not.
          </p>
          <p className="mb-4">
            <strong>
              Bank guarantee (<em>arevut bankarit</em>, ערבות בנקאית).
            </strong>{" "}
            This is your most critical financial protection. Under Israel's Sale
            Law (Apartments), the developer is required to provide a bank
            guarantee that protects your interest in the new apartment. If the
            developer goes bankrupt or cannot complete the project, the bank
            guarantee ensures you are not left with nothing. The specifics of
            how this guarantee is structured should be clearly outlined in the
            agreement.
          </p>
          <p className="mb-4">
            <strong>Temporary housing terms (<em>diyyur chalufi</em>).</strong>{" "}
            How much rent will the developer pay? For how long? What if
            construction takes longer than planned — does the subsidy continue?
            Is there a cap? These terms need to be explicitly defined.
          </p>
          <p className="mb-4">
            <strong>What happens if the project fails.</strong> The agreement
            should address what happens if the project is abandoned, the
            developer defaults, or insufficient permits are obtained. Your exit
            rights and protections need to be clear.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Appraiser's Role
          </h3>
          <p className="mb-4">
            An independent appraiser (<em>shama'i</em>, שמאי) is appointed to
            assess the value of existing apartments and the value of proposed
            replacement apartments. The appraiser's report is a critical
            document: it establishes whether the deal is fair to residents. If
            the appraiser concludes that the new apartment is not equivalent in
            value to the old one (accounting for the age difference), the terms
            may need to be adjusted.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            The Developer vs. the Contractor
          </h3>
          <p className="mb-4">
            In some projects, the entity that initiates and manages the project
            (the <em>yozem</em> or developer) is different from the entity that
            actually builds it (the <em>kablan</em> or contractor). This
            distinction matters because your agreement is with the developer,
            but the construction quality depends on the contractor. Ask who the
            contractor is and look at their track record.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Why You Need a Specialist Lawyer
          </h3>
          <p className="mb-4">
            Urban renewal agreements are dense, technical, and high-stakes. A
            general real estate lawyer may not be familiar with the specific
            pitfalls and protections of Pinui Binui agreements. Find a lawyer
            who specializes in urban renewal (<em>hithadshut ironit</em>). This
            is not the place to economize on legal fees.
          </p>

          <PullQuote>
            The resident agreement is not a formality — it is the document that
            determines whether your experience of urban renewal will be a
            windfall or a headache. Every term matters. Read it with a specialist
            attorney, not on your own.
          </PullQuote>
        </>
      ),
    },
    {
      id: "common-scenarios",
      title: "7. Common Scenarios Anglos Face",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3 first:mt-0">
            "The broker says this building is 'going Pinui Binui soon.' Should
            we believe them?"
          </h3>
          <p className="mb-4">
            Approach this with healthy skepticism. Ask the broker what "soon"
            means — and then verify independently. Check whether the building
            has been formally designated as a renewal complex. Ask whether a
            developer has been selected and whether agreements have been signed.
            If none of these steps have happened, "soon" could mean five years,
            ten years, or never. In Israeli real estate, verbal assurances about
            future development are extremely common and frequently unreliable.
            Your lawyer can check the actual planning status through MAVAT and
            the local planning committee.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            "We just bought an apartment and now we hear the building might be
            demolished. What are our rights?"
          </h3>
          <p className="mb-4">
            You have exactly the same rights as any other apartment owner,
            regardless of when you purchased. If a Pinui Binui project moves
            forward, you will receive a replacement apartment on the same terms
            as owners who have lived there for decades. The agreement with the
            developer applies to all apartment owners in the building, not just
            those who were there when it was signed. As a new owner, you step
            into the existing agreement (if there is one) or participate in
            negotiating a new one.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            "Eighty percent of our building has signed, but two families are
            holding out. What happens?"
          </h3>
          <p className="mb-4">
            Since the consent threshold is 66%, you have more than enough
            signatories for the project to proceed legally. The developer or the
            consenting majority can petition the court to compel the holdout
            families to participate. The court will examine whether the holdouts
            have legitimate reasons for refusing — for instance, if the proposed
            compensation is genuinely unfair to them or if they face particular
            hardship. If the court finds no legitimate grounds for refusal, it
            can order the project to proceed. In some cases, courts have imposed
            significant financial penalties on holdouts whose refusal was deemed
            unreasonable — in one notable case, holdout owners were ordered to
            pay NIS 7.8 million in compensation to other residents.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            "We're renting in a Pinui Binui building. What happens to us?"
          </h3>
          <p className="mb-4">
            As a tenant, you do not have the same rights as an apartment owner.
            You will not receive a replacement apartment. However, you cannot
            simply be evicted overnight. Your existing rental contract remains
            in force for its term. If the landlord needs you to vacate for a
            Pinui Binui project, they must provide adequate notice as specified
            in your lease agreement and Israeli landlord-tenant law. In
            practice, tenants in Pinui Binui buildings typically need to
            relocate when the building is actually scheduled for demolition, and
            your landlord (who is the one receiving the new apartment) is
            responsible for fulfilling the terms of your lease.
          </p>
          <p className="mb-4 text-sm italic">
            → Renting in a building earmarked for Pinui Binui? See our{" "}
            <Link to="/guides/renting" className="text-horizon-blue hover:underline">
              Renting Guide
            </Link>{" "}
            for what to expect and your rights.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            "Is it worth buying a parking spot or storage room separately if the
            building might be demolished?"
          </h3>
          <p className="mb-4">
            In most Pinui Binui projects, parking and storage are included as
            standard features in the new building — even if the original
            building had neither. This means that purchasing a separate parking
            spot or storage room in the old building may be a wasted expense,
            since you will likely receive one regardless in the new building.
            That said, ownership of a parking spot in the existing building can
            sometimes affect the valuation of your assets in the renewal
            project. Consult your attorney about the specifics of your
            situation.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            "We own an apartment in a building that was approved under Tama 38/2
            before it expired. Is our project still happening?"
          </h3>
          <p className="mb-4">
            Yes. Projects that received approved building permits before Tama 38
            expired continue under their original approvals. The expiration of
            Tama 38 affects new applications, not projects already in the
            pipeline. Thousands of Tama 38 projects approved before August 2024
            are still under construction or progressing through pre-construction
            phases across Israel. Your project proceeds as planned.
          </p>
        </>
      ),
    },
    {
      id: "urban-renewal-by-city",
      title: "8. Urban Renewal by City",
      content: (
        <>
          <p className="mb-4">
            Urban renewal activity varies dramatically across Israel. Where you
            buy determines how likely — and how fast — a renewal project might
            be.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/tel-aviv"
              className="text-horizon-blue hover:underline"
            >
              Tel Aviv-Yafo
            </Link>
          </h3>
          <p className="mb-4">
            The epicenter of urban renewal in Israel. In 2024, 64% of all
            construction starts in Tel Aviv were urban renewal projects. It is
            projected that 70% of new construction in the city will be
            urban-renewal projects in the coming decade. Tel Aviv has the
            highest concentration of aging buildings in high-value locations,
            which makes the economics of Pinui Binui particularly attractive to
            developers. Neighborhoods like Florentin, Neve Sha'anan, Shapira,
            and parts of north Tel Aviv are seeing intense renewal activity.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/ramat-gan"
              className="text-horizon-blue hover:underline"
            >
              Ramat Gan
            </Link>{" "}
            and Givatayim
          </h3>
          <p className="mb-4">
            These inner-ring suburbs of Tel Aviv have large stocks of aging
            buildings and strong demand for new housing. Ramat Gan saw
            approximately 2,770 new apartments started in the review period.
            Both cities have been generally supportive of urban renewal, and
            their proximity to Tel Aviv makes them economically viable for
            developers.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/bat-yam"
              className="text-horizon-blue hover:underline"
            >
              Bat Yam
            </Link>
          </h3>
          <p className="mb-4">
            Another inner-ring city south of Tel Aviv with significant renewal
            activity. Bat Yam's relatively affordable price point (compared to
            Tel Aviv) combined with its beachfront location makes it an active
            renewal market.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/petah-tikva"
              className="text-horizon-blue hover:underline"
            >
              Petah Tikva
            </Link>
          </h3>
          <p className="mb-4">
            A standout performer in recent data: 74% of all construction in
            Petah Tikva in the review period was urban renewal — a higher
            proportion than even Tel Aviv. The Yosseftal neighborhood is a major
            focus, with planned density increasing substantially.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/jerusalem"
              className="text-horizon-blue hover:underline"
            >
              Jerusalem
            </Link>
          </h3>
          <p className="mb-4">
            Jerusalem presents a more complex picture. The city had 837 urban
            renewal housing starts in 2024 (about 27% of its total), but the
            municipality issued permits for 4,092 housing units via urban
            renewal in 2025 — nearly half the city's total permits. Thirty-one
            neighborhoods are currently undergoing Pinui Binui processes, led by
            Kiryat Yovel, Gilo, Armon HaNatziv, and Kiryat Menachem. However,
            Jerusalem's heritage restrictions, archaeological sensitivities, and
            political dynamics make urban renewal more complex and slower than
            in Tel Aviv.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/haifa"
              className="text-horizon-blue hover:underline"
            >
              Haifa
            </Link>
          </h3>
          <p className="mb-4">
            Haifa has been slower to embrace urban renewal than the central
            cities, but activity is picking up. Projects like the
            Stromma–Jean Jaurès complex in western Haifa are advancing. The
            city's lower land values mean that the economics of Pinui Binui are
            more challenging — developers need sufficient profit from additional
            units to fund the entire project, and that margin is tighter in
            less expensive cities.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            <Link
              to="/city/rishon-lezion"
              className="text-horizon-blue hover:underline"
            >
              Rishon LeZion
            </Link>
            , Holon, and the Southern Suburbs
          </h3>
          <p className="mb-4">
            These cities have growing urban renewal activity. Notably, Rishon
            LeZion is one of the municipalities where Tama 38 applications
            remained open past the August 2024 national expiration, with
            applications accepted until May 2026 or until the city's replacement
            plan is approved.
          </p>
        </>
      ),
    },
    {
      id: "future-of-urban-renewal",
      title: "9. The Future of Urban Renewal in Israel",
      content: (
        <>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3 first:mt-0">
            The Scale of the Challenge
          </h3>
          <p className="mb-4">
            Israel has a vast stock of aging buildings that need replacement. The
            Government Urban Renewal Authority has projected that approximately
            530,000 housing units could be renewed under comprehensive city
            plans. These buildings are home to hundreds of thousands of
            families, and most are in Israel's most densely populated urban
            areas. The renewal process has barely scratched the surface.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Policy Direction
          </h3>
          <p className="mb-4">
            With Tama 38's expiration, the government has clearly signaled that
            the future of urban renewal is Pinui Binui — large-scale, planned,
            neighborhood-level renewal rather than ad-hoc building-by-building
            permits. Municipalities are now responsible for drafting
            comprehensive renewal plans for their jurisdictions. This should, in
            theory, produce better outcomes: coordinated infrastructure
            upgrades, planned public spaces, and more thoughtful density
            management.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Infrastructure Challenges
          </h3>
          <p className="mb-4">
            One of the most persistent criticisms of urban renewal — and one of
            the reasons Tama 38 expired — is that adding density does not
            automatically add infrastructure. New towers need wider roads, more
            public transportation, additional school capacity, parks, and
            commercial services. In many neighborhoods, the infrastructure has
            not kept pace with the added density from renewal projects. This is
            a challenge that will only grow as Pinui Binui scales up.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            Political Dynamics
          </h3>
          <p className="mb-4">
            Urban renewal sits at the intersection of competing interests.
            Residents of aging buildings generally want renewal (though not
            always — disruption is significant). Neighbors in adjacent buildings
            often oppose projects that add height and traffic to their street.
            Developers need sufficient building rights to make projects
            profitable. Municipalities need to balance housing supply with
            neighborhood character and infrastructure capacity. Advocacy groups
            push for better terms for residents. The result is a constant
            negotiation, with policy shifting based on which constituency has
            the most political leverage at any given moment.
          </p>

          <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-8 mb-3">
            What This Means for Buyers
          </h3>
          <p className="mb-4">
            If you are buying property in Israel for the long term, urban
            renewal will almost certainly affect your experience in some way.
            You may buy into a building that gets renewed, transforming your
            property. You may buy near a building that gets renewed, changing
            your neighborhood. You may buy a new apartment that was itself built
            as part of a renewal project. Understanding this landscape — and
            watching how it evolves — is part of being an informed participant
            in Israel's property market.
          </p>

          <InlineNewsletterCTA source="guide" />
        </>
      ),
    },
    {
      id: "glossary",
      title: "10. Glossary of Hebrew Urban Renewal Terms",
      content: (
        <>
          <p className="mb-4">
            Understanding the Hebrew terminology is essential when navigating
            urban renewal in Israel. Here are the key terms you will encounter:
          </p>

          <div className="space-y-4">
            <p>
              <strong>Tama 38 (תמ"א 38)</strong> — National Outline Plan 38.
              The national framework (now expired in most areas) for earthquake
              strengthening and urban renewal of pre-1980 buildings.
            </p>
            <p>
              <strong>Pinui Binui (פינוי בינוי)</strong> — Literally "evacuation
              and construction." The current primary framework for large-scale
              urban renewal involving demolition and reconstruction of entire
              building complexes.
            </p>
            <p>
              <strong>Mithcham Hithadshut (מתחם התחדשות)</strong> — Renewal
              complex. The designated area — usually multiple buildings —
              approved for a Pinui Binui project.
            </p>
            <p>
              <strong>Hithadshut Ironit (התחדשות עירונית)</strong> — Urban
              renewal. The general term for all types of building renewal
              programs in Israel.
            </p>
            <p>
              <strong>Hskem (הסכם)</strong> — Agreement. Refers to the contract
              between apartment owners and the developer.
            </p>
            <p>
              <strong>Mifrat Techni (מפרט טכני)</strong> — Technical
              specifications. The detailed document specifying the finishes,
              fixtures, and features of replacement apartments.
            </p>
            <p>
              <strong>Yozem / Meyazem (יזם)</strong> — Developer or initiator.
              The entity that organizes, finances, and manages the renewal
              project.
            </p>
            <p>
              <strong>Kablan (קבלן)</strong> — Contractor. The entity that
              physically constructs the building. May be different from the
              developer.
            </p>
            <p>
              <strong>Arevut Bankarit (ערבות בנקאית)</strong> — Bank guarantee.
              The financial instrument that protects residents if the developer
              cannot complete the project.
            </p>
            <p>
              <strong>Shama'i (שמאי)</strong> — Appraiser. The independent
              professional who assesses property values for the purposes of the
              renewal agreement.
            </p>
            <p>
              <strong>Va'ad Bayit (ועד בית)</strong> — Building committee. The
              elected resident committee that manages building affairs and often
              serves as the point of contact for renewal negotiations.
            </p>
            <p>
              <strong>Diyyur Chalufi (דיור חלופי)</strong> — Alternative or
              temporary housing. The housing arrangement (usually a rent
              subsidy) provided to residents during the construction period.
            </p>
            <p>
              <strong>Mamad (ממ"ד)</strong> — Residential safe room (
              <em>Merchav Mugan Dirati</em>). Required in all new construction,
              absent from most older buildings.
            </p>
            <p>
              <strong>Taba (תב"ע)</strong> — Town building plan (
              <em>Tochnit Binyan Ir</em>). The local zoning and building plan
              that governs what can be built in a given area.
            </p>
            <p>
              <strong>Heeter Bniya (היתר בנייה)</strong> — Building permit. The
              formal permit issued by the local planning committee authorizing
              construction.
            </p>
            <p>
              <strong>Ve'adat Tikhnun (ועדת תכנון)</strong> — Planning
              committee. The local or district body that reviews and approves
              building plans and permits.
            </p>
            <p>
              <strong>Sarvan (סרבן)</strong> — Holdout or refuser. An apartment
              owner who refuses to consent to a renewal project. The term has a
              negative connotation in Israeli real estate discourse.
            </p>
            <p>
              <strong>Zchuyot Bniya (זכויות בנייה)</strong> — Building rights.
              The permitted scope of construction on a given plot — the currency
              that makes urban renewal economically viable.
            </p>
            <p>
              <strong>Hetel Hashbacha (היטל השבחה)</strong> — Betterment levy. A
              tax on increased property value resulting from changes to planning
              permissions. Generally exempt for original residents in renewal
              projects.
            </p>
            <p>
              <strong>Mas Shevach (מס שבח)</strong> — Capital gains tax on real
              estate. Generally exempt for the apartment swap in a Pinui Binui
              project.
            </p>
            <p>
              <strong>
                Rashut Lehithadshut Ironit (רשות להתחדשות עירונית)
              </strong>{" "}
              — Urban Renewal Authority. The government body that oversees and
              promotes urban renewal nationally.
            </p>
            <p>
              <strong>Shikun (שיכון)</strong> — Public housing estate. The older
              residential buildings, often built in the 1950s–1970s, that are
              the primary targets for urban renewal.
            </p>
            <p>
              <strong>MAVAT (מבא"ת)</strong> — The national planning repository
              database where submitted plans can be searched and reviewed.
            </p>
            <p>
              <strong>Necheshet / Diyyur Tzibburi (דיור ציבורי)</strong> —
              Public housing. Some renewal projects incorporate requirements for
              affordable or public housing units in the new construction.
            </p>
          </div>

          <div className="mt-8 p-4 bg-cream rounded-lg border border-grid-line">
            <p className="font-body text-[14px] text-warm-gray leading-relaxed">
              This guide is provided by navlan.io for informational purposes
              only. It does not constitute legal, financial, or investment
              advice. Urban renewal regulations, tax treatment, and project
              terms vary by location and change over time. Before making any
              property purchase decision, consult a qualified Israeli attorney
              who specializes in urban renewal. For related topics, see the
              Navlan{" "}
              <Link
                to="/guides/purchase-tax"
                className="text-horizon-blue hover:underline"
              >
                Purchase Tax Guide
              </Link>
              ,{" "}
              <Link
                to="/guides/mortgages"
                className="text-horizon-blue hover:underline"
              >
                Mortgage Guide
              </Link>
              , and city-specific pages.
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
          This guide is provided by navlan.io for informational purposes only. It does not constitute legal, financial, or tax advice. Information may change — always verify with qualified professionals before making decisions.
        </p>
      ),
    },
  ];

  return (
    <GuidePage
      title="Urban Renewal in Israel: Tama 38 & Pinui Binui"
      seoTitle="Tama 38 & Pinui Binui — The Complete English-Language Guide | Navlan.io"
      subtitle="What every Anglo buyer needs to know about Israel's massive building transformation"
      date="Last updated: March 2026"
      readTime="~22 min read"
      metaDescription="The complete English-language guide to urban renewal in Israel — Tama 38, Pinui Binui, resident rights, tax treatment, timelines, and what buyers need to know."
      sections={sections}
      headerContent={<>{tldr}{quickRef}</>}
      bottomNav={{
        prev: { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
        next: { label: "Start Here Guide", to: "/guides/start-here" },
      }}
      related={[
        { label: "Purchase Tax Guide", to: "/guides/purchase-tax" },
        { label: "Mortgage Guide", to: "/guides/mortgages" },
        { label: "Market Data", to: "/market" },
      ]}
    />
  );
};

export default PinuiBinuiGuidePage;
