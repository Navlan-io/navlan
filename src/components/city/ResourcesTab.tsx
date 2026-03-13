import { Card } from "@/components/ui/card";

interface ResourcesTabProps {
  city: { english_name: string };
}

const ResourcesTab = ({ city }: ResourcesTabProps) => {
  return (
    <div className="max-w-[720px] space-y-8">
      <h3 className="font-heading font-semibold text-[18px] text-charcoal">
        Resources for {city.english_name}
      </h3>

      <ul className="space-y-3">
        <li className="font-body text-[15px]">
          <a
            href="https://www.nbn.org.il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-horizon-blue hover:underline"
          >
            Nefesh B'Nefesh City Guide
          </a>
        </li>
        <li className="font-body text-[15px] text-charcoal">
          <span className="text-charcoal">Municipal Website</span>{" "}
          <span className="text-warm-gray text-[13px]">— Link coming soon</span>
        </li>
        <li className="font-body text-[15px] text-charcoal">
          <span className="text-charcoal">Local Anglo Facebook Groups</span>{" "}
          <span className="text-warm-gray text-[13px]">— Directory coming soon</span>
        </li>
      </ul>

      <Card className="p-5 bg-cream border-0">
        <p className="font-body text-[14px] text-charcoal">
          Know a great resource for {city.english_name}? Let us know at{" "}
          <a href="mailto:hello@navlan.io" className="text-horizon-blue hover:underline">
            hello@navlan.io
          </a>
        </p>
      </Card>

      <p className="font-body text-[14px] text-warm-gray italic">
        Looking for an English-speaking real estate professional? Our directory is coming soon.
      </p>
    </div>
  );
};

export default ResourcesTab;
