import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

const navLinks = [
  { label: "Cities", href: "/#explore-cities" },
  { label: "Market Data", href: "/market" },
  { label: "Guides", href: "/guides" },
  { label: "Resources", href: "/resources" },
];

const currencies = ["₪", "$", "€"] as const;

const NavBar = () => {
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-warm-white border-b border-grid-line">
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-2xl text-charcoal no-underline hover:no-underline">
          Navlan
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className="font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage hover:no-underline transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage hover:no-underline transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-cream rounded-full p-0.5">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-body font-medium transition-colors",
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
            className="md:hidden p-1 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-warm-white border-b border-grid-line px-6 py-4 space-y-3">
          {navLinks.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className="block font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block font-body font-medium text-[15px] text-charcoal no-underline hover:text-sage"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
