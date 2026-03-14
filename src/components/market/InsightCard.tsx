const InsightCard = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 rounded-lg bg-cream border-0 border-l-4 border-l-sage p-4 shadow-card">
    <p className="font-body text-[15px] text-charcoal leading-[1.6] m-0">{children}</p>
  </div>
);

export default InsightCard;
