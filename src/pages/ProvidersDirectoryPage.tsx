import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const ProvidersDirectoryPage = () => {
  return (
    <>
      <SEO
        title="Find Verified Service Providers | Navlan.io"
        description="English-speaking real estate professionals across Israel — brokers, lawyers, mortgage advisors, and more. Verified by Navlan."
      />
      <NavBar />

      <main id="main-content" className="bg-warm-white">
        <section className="py-20 md:py-32">
          <div className="container max-w-2xl text-center">
            <h1 className="font-heading font-bold text-[30px] md:text-[40px] text-charcoal leading-tight mb-5">
              Find a Verified Provider
            </h1>
            <p className="font-body text-[16px] md:text-[18px] text-warm-gray leading-relaxed mb-8 max-w-lg mx-auto">
              We're building a curated network of English-speaking service
              providers across Israel. Our provider directory is coming soon.
            </p>
            <Link
              to="/providers/join"
              className="inline-block bg-sage hover:bg-sage-dark text-white font-body font-semibold text-[16px] px-8 py-3 rounded-lg transition-colors"
            >
              Are you a service provider? Join the network &rarr;
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ProvidersDirectoryPage;
