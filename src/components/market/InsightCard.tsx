interface InsightCardProps {
  children: React.ReactNode;
  layout?: "inline" | "full-width";
}

const InsightCard = ({ children, layout = "inline" }: InsightCardProps) => (
  <div className="mt-6 rounded-xl bg-cream border-l-4 border-l-sand-gold p-6 shadow-card">
    <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-sand-gold mb-3 block">
      What this means
    </span>
    <p className="font-body text-[17px] text-charcoal leading-[1.7] m-0">{children}</p>
  </div>
);

export default InsightCard;
