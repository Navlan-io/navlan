interface PullQuoteProps {
  children: React.ReactNode;
}

const PullQuote = ({ children }: PullQuoteProps) => {
  return (
    <blockquote className="my-8 border-l-4 border-sand-gold bg-cream/60 rounded-r-lg pl-6 pr-4 py-4">
      <p className="font-heading italic text-[18px] md:text-[20px] text-charcoal leading-relaxed">
        {children}
      </p>
    </blockquote>
  );
};

export default PullQuote;
