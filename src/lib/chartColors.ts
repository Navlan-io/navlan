// Centralized chart color constants
// These match the brand palette defined in tailwind.config.ts

export const chartColors = {
  horizonBlue: "#4A7F8B",
  sage: "#7C8B6E",
  sandGold: "#C4A96A",
  deepOlive: "#4A5540",
  terraRed: "#C25B4A",
  growthGreen: "#5B8C5A",
  warmGray: "#6B7178",
  gridLine: "#E8E4DE",
} as const;

// Shared tick style for Recharts XAxis/YAxis
export const axisTick = {
  fontSize: 10,
  fill: chartColors.warmGray,
  fontFamily: "Inter",
} as const;

// District color mapping for multi-line charts
export const districtColors: Record<string, string> = {
  Jerusalem: chartColors.sage,
  North: chartColors.sandGold,
  Haifa: chartColors.horizonBlue,
  Central: chartColors.deepOlive,
  "Tel Aviv": chartColors.terraRed,
  South: chartColors.growthGreen,
};
