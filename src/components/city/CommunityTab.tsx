import { Card } from "@/components/ui/card";
import ProfileMarkdown from "./ProfileMarkdown";
import InlineNewsletterCTA from "@/components/ui/InlineNewsletterCTA";
import { Link } from "react-router-dom";

interface CommunityTabProps {
  city: { english_name: string; district: string };
  onSwitchTab?: (tab: string) => void;
  profile: {
    overview: string | null;
    anglo_community: string | null;
    religious_infrastructure: string | null;
    education: string | null;
    lifestyle: string | null;
    real_estate_character: string | null;
    who_best_for: string | null;
    what_to_know: string | null;
  } | null;
}

const sections = [
  { key: "overview", title: "Overview" },
  { key: "anglo_community", title: "Anglo Community" },
  { key: "religious_infrastructure", title: "Religious Life" },
  { key: "education", title: "Education" },
  { key: "lifestyle", title: "Lifestyle & Amenities" },
  { key: "real_estate_character", title: "Real Estate Character" },
  { key: "who_best_for", title: "Who It's Best For" },
  { key: "what_to_know", title: "What to Know" },
] as const;

const CommunityTab = ({ city, profile, onSwitchTab }: CommunityTabProps) => {
  const hasContent = profile && sections.some((s) => profile[s.key]);

  if (!hasContent) {
    return (
      <div className="container max-w-[1200px] py-8 md:py-10">
        <Card className="p-8 bg-cream border-0 text-center max-w-2xl mx-auto">
          <p className="font-body text-charcoal">
            Community profile for {city.english_name} is coming soon.
          </p>
          <p className="font-body text-[14px] text-warm-gray mt-2">
            Have local knowledge? We'd love your input.{" "}
            <a href="mailto:hello@navlan.io" className="text-horizon-blue hover:underline">
              hello@navlan.io
            </a>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-[1200px] py-8 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 max-w-[720px] space-y-8">
          {/* Editorial disclaimer */}
          <div className="bg-cream rounded-lg px-5 py-4">
            <p className="font-body text-[13px] text-warm-gray leading-relaxed">
              Community profiles are editorial and based on publicly available information. Prices mentioned may be approximate — see the{" "}
              <button
                onClick={() => onSwitchTab?.("Trends")}
                className="text-horizon-blue hover:underline font-medium"
              >
                Trends tab
              </button>{" "}
              for current CBS data.
            </p>
          </div>

          {/* Profile sections */}
          {sections.map(({ key, title }) => {
            const content = profile?.[key];
            if (!content) return null;
            return (
              <div key={key}>
                <h2 className="font-heading font-semibold text-[18px] text-charcoal mb-3">{title}</h2>
                <ProfileMarkdown content={content} />
              </div>
            );
          })}

          <InlineNewsletterCTA source="city" />
        </div>

        {/* Quick facts sidebar — visible on lg+ */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-32 space-y-5">
            <Card className="p-5 bg-cream border-0 shadow-card">
              <h4 className="font-heading font-semibold text-[15px] text-charcoal mb-3">Quick Facts</h4>
              <ul className="space-y-3 font-body text-[14px]">
                <li className="flex justify-between">
                  <span className="text-warm-gray">District</span>
                  <span className="text-charcoal font-medium">{city.district}</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-grid-line space-y-2">
                <button
                  onClick={() => onSwitchTab?.("Trends")}
                  className="block w-full text-left font-body text-[14px] text-horizon-blue hover:underline font-medium"
                >
                  View Price Trends →
                </button>
                <Link
                  to="/advisor"
                  className="block w-full text-left font-body text-[14px] text-horizon-blue hover:underline font-medium no-underline"
                >
                  Ask the AI Advisor →
                </Link>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityTab;
