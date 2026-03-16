import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const guides = [
  {
    title: "How Israeli Real Estate Works",
    description:
      "The purchase process, costs, mortgages, and common mistakes — explained for English speakers.",
    link: "/guides/start-here",
  },
  {
    title: "Dira BeHanacha: Subsidized Housing",
    description:
      "Israel's government housing program — eligibility, how to apply, and what to expect.",
    link: "/guides/dira-behanacha",
  },
];

const NewToIsrael = () => {
  return (
    <section className="py-14 md:py-20 bg-warm-white">
      <div className="container max-w-[720px]">
        <h2 className="font-heading font-semibold text-[24px] text-charcoal">
          New to Israel?
        </h2>
        <p className="mt-1 font-body text-[15px] text-warm-gray">
          Essential guides for English-speaking property buyers
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              to={guide.link}
              className="group flex items-start gap-4 py-4 border-b border-grid-line no-underline hover:no-underline last:border-b-0"
            >
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-[17px] text-charcoal group-hover:text-horizon-blue transition-colors">
                  {guide.title}
                </h3>
                <p className="mt-1 font-body text-[14px] text-warm-gray leading-relaxed">
                  {guide.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-warm-gray group-hover:text-horizon-blue group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewToIsrael;
