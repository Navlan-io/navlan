import { Card } from "@/components/ui/card";
import ProfileMarkdown from "./ProfileMarkdown";

interface CommunityTabProps {
  city: { english_name: string };
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
    );
  }

  return (
    <div className="max-w-[720px] space-y-8">
      <div className="bg-cream rounded-lg px-5 py-4">
        <p className="font-body text-[13px] text-warm-gray leading-relaxed">
          Price ranges mentioned below are approximate editorial estimates and may be outdated. See the{" "}
          <button
            onClick={() => onSwitchTab?.("Trends")}
            className="text-horizon-blue hover:underline font-medium"
          >
            Trends tab
          </button>{" "}
          for current market data.
        </p>
      </div>
      {sections.map(({ key, title }) => {
        const content = profile?.[key];
        if (!content) return null;
        return (
          <div key={key}>
            <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-3">{title}</h3>
            <ProfileMarkdown content={content} />
          </div>
        );
      })}
    </div>
  );
};

export default CommunityTab;
