import { useNavigate } from "react-router-dom";

const TEASER_PROMPTS = [
  "We're making aliyah with kids — where should we look?",
  "Best areas for a young tech professional?",
  "Religious Anglo community on a budget?",
];

const HomepageAdvisorTeaser = () => {
  const navigate = useNavigate();

  const handleClick = (prompt: string) => {
    navigate(`/advisor?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <section className="py-16 md:py-20 border-t border-border-light">
      <div className="container max-w-[640px] text-center">
        <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal">
          Not sure where to start?
        </h2>
        <p className="mt-4 font-body text-[16px] text-warm-gray leading-relaxed">
          Tell us about your situation and our AI advisor will suggest cities and
          neighborhoods that match your needs.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEASER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleClick(prompt)}
              className="px-4 py-2.5 bg-white border border-grid-line rounded-full font-body text-[14px] text-charcoal hover:border-sage hover:text-sage transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageAdvisorTeaser;
