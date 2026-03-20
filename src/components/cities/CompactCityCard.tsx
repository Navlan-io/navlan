import { Link } from "react-router-dom";
import AffordabilityBadge, { getTierConfig } from "./AffordabilityBadge";

interface CompactCityCardProps {
  name: string;
  slug: string;
  district: string;
  tagline: string | null;
  tier: string | null;
}

export default function CompactCityCard({
  name,
  slug,
  district,
  tagline,
  tier,
}: CompactCityCardProps) {
  const tierConfig = getTierConfig(tier);
  const borderColor = tierConfig?.hex ?? "#7C8B6E";

  return (
    <Link
      to={`/city/${slug}`}
      className="group flex flex-col rounded-xl bg-cream border border-[#e8e3da] p-4 no-underline shadow-[0_1px_4px_rgba(45,50,52,0.06)] hover:shadow-[0_4px_16px_rgba(45,50,52,0.1)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.72rem)]"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-body font-semibold text-[15px] text-charcoal leading-tight truncate">
            {name}
          </h3>
          <p className="mt-0.5 font-body text-[11px] text-warm-gray">
            {district}
          </p>
        </div>
        <AffordabilityBadge tier={tier} size="sm" />
      </div>

      {tagline && (
        <p className="mt-1.5 font-body text-[13px] text-warm-gray leading-snug line-clamp-1">
          {tagline}
        </p>
      )}

      <div className="mt-auto pt-2 flex items-end justify-end">
        <span className="font-body font-medium text-[13px] text-sage group-hover:text-sage-dark transition-colors">
          Explore →
        </span>
      </div>
    </Link>
  );
}
