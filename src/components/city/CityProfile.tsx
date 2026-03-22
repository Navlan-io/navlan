import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProfileMarkdown from "./ProfileMarkdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface CityProfileProps {
  city: { english_name: string; district: string };
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

const SECTION_DEFS = [
  { key: "overview", id: "section-overview", title: "Overview" },
  { key: "anglo_community", id: "section-anglo-community", title: "Anglo Community" },
  { key: "religious_infrastructure", id: "section-religious-life", title: "Religious Life" },
  { key: "education", id: "section-education", title: "Education" },
  { key: "lifestyle", id: "section-lifestyle", title: "Lifestyle & Amenities" },
  { key: "real_estate_character", id: "section-real-estate-character", title: "Real Estate Character" },
  { key: "who_best_for", id: "section-who-best-for", title: "Who It's Best For" },
  { key: "what_to_know", id: "section-what-to-know", title: "What to Know" },
] as const;

type ProfileKey = (typeof SECTION_DEFS)[number]["key"];

const MARKET_DATA_ID = "section-market-data";

const CityProfile = ({ city, profile }: CityProfileProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hasContent = profile && SECTION_DEFS.some((s) => profile[s.key]);

  // Filter to only sections with content
  const activeSections = SECTION_DEFS.filter((s) => profile?.[s.key]);

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
    <div>
      {/* Dual layout: Desktop TOC + content | Mobile accordion */}
      {isDesktop ? (
        <DesktopLayout sections={activeSections} profile={profile!} />
      ) : (
        <AccordionLayout sections={activeSections} profile={profile!} />
      )}

      {/* Editorial disclaimer — after content */}
      <div className="bg-cream rounded-lg px-5 py-4 border border-grid-line/40 mt-8">
        <p className="font-body text-[13px] text-warm-gray leading-relaxed">
          Community profiles are editorial and based on publicly available information. Prices
          mentioned may be approximate — see the data sections above for current CBS figures.
        </p>
      </div>
    </div>
  );
};

/* ─── Desktop: Sticky TOC sidebar + all sections visible ─── */

function DesktopLayout({
  sections,
  profile,
}: {
  sections: typeof SECTION_DEFS extends readonly (infer T)[] ? T[] : never;
  profile: NonNullable<CityProfileProps["profile"]>;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));

    // Also observe the external Market Data section
    const marketEl = document.getElementById(MARKET_DATA_ID);
    if (marketEl) observer.observe(marketEl);

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-10">
      {/* TOC sidebar */}
      <aside className="hidden lg:block w-[200px] flex-shrink-0 overflow-visible">
        <div className="sticky top-24 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={cn(
                "block w-full text-left px-3 py-1.5 font-body text-[14px] rounded transition-colors border-l-2",
                activeId === s.id
                  ? "text-charcoal border-sage font-medium"
                  : "text-warm-gray border-transparent hover:text-charcoal hover:border-grid-line"
              )}
            >
              {s.title}
            </button>
          ))}
          <button
            onClick={() => scrollTo(MARKET_DATA_ID)}
            className={cn(
              "block w-full text-left px-3 py-1.5 font-body text-[14px] rounded transition-colors border-l-2",
              activeId === MARKET_DATA_ID
                ? "text-charcoal border-sage font-medium"
                : "text-warm-gray border-transparent hover:text-charcoal hover:border-grid-line"
            )}
          >
            Price Trends & Data
          </button>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 min-w-0 space-y-8">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(s.id, el);
            }}
            className="scroll-mt-24"
          >
            <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-3">
              {s.title}
            </h3>
            <ProfileMarkdown content={profile[s.key]!} />
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─── Mobile: Accordion ─── */

function AccordionLayout({
  sections,
  profile,
}: {
  sections: typeof SECTION_DEFS extends readonly (infer T)[] ? T[] : never;
  profile: NonNullable<CityProfileProps["profile"]>;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["section-overview"]));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="divide-y divide-cream">
      {sections.map((s) => {
        const isOpen = open.has(s.id);
        return (
          <div key={s.id}>
            <button
              onClick={() => toggle(s.id)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-body font-semibold text-[16px] text-charcoal">
                {s.title}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-warm-gray flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-warm-gray flex-shrink-0" />
              )}
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[5000px] opacity-100 pb-6" : "max-h-0 opacity-0"
              )}
            >
              <ProfileMarkdown content={profile[s.key]!} />
            </div>
          </div>
        );
      })}
      {/* Link to Market Data section */}
      <div>
        <button
          onClick={() => scrollTo(MARKET_DATA_ID)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <span className="font-body font-semibold text-[16px] text-charcoal">
            Price Trends & Data
          </span>
          <ChevronRight className="h-4 w-4 text-warm-gray flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default CityProfile;
