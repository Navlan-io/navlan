import { Link } from "react-router-dom";
import { BookOpen, Home, KeyRound, Scale, Building2, Building, ArrowRight, Receipt, ArrowLeftRight } from "lucide-react";

const guides = [
  {
    icon: BookOpen,
    title: "How Israeli Real Estate Works",
    description:
      "The purchase process, costs, mortgages, and common mistakes — explained for English speakers.",
    link: "/guides/start-here",
  },
  {
    icon: Home,
    title: "Dira BeHanacha: Subsidized Housing",
    description:
      "Israel's government housing program — eligibility, how to apply, and what to expect. The most complete English guide available.",
    link: "/guides/dira-behanacha",
  },
  {
    icon: KeyRound,
    title: "Israeli Mortgages Explained",
    description:
      "Tracks, rates, olim benefits, and the approval process — in plain English.",
    link: "/guides/mortgages",
  },
  {
    icon: Scale,
    title: "Purchase Tax (Mas Rechisha)",
    description:
      "Tax brackets, olim benefits, worked examples, and the scenarios every Anglo buyer faces.",
    link: "/guides/purchase-tax",
  },
  {
    icon: Building2,
    title: "Tama 38 & Pinui Binui",
    description:
      "Urban renewal explained — how it works, what residents get, and what buyers need to know.",
    link: "/guides/pinui-binui",
  },
  {
    icon: Building,
    title: "Renting in Israel",
    description:
      "Finding apartments, lease agreements, tenant rights, deposits, and what every foreign renter needs to know.",
    link: "/guides/renting",
  },
  {
    icon: Receipt,
    title: "Arnona Explained",
    description:
      "Israel's property tax — rates, discounts, and what you'll pay.",
    link: "/guides/arnona",
  },
  {
    icon: ArrowLeftRight,
    title: "Exchange Rates & Your Purchase",
    description:
      "How NIS/USD, EUR, and GBP rates change what you actually pay.",
    link: "/guides/exchange-rates",
  },
];

const NewToIsrael = () => {
  return (
    <section className="py-[78px] md:py-[110px] bg-warm-white">
      <div className="container max-w-[1080px] text-center">
        <h2 className="font-heading font-semibold text-[24px] text-charcoal">
          Understand the Market
        </h2>
        <p className="mt-1 font-body text-[15px] text-warm-gray">
          Essential guides for English-speaking property buyers
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6 max-w-[1080px] mx-auto">
          {guides.map((guide) => (
            <div
              key={guide.title}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-cream rounded-xl p-7 shadow-[0_2px_12px_rgba(45,50,52,0.10)] text-left hover:shadow-[0_8px_24px_rgba(45,50,52,0.15)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <guide.icon className="h-8 w-8 text-sand-gold" />
              <h3 className="mt-4 font-heading font-semibold text-[18px] text-charcoal">
                {guide.title}
              </h3>
              <p className="mt-2 font-body text-[14px] text-warm-gray leading-relaxed">
                {guide.description}
              </p>
              <Link
                to={guide.link}
                className="mt-3 inline-block font-body font-medium text-[14px] text-horizon-blue no-underline hover:underline"
              >
                Read Guide <ArrowRight className="inline h-3.5 w-3.5 ml-1 align-[-2px]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewToIsrael;
