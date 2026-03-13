const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-warm-white">
    <div className="text-center">
      <h1 className="font-heading font-bold text-[28px] text-charcoal">{title}</h1>
      <p className="mt-2 font-body text-warm-gray">Coming soon</p>
    </div>
  </div>
);

export const CityPage = () => <PlaceholderPage title="City page coming soon" />;
export const MarketData = () => <PlaceholderPage title="Market data coming soon" />;
export const StartHereGuide = () => <PlaceholderPage title="Start Here Guide coming soon" />;
export const DiraGuide = () => <PlaceholderPage title="Dira BeHanacha Guide coming soon" />;
export const Resources = () => <PlaceholderPage title="Resources coming soon" />;
export const About = () => <PlaceholderPage title="About coming soon" />;
