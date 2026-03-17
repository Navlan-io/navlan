/**
 * Shared chart axis utilities for consistent tick formatting across all Recharts charts.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const TIME_RANGES = ["1Y", "3Y", "5Y", "Max"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

/** Filter data points by time range relative to today. */
export function filterByRange<T extends { year: number; month: number }>(
  data: T[],
  range: TimeRange,
): T[] {
  if (range === "Max") return data;
  const years = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), 1);
  return data.filter((d) => new Date(d.year, d.month - 1, 1) >= cutoff);
}

/**
 * Build chart data items that embed year/month for smart tick filtering.
 */
export interface ChartPoint {
  label: string;
  year: number;
  month: number;
  [key: string]: any;
}

export function buildLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} '${String(year).slice(2)}`;
}

/**
 * Returns a tick filter function for XAxis.
 * Range-aware formatting:
 *   1Y  → every 2-3 months, "Jan '25" format
 *   3Y  → every ~6 months (Jan & Jul), "Jan '23" format
 *   5Y  → yearly, "2021" format
 *   Max → yearly, "2018" format
 *   Mobile always shows yearly regardless of range.
 */
export function getXAxisConfig(data: ChartPoint[], isMobile: boolean, range?: string) {
  if (data.length === 0) return { ticks: [] as string[], tickFormatter: (v: string) => v };

  const selectedLabels = new Set<string>();
  const dataYearSpan = data.length > 0
    ? data[data.length - 1].year - data[0].year
    : 0;

  // Mobile always gets yearly ticks
  if (isMobile) {
    addYearlyTicks(data, selectedLabels);
  } else if (range === "1Y") {
    // 1Y desktop: every 3 months (Jan, Apr, Jul, Oct)
    for (const point of data) {
      if (point.month % 3 === 1) selectedLabels.add(point.label);
    }
    addFirstLast(data, selectedLabels);
  } else if (range === "3Y") {
    // 3Y desktop: every 6 months (Jan and Jul)
    for (const point of data) {
      if (point.month === 1 || point.month === 7) selectedLabels.add(point.label);
    }
    addFirstLast(data, selectedLabels);
  } else if (range === "5Y" || range === "Max" || dataYearSpan >= 5) {
    // Long-range: yearly ticks
    addYearlyTicks(data, selectedLabels);
  } else {
    // Desktop, no explicit range, short data: every 3-6 months
    const totalPoints = data.length;
    const interval = totalPoints > 60 ? 6 : totalPoints > 24 ? 3 : 2;
    for (const point of data) {
      if (point.month % interval === 1 || (interval <= 2 && point.month % interval === 0)) {
        selectedLabels.add(point.label);
      }
    }
    addFirstLast(data, selectedLabels);
  }

  const ticks = data.filter(d => selectedLabels.has(d.label)).map(d => d.label);
  const showYearOnly = isMobile || range === "5Y" || range === "Max" || (!range && dataYearSpan >= 5);

  const tickFormatter = (label: string) => {
    if (showYearOnly) {
      const match = label.match(/'(\d{2})$/);
      if (match) return `20${match[1]}`;
    }
    return label;
  };

  return { ticks, tickFormatter };
}

function addYearlyTicks(data: ChartPoint[], labels: Set<string>) {
  const seenYears = new Set<number>();
  const firstYear = data[0]?.year;
  const firstYearHasJan = data.some(p => p.year === firstYear && p.month === 1);
  for (const point of data) {
    if (point.year === firstYear && !firstYearHasJan) continue;
    if (!seenYears.has(point.year)) {
      seenYears.add(point.year);
      labels.add(point.label);
    }
  }
}

function addFirstLast(data: ChartPoint[], labels: Set<string>) {
  if (data.length > 0) {
    labels.add(data[0].label);
    labels.add(data[data.length - 1].label);
  }
}

/**
 * Compute nice Y-axis domain that tightly frames the data.
 * Uses a small buffer (~5-10%) above max and below min, then snaps to round numbers.
 * E.g. for data range 405-601 → domain [400, 650], ticks [400, 450, 500, 550, 600, 650].
 */
export function getNiceYDomain(
  data: number[],
  tickCount: number = 6
): { domain: [number, number]; ticks: number[] } {
  if (data.length === 0) return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add a small buffer (5% of range on each side, minimum 1)
  const buffer = Math.max(range * 0.05, 1);
  const bufferedMin = min - buffer;
  const bufferedMax = max + buffer;
  const bufferedRange = bufferedMax - bufferedMin;

  // Pick a nice step size based on the buffered range
  const rawStep = bufferedRange / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceSteps = [1, 1.5, 2, 2.5, 5, 10];
  let step = magnitude;
  for (const ns of niceSteps) {
    if (ns * magnitude >= rawStep) {
      step = ns * magnitude;
      break;
    }
  }

  const niceMin = Math.floor(bufferedMin / step) * step;
  // Snap niceMax to just cover the actual max, not the over-buffered value
  let niceMax = Math.ceil(max / step) * step;
  // Ensure at least one step of headroom above max
  if (niceMax - max < step * 0.1) {
    niceMax += step;
  }

  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.01; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }

  return { domain: [niceMin, niceMax], ticks };
}
