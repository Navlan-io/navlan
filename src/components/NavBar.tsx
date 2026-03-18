import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

const navLinks = [
  { label: "Cities", href: "/cities" },
  { label: "Advisor", href: "/advisor" },
  { label: "Market Data", href: "/market" },
  { label: "Guides", href: "/guides" },
];

const currencies = ["₪", "$", "€"] as const;

const NavBar = () => {
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 h-14 md:h-16 bg-warm-white border-b border-grid-line">
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-2xl text-charcoal no-underline hover:no-underline">
          Navlan
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                to={link.href}
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
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-warm-white border-b border-grid-line px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block min-h-[44px] flex items-center font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
