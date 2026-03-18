import { Link } from "react-router-dom";
import { BookOpen, Home, KeyRound, Scale, Building2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import type { LucideIcon } from "lucide-react";

interface GuideCardData {
  icon: LucideIcon;
  title: string;
  description: string;
  updated: string;
  readTime: string;
  to: string;
}

const guides: GuideCardData[] = [
  {
    icon: BookOpen,
    title: "Buying Property in Israel: A Guide for English Speakers",
    description: "Everything you need to know about the Israeli real estate market — the purchase process, costs, mortgages, and common pitfalls.",
    updated: "Last updated: March 2026",
    readTime: "~18 min read",
    to: "/guides/start-here",
  },
  {
    icon: Home,
    title: "Dira BeHanacha: Israel's Subsidized Housing Program",
    description: "The most complete English-language guide to Israel's government housing lottery — eligibility, how to apply, and what to expect.",
    updated: "Last updated: March 2026",
    readTime: "~20 min read",
    to: "/guides/dira-behanacha",
  },
  {
    icon: KeyRound,
    title: "Israeli Mortgages Explained",
    description: "Tracks, rates, olim benefits, and the approval process — everything English speakers need to know about the mashkanta.",
    updated: "Last updated: March 2026",
    readTime: "~25 min read",
    to: "/guides/mortgages",
  },
  {
    icon: Scale,
    title: "Israel Purchase Tax (Mas Rechisha)",
    description: "Tax brackets for 2025–2027, olim benefits, sole dwelling rules, worked calculations, and common Anglo scenarios.",
    updated: "Last updated: March 2026",
    readTime: "~22 min read",
    to: "/guides/purchase-tax",
  },
  {
    icon: Building2,
    title: "Tama 38 & Pinui Binui: Urban Renewal",
    description: "Israel's massive building transformation — how it works, what residents get, tax treatment, timelines, and what buyers need to know.",
    updated: "Last updated: March 2026",
    readTime: "~22 min read",
    to: "/guides/pinui-binui",
  },
];

const GuidesIndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title="Guides for Buying Property in Israel — English-Language Resources | Navlan.io"
        description="In-depth guides for English speakers navigating Israeli real estate — from the buying process to government housing programs like Dira BeHanacha."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://navlan.io/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://navlan.io/guides" },
            ],
          },
        ]}
      />
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[1080px] pt-12 pb-16">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">Guides</h1>
          <p className="mt-3 font-body text-[16px] text-warm-gray max-w-[600px]">
            In-depth resources for navigating Israeli real estate as an English speaker.
          </p>
          <div className="border-b border-grid-line mt-6 mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.to} className="bg-cream border-grid-line shadow-card rounded-xl">
                <CardContent className="p-6 flex flex-col gap-3">
                  <guide.icon className="h-7 w-7 text-sage" />
                  <h2 className="font-heading font-semibold text-[18px] text-charcoal leading-snug">
                    {guide.title}
                  </h2>
                  <p className="font-body text-[15px] text-warm-gray leading-relaxed">
                    {guide.description}
                  </p>
                  <p className="font-body text-[13px] text-warm-gray">{guide.updated}</p>
                  <p className="font-body text-[13px] text-warm-gray mt-2">{guide.readTime}</p>
                  <Link
                    to={guide.to}
                    className="font-body font-medium text-[15px] text-horizon-blue no-underline hover:underline mt-1"
                  >
                    Read Guide →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuidesIndexPage;
