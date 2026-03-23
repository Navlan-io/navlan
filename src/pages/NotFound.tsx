import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import SEO from "@/components/SEO";

const POPULAR_CITIES = [
  { name: "Jerusalem", slug: "jerusalem" },
  { name: "Tel Aviv", slug: "tel-aviv" },
  { name: "Ra'anana", slug: "raanana" },
  { name: "Netanya", slug: "netanya" },
  { name: "Beit Shemesh", slug: "beit-shemesh" },
  { name: "Haifa", slug: "haifa" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <SEO
        title="Page Not Found | Navlan.io"
        description="The page you're looking for may have moved or doesn't exist. Search for a city or explore popular destinations in Israel."
      />
      <NavBar />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-20 md:py-28"
      >
        <div className="w-full max-w-[640px] text-center">
          {/* Label */}
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33]">
            Page Not Found
          </span>

          {/* Heading */}
          <h1 className="mt-2 font-heading font-semibold text-[28px] md:text-[34px] text-charcoal">
            We couldn't find that page
          </h1>

          {/* Subtext */}
          <p className="mt-3 font-body text-[16px] text-warm-gray leading-relaxed">
            The page you're looking for may have moved or doesn't exist.
          </p>

          {/* Search */}
          <div className="mt-8 mx-auto max-w-[480px]">
            <SearchBar />
          </div>

          {/* Popular Cities */}
          <section className="mt-12">
            <h2 className="font-heading font-semibold text-[20px] text-charcoal mb-5">
              Popular Cities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {POPULAR_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  to={`/city/${city.slug}`}
                  className="group block bg-cream rounded-xl p-5 border border-grid-line/60 no-underline hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
                >
                  <h3 className="font-heading font-semibold text-[17px] text-charcoal">
                    {city.name}
                  </h3>
                  <span className="mt-3 inline-block font-body font-medium text-[14px] text-sage group-hover:text-sage-dark transition-colors">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Or try links */}
          <p className="mt-10 font-body text-[14px] text-warm-gray">
            Or try:{" "}
            <Link to="/" className="text-sage hover:text-sage-dark transition-colors">Homepage</Link>
            {" · "}
            <Link to="/cities" className="text-sage hover:text-sage-dark transition-colors">Cities</Link>
            {" · "}
            <Link to="/market" className="text-sage hover:text-sage-dark transition-colors">Market Data</Link>
            {" · "}
            <Link to="/advisor" className="text-sage hover:text-sage-dark transition-colors">AI Advisor</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
