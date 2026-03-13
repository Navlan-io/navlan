import { Card } from "@/components/ui/card";

interface CommunityTabProps {
  city: { english_name: string };
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

const CommunityTab = ({ city, profile }: CommunityTabProps) => {
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
      {sections.map(({ key, title }) => {
        const content = profile?.[key];
        if (!content) return null;
        return (
          <div key={key}>
            <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-3">{title}</h3>
            <p className="font-body text-[15px] text-charcoal leading-[1.7]">{content}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CommunityTab;
