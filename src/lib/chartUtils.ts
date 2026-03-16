/**
 * Shared chart axis utilities for consistent tick formatting across all Recharts charts.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
 * - Mobile (< 768px): show only January of each year → "2018", "2019", etc.
 * - Desktop: show every ~3-6 months → "Jan '22", "Jul '22", etc.
 *
 * Usage: pass the full data array and use the returned function as the XAxis tick formatter
 * combined with a custom interval.
 */
export function getXAxisConfig(data: ChartPoint[], isMobile: boolean, range?: string) {
  if (data.length === 0) return { ticks: [] as string[], tickFormatter: (v: string) => v };

  const selectedLabels = new Set<string>();

  // Determine if this is a long-range view (5+ years of data or explicit Max/5Y range)
  const dataYearSpan = data.length > 0
    ? data[data.length - 1].year - data[0].year
    : 0;
  const isLongRange = range === "Max" || range === "5Y" || dataYearSpan >= 5;

  // On mobile or long-range desktop views, show only one tick per year
  if (isMobile || isLongRange) {
    const seenYears = new Set<number>();
    for (const point of data) {
      if (!seenYears.has(point.year)) {
        seenYears.add(point.year);
        selectedLabels.add(point.label);
      }
    }
  } else {
    // Desktop short-range: show roughly every 3-6 months depending on data density
    const totalPoints = data.length;
    const interval = totalPoints > 60 ? 6 : totalPoints > 24 ? 3 : 2;
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      if (point.month % interval === 1 || (interval <= 2 && point.month % interval === 0)) {
        selectedLabels.add(point.label);
      }
    }
    // Always include first and last
    if (data.length > 0) {
      selectedLabels.add(data[0].label);
      selectedLabels.add(data[data.length - 1].label);
    }
  }

  const ticks = data.filter(d => selectedLabels.has(d.label)).map(d => d.label);

  const tickFormatter = (label: string) => {
    if (isMobile || isLongRange) {
      // Extract year from label like "Jan '22" → "2022"
      const match = label.match(/'(\d{2})$/);
      if (match) return `20${match[1]}`;
    }
    return label;
  };

  return { ticks, tickFormatter };
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
