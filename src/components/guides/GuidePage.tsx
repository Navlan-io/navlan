import { useEffect, useState, useRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export interface GuideSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface RelatedCard {
  label: string;
  to: string;
}

interface BottomNav {
  prev?: { label: string; to: string };
  next?: { label: string; to: string };
}

interface GuidePageProps {
  title: string;
  subtitle: string;
  date: string;
  metaDescription: string;
  sections: GuideSection[];
  bottomNav: BottomNav;
  related: RelatedCard[];
  headerContent?: ReactNode;
}

const GuidePage = ({
  title,
  subtitle,
  date,
  metaDescription,
  sections,
  bottomNav,
  related,
  headerContent,
}: GuidePageProps) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    document.title = `${title} | Navlan.io`;
    // Set meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaDescription);
    window.scrollTo(0, 0);
  }, [title, metaDescription]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
    }
  };

  const TOCItems = () => (
    <nav className="space-y-1">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className={cn(
            "block w-full text-left px-3 py-1.5 font-body text-[14px] rounded transition-colors border-l-2",
            activeSection === s.id
              ? "text-charcoal border-sage font-medium"
              : "text-warm-gray border-transparent hover:text-charcoal hover:border-grid-line"
          )}
        >
          {s.title}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[1040px] pt-12 pb-16">
          {/* Header */}
          <Link
            to="/guides/start-here"
            className="inline-flex items-center font-body font-medium text-[14px] text-horizon-blue no-underline hover:underline mb-6"
          >
            ← Guides
          </Link>
          <h1 className="font-heading font-bold text-[26px] md:text-[32px] text-charcoal leading-tight">
            {title}
          </h1>
          <p className="mt-3 font-body text-[16px] text-warm-gray max-w-[600px] leading-relaxed">
            {subtitle}
          </p>
          <p className="mt-2 font-body text-[13px] text-warm-gray">{date}</p>
          <div className="border-b border-grid-line mt-6 mb-8" />

          {headerContent}

          {/* Mobile TOC */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between bg-cream rounded-lg px-4 py-3 font-body font-medium text-[15px] text-charcoal"
            >
              Table of Contents
              {tocOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {tocOpen && (
              <div className="bg-cream rounded-b-lg px-2 pb-3 -mt-1">
                <TOCItems />
              </div>
            )}
          </div>

          {/* Content + Desktop TOC */}
          <div className="flex gap-10">
            {/* Main content */}
            <div className="flex-1 min-w-0 max-w-[720px]">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(section.id, el);
                  }}
                  className="scroll-mt-24"
                >
                  <h2 className="font-heading font-semibold text-[22px] text-charcoal mt-10 mb-4 first:mt-0">
                    {section.title}
                  </h2>
                  <div className="guide-content font-body text-[16px] text-charcoal leading-[1.75]">
                    {section.content}
                  </div>
                </section>
              ))}

              {/* Bottom navigation */}
              <div className="mt-16 bg-cream rounded-xl p-6 flex items-center justify-between">
                {bottomNav.prev ? (
                  <Link
                    to={bottomNav.prev.to}
                    className="font-body font-medium text-[15px] text-horizon-blue no-underline hover:underline"
                  >
                    ← {bottomNav.prev.label}
                  </Link>
                ) : (
                  <div />
                )}
                {bottomNav.next ? (
                  <Link
                    to={bottomNav.next.to}
                    className="font-body font-medium text-[15px] text-horizon-blue no-underline hover:underline"
                  >
                    {bottomNav.next.label} →
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* Related */}
              <div className="mt-10">
                <h3 className="font-heading font-semibold text-[18px] text-charcoal mb-4">Related</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.to}
                      to={r.to}
                      className="block bg-cream rounded-xl p-5 font-body font-medium text-[15px] text-charcoal no-underline hover:shadow-card hover:-translate-y-0.5 transition-all"
                    >
                      {r.label} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block w-[220px] flex-shrink-0">
              <div className="sticky top-24">
                <p className="font-body font-semibold text-[13px] text-warm-gray uppercase tracking-wider mb-3 px-3">
                  On this page
                </p>
                <TOCItems />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuidePage;
