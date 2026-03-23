interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
}

export const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "All Cities" },
  { key: "anglo", label: "Strong Anglo Community" },
  { key: "budget", label: "Budget-Friendly" },
  { key: "telaviv", label: "Near Tel Aviv" },
  { key: "jerusalem", label: "Near Jerusalem" },
  { key: "coastal", label: "Coastal Living" },
  { key: "religious", label: "Religious Communities" },
];

// Tag key mapping: category key → tag name in city_profiles.tags
const CATEGORY_TAG_MAP: Record<string, string> = {
  anglo: "anglo_community",
  telaviv: "near_tel_aviv",
  jerusalem: "near_jerusalem",
  coastal: "coastal",
  religious: "religious",
};

export function matchesCategory(
  tags: string[] | null,
  tier: string | null,
  category: string
): boolean {
  if (category === "all") return true;

  if (category === "budget") {
    return tier === "affordable" || tier === "budget";
  }

  const tagKey = CATEGORY_TAG_MAP[category];
  if (tagKey) {
    return (tags || []).includes(tagKey);
  }

  return true;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            aria-pressed={active === cat.key}
            className={`whitespace-nowrap rounded-full px-4 py-2 min-h-[36px] font-body text-[13px] font-medium border transition-colors shrink-0 ${
              active === cat.key
                ? "bg-charcoal text-white border-charcoal"
                : "bg-transparent text-charcoal border-charcoal/20 hover:border-charcoal/40 hover:bg-charcoal/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-warm-white to-transparent md:hidden" />
    </div>
  );
}
