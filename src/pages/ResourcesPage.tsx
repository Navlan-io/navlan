import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Landmark, Calculator, Plane, Briefcase, BookOpen, ExternalLink } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import type { LucideIcon } from "lucide-react";

interface Resource {
  name: string;
  url: string;
  description: string;
  internal?: boolean;
}

interface Category {
  title: string;
  icon: LucideIcon;
  resources?: Resource[];
  custom?: React.ReactNode;
}

const categories: Category[] = [
  {
    title: "Community Groups",
    icon: Users,
    resources: [
      { name: "Living Financially Smarter Israel", url: "https://www.facebook.com/groups/livingfinanciallysmarterinisrael", description: "Largest English-speaking financial community in Israel (35,000+ members)" },
      { name: "Secret Tel Aviv", url: "https://www.facebook.com/groups/secrettelaviv", description: "Active group for Tel Aviv anglos (60,000+ members) — real estate discussions frequent" },
      { name: "Secret Jerusalem", url: "https://www.facebook.com/groups/secretjerusalem", description: "Jerusalem community — housing questions common" },
      { name: "Secret Haifa", url: "https://www.facebook.com/groups/secrethaifa", description: "Haifa anglo community" },
      { name: "Anglo-List", url: "https://www.anglo-list.com", description: "English-language classifieds and community site" },
      { name: "Janglo", url: "https://www.janglo.net", description: "Jerusalem-focused anglo portal with real estate listings" },
    ],
  },
  {
    title: "Government Resources",
    icon: Landmark,
    resources: [
      { name: "Israel Central Bureau of Statistics", url: "https://www.cbs.gov.il/en", description: "Housing price indices, construction data, and demographic statistics" },
      { name: "Bank of Israel", url: "https://www.boi.org.il/en", description: "Mortgage rate data, exchange rates, and monetary policy" },
      { name: "Tabu Online (Land Registry)", url: "https://www.gov.il/en/service/land-registration-extract", description: "Order a Nesach Tabu (title extract) online" },
      { name: "nadlan.gov.il", url: "https://www.nadlan.gov.il", description: "Government real estate transaction database (Hebrew)" },
      { name: "Dira BeHanacha", url: "https://dira.moch.gov.il", description: "Official subsidized housing program portal (Hebrew)" },
      { name: "Israel Tax Authority", url: "https://www.gov.il/en/departments/israel-tax-authority", description: "Purchase tax (Mas Rechisha) information and calculators" },
      { name: "Israel Land Authority", url: "https://land.gov.il", description: "Government land tenders and leasehold information (Hebrew)" },
    ],
  },
  {
    title: "Financial Planning",
    icon: Calculator,
    resources: [
      { name: "Blue & White Finance", url: "https://bluewhitefinance.com", description: "Independent financial planning for English speakers in Israel — budgeting, investments, and property planning" },
      { name: "Wise (TransferWise)", url: "https://wise.com", description: "Low-cost international money transfers — commonly used for property purchases" },
      { name: "IsraTransfer", url: "https://www.isratransfer.com", description: "Currency exchange service specializing in Israel property transactions" },
      { name: "Bank of Israel Mortgage Calculator", url: "https://www.boi.org.il/en/financial-tools/mortgage-calculator", description: "Official mortgage payment calculator" },
    ],
  },
  {
    title: "Immigration & Aliyah",
    icon: Plane,
    resources: [
      { name: "Nefesh B'Nefesh", url: "https://www.nbn.org.il", description: "The main organization assisting North American and UK olim" },
      { name: "Jewish Agency", url: "https://www.jewishagency.org", description: "Aliyah processing and support worldwide" },
      { name: "Ministry of Aliyah and Integration", url: "https://www.gov.il/en/departments/ministry_of_aliyah_and_integration", description: "Official government aliyah resources and benefits" },
      { name: "AACI (Association of Americans and Canadians in Israel)", url: "https://www.aaci.org.il", description: "Advocacy and community services for North American olim" },
    ],
  },
  {
    title: "Professional Services",
    icon: Briefcase,
    custom: (
      <div className="bg-cream rounded-xl border border-grid-line p-8 text-center">
        <p className="font-body text-[15px] text-warm-gray">
          Our directory of English-speaking real estate professionals — lawyers, mortgage advisors, brokers, and tax advisors — is coming soon.
        </p>
        <p className="font-body text-[15px] text-warm-gray italic mt-3">
          Are you a professional serving the anglo community? Contact us at{" "}
          <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">
            hello@navlan.io
          </a>{" "}
          to be listed.
        </p>
      </div>
    ),
  },
  {
    title: "Guides & Education",
    icon: BookOpen,
    resources: [
      { name: "Buy It In Israel", url: "https://buyitinisrael.com", description: "English-language Israeli real estate editorial and broker directory" },
      { name: "Navlan Start Here Guide", url: "/guides/start-here", description: "Everything you need to know about buying property in Israel", internal: true },
      { name: "Navlan Dira BeHanacha Guide", url: "/guides/dira-behanacha", description: "Complete English guide to Israel's subsidized housing program", internal: true },
      { name: "The Times of Israel — Real Estate", url: "https://www.timesofisrael.com/topic/real-estate/", description: "English-language Israeli news coverage of the housing market" },
      { name: "Globes English", url: "https://en.globes.co.il/en/tag/tag-Real%20Estate", description: "Israeli business news — real estate section" },
    ],
  },
];

const ResourceRow = ({ resource }: { resource: Resource }) => {
  if (resource.internal) {
    return (
      <div className="flex items-start justify-between gap-4 py-3.5 px-4">
        <div className="min-w-0">
          <Link to={resource.url} className="font-body font-semibold text-[16px] text-horizon-blue no-underline hover:underline">
            {resource.name}
          </Link>
          <p className="font-body text-[14px] text-warm-gray mt-0.5">{resource.description}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 px-4">
      <div className="min-w-0">
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-body font-semibold text-[16px] text-horizon-blue no-underline hover:underline">
          {resource.name}
        </a>
        <p className="font-body text-[14px] text-warm-gray mt-0.5">{resource.description}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-warm-gray flex-shrink-0 mt-1.5" />
    </div>
  );
};

const ResourcesPage = () => {
  useEffect(() => {
    document.title = "Resources for English-Speaking Property Buyers | Navlan.io";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <NavBar />
      <main className="flex-1">
        <div className="container max-w-[900px] pt-12 pb-16">
          <h1 className="font-heading font-bold text-[32px] text-charcoal">
            Resources for English-Speaking Property Buyers
          </h1>
          <p className="mt-3 font-body text-[16px] text-warm-gray max-w-[600px]">
            A curated directory of groups, government sites, and tools to help you navigate Israeli real estate in English.
          </p>
          <div className="border-b border-grid-line mt-6 mb-10" />

          <div className="space-y-10">
            {categories.map((cat) => (
              <section key={cat.title}>
                <div className="flex items-center gap-2.5 mb-4">
                  <cat.icon className="h-[22px] w-[22px] text-sage" />
                  <h2 className="font-heading font-semibold text-[22px] text-charcoal">{cat.title}</h2>
                </div>
                {cat.custom ? (
                  cat.custom
                ) : (
                  <div className="bg-cream rounded-xl border border-grid-line divide-y divide-grid-line overflow-hidden">
                    {cat.resources!.map((r) => (
                      <ResourceRow key={r.name} resource={r} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="bg-cream rounded-xl border border-grid-line p-6 text-center mt-12">
            <p className="font-body text-[15px] text-warm-gray">
              Know a resource we're missing? Email us at{" "}
              <a href="mailto:hello@navlan.io" className="text-horizon-blue no-underline hover:underline">
                hello@navlan.io
              </a>
            </p>
          </div>
          <p className="mt-4 font-body text-[13px] text-warm-gray text-center">Last updated: March 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesPage;
