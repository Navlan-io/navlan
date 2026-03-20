const TIER_CONFIG: Record<string, { label: string; dotColor: string; hex: string }> = {
  premium: { label: "Premium", dotColor: "bg-sand-gold", hex: "#C4A96A" },
  above_average: { label: "Above Average", dotColor: "bg-horizon-blue", hex: "#4A7F8B" },
  moderate: { label: "Moderate", dotColor: "bg-sage", hex: "#7C8B6E" },
  affordable: { label: "Affordable", dotColor: "bg-growth-green", hex: "#5B8C5A" },
  budget: { label: "Budget", dotColor: "bg-[#9CA3A8]", hex: "#9CA3A8" },
};

export function getTierConfig(tier: string | null) {
  if (!tier) return null;
  return TIER_CONFIG[tier] ?? null;
}

interface AffordabilityBadgeProps {
  tier: string | null;
  size?: "sm" | "md";
}

export default function AffordabilityBadge({ tier, size = "sm" }: AffordabilityBadgeProps) {
  const config = getTierConfig(tier);
  if (!config) return null;

  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const textSize = size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} font-body text-warm-gray`}>
      <span className={`${dotSize} rounded-full ${config.dotColor} shrink-0`} />
      {config.label}
    </span>
  );
}
