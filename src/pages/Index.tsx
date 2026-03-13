import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

const statPills = [
  { label: "National Avg", value: "₪2.21M" },
  { label: "Prices", value: "+4.0% YoY" },
  { label: "Construction Costs", value: "+2.2% YoY" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(124,139,110,0.6), rgba(196,169,106,0.6), rgba(74,127,139,0.6))",
          }}
        />
        <div className="absolute inset-0 bg-warm-white/40" />

        <div className="relative z-10 container py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="text-white text-[32px] md:text-[44px] font-heading font-bold leading-tight max-w-2xl drop-shadow-sm">
            Navigate Israeli Real Estate. In English.
          </h1>
          <p className="mt-4 text-white/90 font-body text-[17px] md:text-[19px] max-w-lg drop-shadow-sm">
            Market data, city guides, and community resources for English speakers
          </p>

          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {statPills.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-card"
              >
                <span className="font-body text-[13px] text-warm-gray">{stat.label}:</span>
                <span className="font-body font-bold text-[14px] text-charcoal">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer for visual balance */}
      <div className="flex-1" />

      <Footer />
    </div>
  );
};

export default Index;
