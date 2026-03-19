import { useState } from "react";
import { cn } from "@/lib/utils";
import TrendsTab from "./TrendsTab";
import CommunityTab from "./CommunityTab";

const TABS = ["Trends", "Community"] as const;
type TabName = (typeof TABS)[number];

interface CityTabsProps {
  city: {
    english_name: string;
    hebrew_name: string | null;
    cbs_code: number | null;
    district: string;
  };
  profile: any;
  prices: any[];
  districtIndices: any[];
  hasPriceData: boolean;
  rentalData?: any;
}

const CityTabs = ({ city, profile, prices, districtIndices, hasPriceData, rentalData }: CityTabsProps) => {
  // Default to Community if no price data at all
  const [activeTab, setActiveTab] = useState<TabName>(hasPriceData ? "Trends" : "Community");

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-14 md:top-16 z-40 bg-warm-white border-b border-grid-line">
        <div className="container max-w-[1200px]">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3.5 min-h-[44px] font-body font-medium text-[14px] md:text-[15px] whitespace-nowrap transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "text-charcoal border-sand-gold"
                    : "text-warm-gray border-transparent hover:text-charcoal"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "Trends" && (
          <TrendsTab city={city} prices={prices} districtIndices={districtIndices} rentalData={rentalData} />
        )}
        {activeTab === "Community" && (
          <CommunityTab city={city} profile={profile} onSwitchTab={(tab) => setActiveTab(tab as TabName)} />
        )}
      </div>
    </div>
  );
};

export default CityTabs;
