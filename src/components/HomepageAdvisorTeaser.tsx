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
    <section className="py-20 md:py-24 bg-cream/50 border-t border-border-light">
      <div className="container max-w-[720px] text-center">
        <h2 className="font-heading font-bold text-[24px] md:text-[28px] text-charcoal">
          Ask our AI advisor about any city in Israel
        </h2>
        <p className="mt-4 font-body text-[16px] text-warm-gray leading-relaxed">
          Describe your situation — budget, family size, lifestyle — and get personalized city recommendations based on real data.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEASER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleClick(prompt)}
              className="px-5 py-3 bg-white border border-grid-line rounded-full font-body text-[15px] text-charcoal hover:border-sage hover:text-sage transition-colors text-left"
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
