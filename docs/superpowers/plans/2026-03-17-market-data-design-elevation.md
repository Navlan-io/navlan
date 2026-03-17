# Market Data Page Design Elevation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Market Data page from a data dump to a polished editorial market report through visual/layout changes.

**Architecture:** Component-level refactor — upgrade InsightCard with layout modes, apply side-by-side layouts in single-chart sections, upgrade full-width sections, restructure MarketDataPage for alternating backgrounds and gold dividers.

**Tech Stack:** React, Tailwind CSS, Recharts, Supabase (one minor select change)

**Spec:** `docs/superpowers/specs/2026-03-17-market-data-design-elevation.md`

---

## Chunk 1: Foundation (InsightCard + MarketDataPage structure)

### Task 1: Upgrade InsightCard component

**Files:**
- Modify: `src/components/market/InsightCard.tsx`

- [ ] **Step 1: Update InsightCard with layout prop and new styling**

Replace the entire file content with:

```tsx
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
```

Key changes from current:
- Added `layout` prop (accepted but not used for internal styling — parent controls width via flex container)
- Border: `border-l-sage` → `border-l-sand-gold`
- Radius: `rounded-lg` → `rounded-xl`
- Padding: `p-4` → `p-6`
- Added "WHAT THIS MEANS" badge span
- Text: `text-[15px]` → `text-[17px]`, `leading-[1.6]` → `leading-[1.7]`
- Removed `border-0` (unnecessary with explicit border-l)

- [ ] **Step 2: Verify the dev server shows no errors**

Run: visit `http://localhost:8080/market` — all InsightCards should render with new gold border, larger text, and "WHAT THIS MEANS" badge. No functionality changes.

- [ ] **Step 3: Commit**

```bash
git add src/components/market/InsightCard.tsx
git commit -m "feat(market): Upgrade InsightCard with gold border, badge, and larger text"
```

### Task 2: Restructure MarketDataPage — header, backgrounds, dividers, CTA

**Files:**
- Modify: `src/pages/MarketDataPage.tsx`

- [ ] **Step 1: Rewrite MarketDataPage with new structure**

Replace the entire return JSX (lines 37-94) with the new structure. Key changes:

**Header section** (replaces lines 55-79):
```tsx
{/* MARKET DATA badge */}
<span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold">
  Market Data
</span>
<h1 className="font-heading font-bold text-[36px] md:text-[40px] text-charcoal mt-2">
  Israel Housing Market
</h1>
<p className="mt-2 font-body text-[16px] text-warm-gray">
  National market data from the Central Bureau of Statistics and Bank of Israel
</p>
{/* Inline pill row with data pills + share button */}
<div className="flex flex-wrap items-center gap-3 mt-4">
  {dataAsOf && (
    <span className="bg-cream rounded-full px-3 py-1 font-body text-[12px] text-warm-gray">
      Data as of: {dataAsOf}
    </span>
  )}
  <span className="bg-cream rounded-full px-3 py-1 font-body text-[12px] text-warm-gray">
    Updates monthly from CBS
  </span>
  <button
    onClick={() => {
      const url = window.location.href;
      const text = `Israel housing market data on Navlan — ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sage/30 text-sage font-body text-[14px] font-medium hover:bg-sage/5 transition-colors"
  >
    <Share2 className="h-4 w-4" />
    Share
  </button>
</div>
```

**Section wrapper pattern** — each section gets a full-width background div with a gold divider before it. The sections area (replaces lines 81-89) becomes:

```tsx
{/* Gold divider after header */}
<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent mt-8 mb-0" />

{/* Section 1: NationalPriceTrend — odd (warm-white) */}
<div className="bg-warm-white" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
  <div className="max-w-[1200px] mx-auto py-12">
    <div id="national-trend" className="scroll-mt-24"><NationalPriceTrend /></div>
  </div>
</div>

<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

{/* Section 2: DistrictComparison — even (cream) */}
<div className="bg-cream" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
  <div className="max-w-[1200px] mx-auto py-12">
    <div id="district-comparison" className="scroll-mt-24"><DistrictComparison /></div>
  </div>
</div>

<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

{/* Section 3: ConstructionPipeline — needs container wrapper so its calc(-50vw + 50%) breakout math works */}
<div className="container max-w-[1200px]">
  <div id="construction-pipeline" className="scroll-mt-24"><ConstructionPipeline /></div>
</div>

<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

{/* Section 4: MortgageRates — even (cream) */}
<div className="bg-cream" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
  <div className="max-w-[1200px] mx-auto py-12">
    <div id="mortgage-rates" className="scroll-mt-24"><MortgageRates /></div>
  </div>
</div>

<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

{/* Section 5: RentalMarket — odd (warm-white) */}
<div className="bg-warm-white" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
  <div className="max-w-[1200px] mx-auto py-12">
    <div id="rental-market" className="scroll-mt-24"><RentalMarket /></div>
  </div>
</div>

<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />

{/* Section 6: ConstructionCosts — even (cream) */}
<div className="bg-cream" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
  <div className="max-w-[1200px] mx-auto py-12">
    <div id="construction-costs" className="scroll-mt-24"><ConstructionCosts /></div>
  </div>
</div>

{/* Newsletter CTA — after last section */}
<InlineNewsletterCTA source="market" />
```

Note: The old `<div className="border-b border-grid-line mt-6 mb-10" />` line divider is removed (replaced by gold gradient dividers). The `container max-w-[1200px] py-12` wrapper around all sections is removed — each section now manages its own max-width. The header area still needs a container wrapper.

The full page structure becomes:
```tsx
<div className="min-h-screen flex flex-col bg-warm-white">
  <SEO ... />
  <NavBar />
  <main className="flex-1 overflow-x-hidden">
    <div className="container max-w-[1200px] pt-12">
      {/* Header content here */}
    </div>
    {/* Gold divider + section wrappers here (full-width) */}
    {/* Newsletter CTA */}
    <div className="container max-w-[1200px] pb-12">
      <InlineNewsletterCTA source="market" />
    </div>
  </main>
  <Footer />
</div>
```

Important: Add `overflow-x-hidden` to `<main>` to prevent horizontal scrollbar from the full-bleed section trick.

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:8080/market`:
- Header shows "MARKET DATA" badge, larger title, pill badges inline with share button
- Alternating section backgrounds visible (warm-white / cream)
- Gold gradient dividers between sections
- Newsletter CTA appears after Construction Costs, not in the middle
- No horizontal scrollbar
- ConstructionPipeline's own cream bg still works

- [ ] **Step 3: Commit**

```bash
git add src/pages/MarketDataPage.tsx
git commit -m "feat(market): Add page header badge, alternating backgrounds, gold dividers, relocate CTA"
```

---

## Chunk 2: Side-by-side layouts (NationalPriceTrend, RentalMarket, ConstructionCosts)

### Task 3: NationalPriceTrend — side-by-side layout + time toggle relocation

**Files:**
- Modify: `src/components/market/NationalPriceTrend.tsx`

- [ ] **Step 1: Move time toggles inline with heading**

Replace line 107 (the `<h2>` — do NOT touch line 106 which is `<section>`):
```tsx
<h2 className="font-heading font-semibold text-[22px] text-charcoal mb-6">National Price Index</h2>
```

With a flex container that puts heading left, toggles right:
```tsx
<div className="flex items-center justify-between mb-6">
  <h2 className="font-heading font-semibold text-[22px] text-charcoal">National Price Index</h2>
  <div className="flex items-center gap-2" role="group" aria-label="Time range">
    {TIME_RANGES.map((r) => (
      <button
        key={r}
        onClick={() => setRange(r)}
        aria-pressed={range === r}
        className={cn(
          "px-3 py-1.5 rounded-full font-body text-[13px] font-medium transition-colors",
          range === r ? "bg-sage text-white" : "bg-cream text-charcoal hover:bg-sage/10"
        )}
      >
        {r}
      </button>
    ))}
  </div>
</div>
```

Then remove the old standalone toggle container (lines 156-173 — the `<div className="flex items-center justify-between mb-4">` block).

- [ ] **Step 2: Tighten metric cards to chart gap**

Change `mb-8` on the metric card containers (line 110 mobile card and line 135 desktop grid) to `mb-4`.

- [ ] **Step 3: Wrap chart + InsightCard in side-by-side flex**

Replace the chart area + source line + InsightCard (from the `<div style={{ minHeight: 250 }}>` through the closing `</InsightCard>`) with:

```tsx
<div className="lg:flex lg:gap-8 lg:items-start">
  <div className="lg:w-[60%]">
    <div style={{ minHeight: 250 }} aria-label="National dwelling price index trend from 2017 to 2025">
      <ResponsiveContainer width="100%" height={300}>
        {/* ... existing AreaChart unchanged ... */}
      </ResponsiveContainer>
    </div>
    <p className="font-body text-[12px] text-warm-gray mt-3">
      Source: Central Bureau of Statistics Dwelling Price Index (Base: 2015-2016 = 100)
    </p>
  </div>
  <div className="lg:w-[40%]">
    {latest && (
      <InsightCard layout="inline">
        {/* ... existing narrative logic unchanged ... */}
      </InsightCard>
    )}
  </div>
</div>
```

The InsightCard's `mt-6` provides spacing when stacked; in side-by-side mode the flex gap handles it.

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:8080/market#national-trend`:
- Time toggles sit right of "National Price Index" heading
- Metric cards have tighter gap to chart
- At `lg`+ viewport: chart left (~60%), interpretation right (~40%)
- Below `lg`: stacks vertically as before
- Chart still renders correctly at narrower width

- [ ] **Step 5: Commit**

```bash
git add src/components/market/NationalPriceTrend.tsx
git commit -m "feat(market): NationalPriceTrend side-by-side layout, inline time toggles"
```

### Task 4: RentalMarket — side-by-side layout

**Files:**
- Modify: `src/components/market/RentalMarket.tsx`

- [ ] **Step 1: Move time toggles inline with heading**

Replace line 106:
```tsx
<h2 className="font-heading font-semibold text-[22px] text-charcoal mb-2">Rental Market Trends</h2>
```

With heading + toggles flex (same pattern as NationalPriceTrend):
```tsx
<div className="flex items-center justify-between mb-2">
  <h2 className="font-heading font-semibold text-[22px] text-charcoal">Rental Market Trends</h2>
  <div className="flex items-center gap-2" role="group" aria-label="Time range">
    {TIME_RANGES.map((r) => (
      <button
        key={r}
        onClick={() => setRange(r)}
        aria-pressed={range === r}
        className={cn(
          "px-3 py-1.5 rounded-full font-body text-[13px] font-medium transition-colors",
          range === r ? "bg-sage text-white" : "bg-cream text-charcoal hover:bg-sage/10"
        )}
      >
        {r}
      </button>
    ))}
  </div>
</div>
```

Remove the old standalone toggle container (lines 125-142).

Note: The subtitle paragraph (lines 107-109, "National rent price index based on actual lease contracts (CBS)") and the 2 metric cards (lines 111-123) remain unchanged — they sit between the new heading row and the flex container below.

- [ ] **Step 2: Wrap chart + InsightCard in side-by-side flex**

Same pattern as NationalPriceTrend — wrap chart area + source line in `lg:w-[60%]` div, InsightCard in `lg:w-[40%]` div, both inside `lg:flex lg:gap-8 lg:items-start` parent.

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:8080/market#rental-market`:
- Time toggles inline with heading
- Side-by-side at `lg`+, stacked below
- Chart renders correctly

- [ ] **Step 4: Commit**

```bash
git add src/components/market/RentalMarket.tsx
git commit -m "feat(market): RentalMarket side-by-side layout, inline time toggles"
```

### Task 5: ConstructionCosts — side-by-side layout + MoM metric card

**Files:**
- Modify: `src/components/market/ConstructionCosts.tsx`

- [ ] **Step 1: Add `percent_mom` to query and interface**

Update the `CostRow` interface (line 14-19) to add:
```ts
interface CostRow {
  month: number;
  year: number;
  value: number | null;
  percent_yoy: number | null;
  percent_mom: number | null;
}
```

Update the select query (line 30) to:
```ts
.select("month, year, value, percent_yoy, percent_mom")
```

- [ ] **Step 2: Replace single metric card with two-card grid**

Replace lines 87-96 (the single `inline-block` Card) with:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
  <Card className="p-5 bg-cream border-0 shadow-card">
    <span className="font-body text-[13px] text-warm-gray block">Construction Cost Index</span>
    <div className="flex items-center gap-3 mt-1">
      <span className="font-body font-bold text-[28px] text-charcoal">{latest.value?.toFixed(1)}</span>
      <TrendPill
        direction={(latest.percent_yoy ?? 0) >= 0 ? "up" : "down"}
        value={`${(latest.percent_yoy ?? 0) >= 0 ? "+" : ""}${(latest.percent_yoy ?? 0).toFixed(1)}% YoY`}
      />
    </div>
  </Card>
  <Card className="p-5 bg-cream border-0 shadow-card">
    <span className="font-body text-[13px] text-warm-gray block mb-1">Month-over-Month</span>
    <TrendPill
      direction={(latest.percent_mom ?? 0) >= 0 ? "up" : "down"}
      value={`${(latest.percent_mom ?? 0) >= 0 ? "+" : ""}${(latest.percent_mom ?? 0).toFixed(1)}%`}
    />
  </Card>
</div>
```

- [ ] **Step 3: Wrap chart + InsightCard in side-by-side flex**

Same flex pattern as Tasks 3-4: chart area + source in `lg:w-[60%]`, InsightCard in `lg:w-[40%]`.

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:8080/market#construction-costs`:
- Two metric cards side by side on desktop
- MoM card shows data (or 0.0% if no data — acceptable)
- Side-by-side at `lg`+, stacked below

- [ ] **Step 5: Commit**

```bash
git add src/components/market/ConstructionCosts.tsx
git commit -m "feat(market): ConstructionCosts side-by-side layout, add MoM metric card"
```

---

## Chunk 3: Full-width section upgrades (DistrictComparison, ConstructionPipeline, MortgageRates)

### Task 6: DistrictComparison — legend spacing + InsightCard upgrade

**Files:**
- Modify: `src/components/market/DistrictComparison.tsx`

- [ ] **Step 1: Update legend spacing**

Replace line 155:
```tsx
<div className="flex flex-wrap items-center gap-3 mt-4">
```
With:
```tsx
<div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
```

- [ ] **Step 2: Add layout prop to InsightCard**

On line 187, change:
```tsx
<InsightCard>
```
To:
```tsx
<InsightCard layout="full-width">
```

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:8080/market#district-comparison`:
- Legend items have more horizontal spacing
- Anchor links on legend items still work (navigate to `/#explore-cities`)
- InsightCard has upgraded styling (gold border, badge, larger text)

- [ ] **Step 4: Commit**

```bash
git add src/components/market/DistrictComparison.tsx
git commit -m "feat(market): DistrictComparison wider legend spacing, full-width InsightCard"
```

### Task 7: ConstructionPipeline — InsightCard upgrade

**Files:**
- Modify: `src/components/market/ConstructionPipeline.tsx`

- [ ] **Step 1: Add layout prop to InsightCard**

On line 250, change:
```tsx
<InsightCard>
```
To:
```tsx
<InsightCard layout="full-width">
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:8080/market#construction-pipeline`:
- InsightCard has upgraded styling
- Section's own cream full-bleed bg still works
- Twin charts render correctly

- [ ] **Step 3: Commit**

```bash
git add src/components/market/ConstructionPipeline.tsx
git commit -m "feat(market): ConstructionPipeline full-width InsightCard"
```

### Task 8: MortgageRates — table styling + InsightCard replacement

**Files:**
- Modify: `src/components/market/MortgageRates.tsx`

- [ ] **Step 1: Add InsightCard import**

Add at top of file (after existing imports):
```tsx
import InsightCard from "./InsightCard";
```

- [ ] **Step 2: Update table row styling**

Replace lines 88-103 (the `<TableBody>` contents) with:

```tsx
<TableBody>
  {rates.map((r, i) => {
    const isKeyRow = r.track_type === "non_indexed_fixed" || r.track_type === "prime_variable";
    return (
      <TableRow
        key={r.track_type}
        className={cn(
          isKeyRow ? "border-l-4 border-l-sage font-semibold" : "",
          i % 2 === 0 ? "bg-white" : "bg-cream/50"
        )}
      >
        <TableCell className="font-body text-[15px] text-charcoal">{r.track_label}</TableCell>
        <TableCell className="font-body text-[15px] text-charcoal font-semibold">
          {r.value == null || r.value === 0
            ? "N/A"
            : r.rate_type === "margin"
              ? `+${r.value.toFixed(2)}% margin`
              : `${r.value.toFixed(2)}%`}
        </TableCell>
        <TableCell className="font-body text-[13px] text-warm-gray">
          {TRACK_NOTES[r.track_type] ?? ""}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
```

This requires adding `cn` import — check if already imported. If not, add:
```tsx
import { cn } from "@/lib/utils";
```

- [ ] **Step 3: Replace raw Card advisory with InsightCard**

Replace lines 117-122:
```tsx
<Card className="mt-6 p-5 bg-cream border-0 border-l-4 border-l-sage shadow-card">
  <p className="font-body text-[14px] text-charcoal">
    Israeli mortgages are structured differently than in the US/UK. Most borrowers use a mix of 3–4 tracks.
    Consult a licensed mortgage advisor for personalized planning.
  </p>
</Card>
```

With:
```tsx
<InsightCard layout="full-width">
  Israeli mortgages are structured differently than in the US/UK. Most borrowers use a mix of 3–4 tracks.
  Consult a licensed mortgage advisor for personalized planning.
</InsightCard>
```

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:8080/market#mortgage-rates`:
- Table rows alternate white/cream
- Non-Indexed Fixed and Prime rows have sage left border
- No `bg-sand-gold/10` on key rows
- FX-Indexed Fixed (0.00%) shows "N/A"
- Advisory card now has "WHAT THIS MEANS" badge and gold left border
- Null rates show "N/A" instead of "—"

- [ ] **Step 5: Commit**

```bash
git add src/components/market/MortgageRates.tsx
git commit -m "feat(market): MortgageRates alternating rows, sage key-row border, N/A for null/zero rates, InsightCard"
```

---

## Chunk 4: Final verification

### Task 9: Full page visual verification

- [ ] **Step 1: Desktop verification (1280px+ viewport)**

Visit `http://localhost:8080/market` and scroll through entire page. Verify:
- "MARKET DATA" badge above title
- Title is 36-40px Source Serif Bold
- Data pills and share button inline
- Gold gradient dividers between all 6 sections
- Alternating warm-white / cream backgrounds
- NationalPriceTrend: time toggles inline with heading, side-by-side chart+insight
- DistrictComparison: wider legend spacing, full-width insight card
- ConstructionPipeline: cream full-bleed bg, full-width insight card
- MortgageRates: alternating rows, sage borders on key rows, N/A for zero rates
- RentalMarket: side-by-side chart+insight
- ConstructionCosts: two metric cards, side-by-side chart+insight
- Newsletter CTA at bottom after all sections
- No horizontal scrollbar

- [ ] **Step 2: Mobile verification (375px viewport)**

Resize browser or use dev tools:
- All side-by-side layouts stack vertically
- Charts are full-width
- InsightCards appear below charts
- Time toggles still accessible (may wrap to new line — that's OK)
- Metric cards stack on mobile
- Table still scrollable horizontally

- [ ] **Step 3: Run existing tests**

```bash
npm test
```

Verify no test failures from the styling changes.

- [ ] **Step 4: Final commit if any fixes needed**

Only if adjustments were made during verification.
