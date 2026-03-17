# Market Data Page — Design Elevation

**Date:** 2026-03-17
**Status:** Approved
**Approach:** Component-Level Refactor (Approach A)

## Summary

Elevate the Market Data page (`/market`) from a functional data dump to a polished editorial market report. Primarily visual/layout changes. One minor query change: adding `percent_mom` to the ConstructionCosts select. No other data queries, Supabase logic, calculations, or financial advice language modified.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Body font | Keep DM Sans (not Inter) | Consistent with rest of site |
| Side-by-side breakpoint | `lg` (1024px+) | Charts need ~700px minimum; `md` would be too cramped |
| Mortgage key row emphasis | Sage left border + alternating rows | Clean editorial look, removes redundant sand-gold bg |
| Rental market data note | Skip | Don't speculate about data artifacts in UI |
| Null/0 rate handling | Display "N/A" for null, undefined, or 0 | Covers both DB null and literal 0 cases |

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/MarketDataPage.tsx` | Page header upgrade, alternating section backgrounds, gold dividers, newsletter CTA relocation |
| `src/components/market/InsightCard.tsx` | New `layout` prop ("inline" / "full-width"), badge, gold border, larger text |
| `src/components/market/NationalPriceTrend.tsx` | Side-by-side layout, time toggles inline with heading, tighter card-to-chart gap |
| `src/components/market/RentalMarket.tsx` | Side-by-side layout |
| `src/components/market/ConstructionCosts.tsx` | Side-by-side layout, add MoM metric card (requires adding `percent_mom` to select query and `CostRow` interface) |
| `src/components/market/DistrictComparison.tsx` | Legend spacing, full-width InsightCard upgrade |
| `src/components/market/ConstructionPipeline.tsx` | Full-width InsightCard upgrade |
| `src/components/market/MortgageRates.tsx` | Alternating row bg, sage border on key rows, 0/null → "N/A", replace raw `<Card>` advisory with `InsightCard layout="full-width"` |

## Design Specification

### 1. Global Page Structure (MarketDataPage.tsx)

#### Page Header
- Add "MARKET DATA" badge above the title
  - Style: `font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-sand-gold`
- Title: `font-heading font-bold text-[36px] md:text-[40px]`
- Subtitle: `font-body text-[16px] text-warm-gray`
- "Data as of" and "Updates monthly" become inline pill badges next to the Share button
  - Layout: `flex items-center gap-3`
  - Pill style: `bg-cream rounded-full px-3 py-1 text-[12px] text-warm-gray font-body`

#### Alternating Section Backgrounds
Section order (unchanged from current):
1. NationalPriceTrend — `bg-warm-white` (odd)
2. DistrictComparison — `bg-cream` (even)
3. ConstructionPipeline — own cream full-bleed background takes precedence (odd slot)
4. MortgageRates — `bg-cream` (even)
5. RentalMarket — `bg-warm-white` (odd)
6. ConstructionCosts — `bg-cream` (even)

Each section wrapped in a full-width div that breaks out of the container, content still constrained to `max-w-[1200px] mx-auto`

#### Gold Gradient Dividers
Between every major section:
```html
<div className="h-px bg-gradient-to-r from-transparent via-sand-gold/20 to-transparent" />
```

#### Newsletter CTA Relocation
Move `InlineNewsletterCTA` from its current position (between ConstructionPipeline and MortgageRates) to after ConstructionCosts (the last section in the list above), before the footer. Section order itself does not change.

### 2. InsightCard Component Upgrade

#### New Interface
```ts
interface InsightCardProps {
  children: React.ReactNode;
  layout?: "inline" | "full-width"; // default "inline"
}
```

#### Shared Styling (Both Modes)
- Background: `bg-cream`
- Border: `border-l-4 border-l-sand-gold` (changed from sage)
- Border radius: `rounded-xl` (changed from rounded-lg)
- Padding: `p-6` (changed from p-4)
- Shadow: `shadow-card`
- "WHAT THIS MEANS" badge at top:
  - Style: `font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-sand-gold mb-3`
- Body text: `font-body text-[17px] text-charcoal leading-[1.7]` (changed from 15px/1.6)

#### "inline" Mode
- Used in side-by-side sections
- Takes `lg:w-[40%]` when inside flex parent
- Full-width when stacked (<1024px)

#### "full-width" Mode
- Used in multi-element sections
- Full container width, same card styling

#### Global Style Impact
The styling changes (border color sage→sand-gold, padding p-4→p-6, radius rounded-lg→rounded-xl, text 15px→17px) apply to ALL InsightCard instances across the page. This is intentional — every interpretation card gets the editorial upgrade.

### 3. Single-Chart Sections (Side-by-Side Layout)

Applies to: NationalPriceTrend, RentalMarket, ConstructionCosts

#### Layout Pattern
```html
<div className="lg:flex lg:gap-8 lg:items-start">
  <div className="lg:w-[60%]">
    <!-- chart + metric cards + time toggles -->
  </div>
  <div className="lg:w-[40%]">
    <InsightCard layout="inline">...</InsightCard>
  </div>
</div>
```

Below `lg` breakpoint: stacks vertically, chart full-width, then InsightCard.

#### NationalPriceTrend Specific
- 3 metric cards (Price Index, YoY, MoM) stay above the flex container
- Time toggle buttons (1Y/3Y/5Y/Max) move inline with section heading: `flex items-center justify-between`
- Tighten gap between metric cards and chart

#### RentalMarket Specific
- Same side-by-side pattern
- 2 metric cards above flex container
- No data disclaimer added

#### ConstructionCosts Specific
- Add second metric card: MoM change
  - Requires adding `percent_mom` to the Supabase `select()` call and `CostRow` interface (column exists in `construction_costs` table)
- Both cards sit above flex container
- Chart left, interpretation right

### 4. Multi-Element Sections (Full-Width Layout)

Applies to: DistrictComparison, ConstructionPipeline, MortgageRates

#### DistrictComparison
- Multi-line chart stays full-width
- Legend spacing: increase to `gap-x-6 gap-y-2` (preserve existing anchor links on legend items)
- InsightCard: `layout="full-width"`

#### ConstructionPipeline
- 3 metric cards + 2-column chart grid unchanged
- InsightCard below twin charts: `layout="full-width"`
- Section's own cream full-bleed background takes precedence over alternating pattern

#### MortgageRates
- Table alternating rows: odd `bg-white`, even `bg-cream/50`
- Key rows (matched by `track_type === "non_indexed_fixed"` and `track_type === "prime_variable"`):
  - Add `border-l-4 border-l-sage`
  - Remove existing `bg-sand-gold/10` highlight
- Rate display: if value is `null`, `undefined`, or `0` → show "N/A" instead of "0.00%" or "---" (replaces current dash-based null handling)
- Replace existing raw `<Card>` advisory section with `<InsightCard layout="full-width">` (MortgageRates currently does NOT use InsightCard — must add import and replace)

## Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Sand Gold | `#C4A96A` | Badges, gold borders, dividers |
| Sage | `#7C8B6E` | Key mortgage row borders |
| Warm White | `#FAF8F5` | Odd section backgrounds |
| Cream | `#F2EDE4` | Even section backgrounds, cards |
| Charcoal | `#2D3234` | Body text |
| Warm Gray | `#6B7178` | Secondary text, pills |
| Horizon Blue | `#4A7F8B` | Primary chart color |
| Shadow Card | `0 2px 8px rgba(45,50,52,0.10)` | Card elevation |

## DO NOT

- Change any data queries or Supabase logic (exception: adding `percent_mom` to ConstructionCosts select)
- Modify chart data or calculations
- Add financial advice language
- Remove source citations
- Break the currency toggle functionality
- Remove the WhatsApp share button
- Add data disclaimers or speculative notes about data artifacts
