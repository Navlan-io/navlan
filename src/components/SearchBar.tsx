import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Locality {
  english_name: string;
  hebrew_name: string | null;
  district: string;
  entity_type: string | null;
  parent_city: string | null;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const entityOrder: Record<string, number> = { city: 0, town: 1, neighborhood: 2 };

interface SearchBarProps {
  className?: string;
  compact?: boolean;
}

const SearchBar = ({ className, compact }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Locality[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const listboxId = "search-listbox";

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("localities")
          .select("english_name, hebrew_name, district, entity_type, parent_city")
          .or(
            `english_name.ilike.%${query}%,english_alt_spellings.ilike.%${query}%,hebrew_name.ilike.%${query}%`
          )
          .limit(8);

        if (data) {
          const sorted = [...data].sort((a, b) => {
            const aOrder = entityOrder[a.entity_type ?? ""] ?? 3;
            const bOrder = entityOrder[b.entity_type ?? ""] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.english_name.localeCompare(b.english_name);
          });
          setResults(sorted);
        } else {
          setResults([]);
        }
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && results.length > 0) {
        setOpen(true);
      }
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open && results.length > 0) {
        setOpen(true);
      }
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    }
  };

  const handleSelect = useCallback(
    (loc: Locality) => {
      const targetName =
        loc.entity_type === "neighborhood" && loc.parent_city
          ? loc.parent_city
          : loc.english_name;
      const slug = toSlug(targetName);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      navigate(`/city/${slug}`);
    },
    [navigate]
  );

  const handleBrowse = () => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById("explore-cities")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("explore-cities")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const showDropdown = open && query.length >= 2;
  const activeOptionId = activeIndex >= 0 ? `search-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn("relative w-full", compact ? "max-w-[240px]" : "max-w-xl mx-auto", className)}>
      <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray", compact ? "h-4 w-4 left-3" : "h-5 w-5")} aria-hidden="true" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && results.length >= 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={compact ? "Search cities..." : "Search any city or neighborhood"}
        role="combobox"
        aria-expanded={showDropdown && results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-label="Search cities and neighborhoods"
        className={cn(
          "w-full pl-12 pr-4 border border-border-light bg-white text-charcoal font-body placeholder:text-warm-gray focus:outline-none focus:border-sage transition-colors",
          compact ? "h-9 pl-9 text-[13px] rounded-lg" : "h-12 md:h-[52px] text-[15px] md:text-[15px] rounded-xl",
          open && results.length > 0 ? "rounded-b-none" : ""
        )}
      />

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full bg-white border border-t-0 border-border-light rounded-b-xl shadow-[0_4px_12px_rgba(45,50,52,0.1)] z-50 overflow-hidden"
        >
          {results.length === 0 ? (
            <div className="px-4 py-3 font-body text-[14px] text-warm-gray">
              No cities found. Try a different spelling or{" "}
              <button onClick={handleBrowse} className="text-horizon-blue hover:underline">
                browse all cities
              </button>
              .
            </div>
          ) : (
            results.map((loc, i) => (
              <button
                key={`${loc.english_name}-${i}`}
                id={`search-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleSelect(loc)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cream cursor-pointer transition-colors",
                  i < results.length - 1 && "border-b border-border-light",
                  i === activeIndex && "bg-cream"
                )}
              >
                <span className="font-body font-semibold text-[15px] text-charcoal">
                  {loc.english_name}
                </span>
                <span className="font-body text-[13px] text-warm-gray">
                  {loc.entity_type === "neighborhood" && loc.parent_city
                    ? `${loc.parent_city} · Neighborhood`
                    : `${loc.district} District · ${loc.entity_type === "city" ? "City" : loc.entity_type === "town" ? "Town" : loc.entity_type ?? ""}`}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
