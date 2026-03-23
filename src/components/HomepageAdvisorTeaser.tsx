import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Compass } from "lucide-react";

const TEASER_PROMPTS = [
  "We're making aliyah with kids — where should we look?",
  "Best areas for a young tech professional?",
  "Religious Anglo community on a budget?",
];

const HomepageAdvisorTeaser = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const handleClick = (prompt: string) => {
    navigate(`/advisor?q=${encodeURIComponent(prompt)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    navigate(`/advisor?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      className="relative py-[78px] md:py-[101px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(124,139,110,0.10) 0%, rgba(124,139,110,0.03) 60%, #FAF8F5 100%), linear-gradient(180deg, rgba(196,169,106,0.06) 0%, rgba(242,237,228,0.03) 40%, #FAF8F5 100%)",
      }}
    >
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(124,139,110,0.18) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 container max-w-[720px] text-center">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33]">
          AI-Powered
        </span>
        <h2 className="mt-1 font-heading font-bold text-[24px] md:text-[28px] text-charcoal">
          Ask our AI advisor about any city in Israel
        </h2>
        <p className="mt-4 font-body text-[16px] text-warm-gray leading-relaxed">
          Describe your situation — budget, family size, lifestyle — and get personalized city recommendations based on real data.
        </p>

        {/* Chat bubble mockup */}
        <div className="mt-8 max-w-sm mx-auto flex flex-col gap-3">
          {/* User message */}
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-sage text-white px-4 py-3 rounded-2xl rounded-br-sm font-body text-[14px] text-left max-w-[240px] shadow-card">
              Making aliyah with 2 kids, budget ~3.5M?
            </div>
          </div>
          {/* AI response */}
          <div className="flex items-start gap-2 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-sage/15 flex items-center justify-center mt-0.5">
              <Compass className="w-3.5 h-3.5 text-sage" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm font-body text-[14px] text-charcoal text-left max-w-[260px] shadow-[0_2px_12px_rgba(45,50,52,0.08)] border border-sage/10">
              Based on your budget and family size, I'd recommend{" "}
              <span className="text-horizon-blue font-semibold">Modi'in</span> or{" "}
              <span className="text-horizon-blue font-semibold">Beit Shemesh</span>
              &hellip;
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEASER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleClick(prompt)}
              className="px-5 py-3 bg-white border border-grid-line rounded-full font-body text-[15px] text-charcoal hover:border-sage hover:text-sage hover:shadow-card transition-all duration-200 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your own question..."
            className="flex-1 h-12 px-4 border border-border-light bg-white rounded-xl font-body text-[15px] text-charcoal placeholder:text-warm-gray focus:border-sage transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="h-12 w-12 flex items-center justify-center rounded-xl bg-sage text-white hover:bg-sage/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
            aria-label="Send question"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default HomepageAdvisorTeaser;
