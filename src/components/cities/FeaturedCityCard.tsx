import { Link } from "react-router-dom";
import AffordabilityBadge, { getTierConfig } from "./AffordabilityBadge";

interface FeaturedCityCardProps {
  name: string;
  slug: string;
  district: string;
  tagline: string | null;
  tier: string | null;
  price: string | null;
  isHovered?: boolean;
  onHover?: (slug: string | null) => void;
}

export default function FeaturedCityCard({
  name,
  slug,
  district,
  tagline,
  tier,
  price,
  isHovered,
  onHover,
}: FeaturedCityCardProps) {
  const tierConfig = getTierConfig(tier);
  const borderColor = tierConfig?.hex ?? "#7C8B6E";

  return (
    <Link
      to={`/city/${slug}`}
      className={`group relative flex flex-col rounded-xl bg-cream p-4 no-underline transition-all duration-200 cursor-pointer overflow-hidden ${
        isHovered
          ? "shadow-[0_6px_20px_rgba(45,50,52,0.13)] -translate-y-0.5"
          : "shadow-[0_1px_6px_rgba(45,50,52,0.08)] hover:shadow-[0_6px_20px_rgba(45,50,52,0.13)] hover:-translate-y-0.5"
      }`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onMouseEnter={() => onHover?.(slug)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-body font-semibold text-[16px] text-charcoal leading-tight truncate">
            {name}
          </h3>
          <p className="mt-0.5 font-body text-[11px] text-warm-gray">
            {district}
          </p>
        </div>
        {price && (
          <span className="shrink-0 font-body text-[14px] font-semibold text-charcoal whitespace-nowrap">
            {price}
          </span>
        )}
      </div>

      {tagline && (
        <p className="mt-1.5 font-body text-[13px] text-warm-gray leading-snug line-clamp-2">
          {tagline}
        </p>
      )}

      <div className="mt-auto pt-2 flex items-center justify-between">
        <AffordabilityBadge tier={tier} size="sm" />
        <span className="font-body font-medium text-[13px] text-sage group-hover:text-sage-dark transition-colors">
          Explore →
        </span>
      </div>
    </Link>
  );
}
