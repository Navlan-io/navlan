import { Card } from "@/components/ui/card";

interface CostOfLivingTabProps {
  city: { english_name: string };
  profile: { costs_of_living: string | null } | null;
}

const CostOfLivingTab = ({ city, profile }: CostOfLivingTabProps) => {
  const content = profile?.costs_of_living;

  return (
    <div className="max-w-[720px] space-y-8">
      {content ? (
        <div>
          <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-3">Cost of Living</h3>
          <p className="font-body text-[15px] text-charcoal leading-[1.7]">{content}</p>
        </div>
      ) : (
        <p className="font-body text-warm-gray">Cost of living information coming soon.</p>
      )}

      <Card className="p-5 bg-cream border-0">
        <p className="font-body text-[14px] text-charcoal">
          For personalized budgeting and financial planning, visit{" "}
          <a
            href="https://bluewhitefinance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-horizon-blue hover:underline"
          >
            Blue & White Finance
          </a>
        </p>
      </Card>
    </div>
  );
};

export default CostOfLivingTab;
