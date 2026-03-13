import ProfileMarkdown from "./ProfileMarkdown";

interface GettingAroundTabProps {
  city: { english_name: string };
  profile: { transportation: string | null } | null;
}

const GettingAroundTab = ({ city, profile }: GettingAroundTabProps) => {
  const content = profile?.transportation;

  return (
    <div className="max-w-[720px]">
      {content ? (
        <div>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-3">Getting Around</h3>
          <ProfileMarkdown content={content} />
        </div>
      ) : (
        <p className="font-body text-warm-gray">Transportation information coming soon.</p>
      )}
    </div>
  );
};

export default GettingAroundTab;
