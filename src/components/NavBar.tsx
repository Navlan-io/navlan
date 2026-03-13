import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Cities", href: "#" },
  { label: "Market Data", href: "#" },
  { label: "Guides", href: "#" },
  { label: "Resources", href: "#" },
];

const currencies = ["₪", "$", "€"] as const;

const NavBar = () => {
  const [activeCurrency, setActiveCurrency] = useState<string>("₪");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-16 bg-warm-white border-b border-grid-line">
      <div className="container h-full flex items-center justify-between">
        {/* Logo */}
        <span className="font-heading font-bold text-2xl text-charcoal">Navlan</span>

        {/* Center links - desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage hover:no-underline transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Currency toggle + mobile menu */}
        <div className="flex items-center gap-3">
          {/* Currency toggle */}
          <div className="flex items-center bg-cream rounded-full p-0.5">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCurrency(c)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-body font-medium transition-colors",
                  activeCurrency === c
                    ? "bg-sage text-white"
                    : "text-charcoal hover:bg-sage/10"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-warm-white border-b border-grid-line px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
