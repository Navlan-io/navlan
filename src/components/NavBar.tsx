import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface NavLink {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const navLinks: NavLink[] = [
  { label: "Cities", href: "/cities" },
  { label: "Advisor", href: "/advisor" },
  { label: "Market Data", href: "/market" },
  {
    label: "Calculators",
    children: [
      { label: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
      { label: "Madad Calculator", href: "/tools/madad-calculator" },
    ],
  },
  { label: "Guides", href: "/guides" },
];

const currencies = ["₪", "$", "€"] as const;
const currencyLabels: Record<string, string> = {
  "₪": "Switch to Israeli Shekel",
  "$": "Switch to US Dollar",
  "€": "Switch to Euro",
};

const NavBar = () => {
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
    setMobileDropdownOpen(false);
  }, [location.pathname]);

  const isCalcActive = location.pathname.startsWith("/tools/");

  return (
    <nav className="sticky top-0 z-50 h-14 md:h-16 bg-warm-white border-b border-grid-line">
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-2xl text-charcoal no-underline hover:no-underline">
          Navlan
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1 font-body font-medium text-[15px] no-underline hover:text-sage transition-colors ${
                      isCalcActive ? "text-sage" : "text-charcoal"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-warm-white border border-grid-line rounded-lg shadow-lg py-1 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block px-4 py-2.5 font-body text-[14px] no-underline hover:bg-cream transition-colors ${
                            location.pathname === child.href ? "text-sage font-medium" : "text-charcoal"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname.startsWith(link.href!);
            return (
              <Link
                key={link.label}
                to={link.href!}
                className={`font-body font-medium text-[15px] no-underline hover:text-sage hover:no-underline transition-colors ${isActive ? 'text-sage' : 'text-charcoal'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-cream rounded-full p-0.5">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                aria-label={currencyLabels[c]}
                aria-pressed={currency === c}
                className={cn(
                  "px-3 py-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-sm font-body font-medium transition-colors",
                  currency === c
                    ? "bg-sage text-white"
                    : "text-charcoal hover:bg-sage/10"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-warm-white border-b border-grid-line px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label}>
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full min-h-[44px] flex items-center justify-between font-body font-medium text-[15px] text-charcoal"
                  >
                    {link.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", mobileDropdownOpen && "rotate-180")} />
                  </button>
                  {mobileDropdownOpen && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block min-h-[44px] flex items-center font-body text-[14px] no-underline hover:text-sage ${
                            location.pathname === child.href ? "text-sage font-medium" : "text-charcoal"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.href!}
                onClick={() => setMobileOpen(false)}
                className="block min-h-[44px] flex items-center font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
