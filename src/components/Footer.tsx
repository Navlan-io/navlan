import { Link } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";

const quickLinks = [
  { label: "About", to: "/about" },
  { label: "Start Here", to: "/guides/start-here" },
  { label: "Provider Directory", to: "/providers" },
  { label: "For Providers", to: "/providers/join" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Footer = () => {
  return (
    <footer className="relative bg-charcoal text-white overflow-hidden">
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left */}
          <div>
            <Link to="/" className="font-heading font-bold text-2xl text-white no-underline hover:no-underline">
              Navlan
            </Link>
            <p className="mt-2 text-white/70 font-body text-[15px]">
              Navigate Israeli Real Estate. In English.
            </p>
          </div>

          {/* Center */}
          <div>
            <h4 className="font-heading font-semibold text-[15px] text-white mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-body text-[14px] text-white/70 hover:text-white no-underline transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <h4 className="font-heading font-semibold text-[15px] text-white mb-4">Free monthly market briefing — in English</h4>
            <NewsletterSignup source="footer" variant="dark" />
            <p className="mt-2 text-white/50 font-body text-[12px]">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="container py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-warm-gray font-body text-[12px] text-center md:text-left">
            Data sourced from Israel Central Bureau of Statistics, Bank of Israel, and Israel Tax Authority
          </p>
          <p className="text-warm-gray font-body text-[12px]">
            © 2026 Navlan.io
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
