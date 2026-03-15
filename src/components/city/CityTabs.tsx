import { useState } from "react";
import { cn } from "@/lib/utils";
import TrendsTab from "./TrendsTab";
import CommunityTab from "./CommunityTab";
import ResourcesTab from "./ResourcesTab";

const TABS = ["Trends", "Community", "Resources"] as const;
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
}

const CityTabs = ({ city, profile, prices, districtIndices }: CityTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabName>("Trends");

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-14 md:top-16 z-40 bg-warm-white border-b border-grid-line">
        <div className="container max-w-[1200px]">
          <div className="flex overflow-x-auto no-scrollbar relative">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 min-h-[44px] font-body font-medium text-[14px] md:text-[15px] whitespace-nowrap transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "text-sage border-sand-gold"
                    : "text-warm-gray border-transparent hover:text-charcoal"
                )}
              >
                {tab}
              </button>
            ))}
            {/* Fade gradient on right for mobile scroll indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-warm-white to-transparent pointer-events-none md:hidden" />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="container max-w-[1200px] py-8 md:py-10">
        {activeTab === "Trends" && (
          <TrendsTab city={city} prices={prices} districtIndices={districtIndices} />
        )}
        {activeTab === "Community" && <CommunityTab city={city} profile={profile} onSwitchTab={(tab) => setActiveTab(tab as TabName)} />}
        {activeTab === "Resources" && <ResourcesTab city={city} />}
      </div>
    </div>
  );
};

export default CityTabs;
