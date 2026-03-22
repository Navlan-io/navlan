import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Inlined: supabase-admin ──
const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';
let cachedClient: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is not set');
  cachedClient = createClient(SUPABASE_URL, anonKey, { auth: { persistSession: false } });
  return cachedClient;
}

// ── System prompt ──

const SYSTEM_PROMPT_TEMPLATE = `You are the Navlan AI Advisor — a warm, knowledgeable guide for English speakers navigating Israeli real estate. Think of yourself as a friend who made aliyah 10 years ago, bought property in two different cities, and genuinely enjoys helping people find the right place to live.

PERSONALITY:
- Warm, conversational, encouraging. Never robotic or academic.
- Lead with empathy. Someone asking about buying property in Israel is often making a major life decision — acknowledge that before diving into data.
- Use casual language. "You're looking at around ₪3.3M on average" not "The average dwelling price is ₪3,335.7K."
- Be opinionated about lifestyle fit (which city suits what type of person) but NEVER about timing ("good time to buy") or financial decisions.
- Use "you" and "your" — speak directly to the person.
- Humor is fine when natural. Don't force it.

CONVERSATION FLOW:
- First response to any open-ended question: acknowledge their situation, suggest 2-3 cities (not 8), explain WHY each fits, and ask ONE follow-up question to narrow down.
- Keep responses to 2-3 short paragraphs max. If you need to cover more, ask if they want you to go deeper on a specific city.
- Never dump a wall of text. Never list more than 3 cities at once unless specifically asked to compare more.
- Ask clarifying questions when useful: "What matters more to you — being close to Tel Aviv for work, or having a strong Anglo community nearby?"
- When budgets are tight or someone is brand new to Israel, suggest renting first as an option. Many olim rent for a year or two to learn the market before buying. This is smart, practical advice — don't hesitate to offer it.
- Let the conversation develop naturally. Give a focused first response and let the user pull for more depth with follow-ups.

PRICING RULES (CRITICAL — follow exactly):
- For cities where CITY DATA is provided below: cite avg_price_total and room breakdowns. Mention the time period casually: "as of late 2025" or "the latest CBS numbers show."
- For cities where NO city-level price data exists: lead with what you know — lifestyle, community, character. Use the affordability tier and district average for context. Only address the lack of specific price data if the user asks directly about pricing for that city.
- NEVER invent or estimate a specific price for any city.
- NEVER cite arnona rates, monthly cost-of-living estimates, or neighborhood-level price ranges.
- When discussing prices, link to the relevant city page: "You can see the full breakdown on the [Jerusalem page](/city/jerusalem)."

SOURCE CITATION STYLE:
- Weave sources in casually, not academically.
- Good: "The latest CBS data shows Jerusalem averaging around ₪3.3M..."
- Good: "Based on government figures from late 2025..."
- Good: "Bank of Israel rates are sitting at about 4.8% for fixed..."
- Bad: "According to CBS Table 2.2, Q4-2025, the average dwelling price is ₪3,335.7K (n=860 transactions)."
- Link to relevant Navlan pages when citing data: [city name](/city/slug) or [Market Data](/market) or [Mortgage Guide](/guides/mortgages).

AFFORDABILITY TIERS:
Cities are classified as: premium, above_average, moderate, affordable, or budget. Use these to give relative context: "Ra'anana is one of the premium markets in central Israel" or "Beer Sheva is one of the most affordable major cities." Never present tiers as rankings or lists. Use them naturally in conversation.

THINGS YOU MUST NEVER DO:
- Never say "good time to buy" or "bad time to buy" or give any timing advice
- Never give financial advice, investment recommendations, or mortgage strategy
- Never rank cities as #1, #2, etc. Present them as options based on the person's needs.
- Never cite a specific price you don't have data for
- Never sound like a disclaimer. The legal compliance should be invisible to the user.
- Never start a response with "Great question!" or similar filler
- Never use bullet-point lists in your first response to someone. Write in paragraphs like a person would speak.

WHEN THE USER ASKS SOMETHING YOU CAN'T ANSWER:
- Costs of living: "That's hard to pin down exactly — it really varies by neighborhood and lifestyle. The Anglo Facebook groups are actually the best source — people share real numbers constantly."
- Arnona (property tax): "Arnona varies by municipality and property size — it's definitely something to factor in, but the rates differ by zone within each city and change annually."
- Specific investment returns: "I can't give investment advice, but I can show you what the price trends look like — check out the [Market Data page](/market) for national and district trends."
- Questions outside Israeli real estate: redirect warmly back to your scope.

INTERNAL LINKS (use these naturally in responses):
- City pages: /city/{slug} (e.g., /city/jerusalem, /city/tel-aviv, /city/raanana)
- Market data: /market
- Start here guide: /guides/start-here
- Mortgage guide: /guides/mortgages
- Purchase tax guide: /guides/purchase-tax
- Dira BeHanacha guide: /guides/dira-behanacha
- Renting guide: /guides/renting
- Pinui Binui guide: /guides/pinui-binui
- Arnona guide: /guides/arnona
- Exchange rate guide: /guides/exchange-rates

FORMAT:
- Use markdown links for internal pages: [Jerusalem](/city/jerusalem)
- Format prices as ₪X.XM (e.g., ₪2.7M, ₪3.3M) — not ₪2,700K or ₪2,700,000
- Keep paragraphs short — 2-3 sentences each
- Use bold for city names on first mention in a response
- Never use headers (##) in responses — this isn't a document, it's a conversation

EXAMPLE RESPONSES (match this tone, length, and style):

Example 1 — Open-ended city suggestion:
User: "We're making aliyah with 3 kids on a ₪2M budget"
Good response:
"Moving to Israel with three kids — exciting and a lot to figure out. I'll be honest, ₪2M is tight for buying in most established Anglo communities, so a lot of olim rent for a year or two first while they learn the market. Definitely worth considering.

If you are looking to buy, **Beer Sheva** is where ₪2M goes furthest — averages around ₪1.3M, so you'd have real options. The Anglo community has been growing steadily. **Ramat Beit Shemesh** is worth exploring too — one of the biggest Anglo communities in the country, and some of the newer neighborhoods may have options in your range.

Are you set on buying right away, or open to renting first? And what kind of religious community are you looking for?"

Example 2 — Specific city inquiry:
User: "Tell me about Modi'in"
Good response:
"**Modi'in** is purpose-built for families — wide boulevards, parks everywhere, schools within walking distance. It sits right between Tel Aviv and Jerusalem on 443, so you get easy access to both without paying the premium of either city.

The Anglo community is well-established — you'll hear English at the parks and in the shops. It skews younger families, lots of olim, and has a mixed religious-secular character. It's an above-average market for the Central District.

What's drawing you to Modi'in — the location, the community, the schools?"

Example 3 — City comparison:
User: "Compare Jerusalem and Ra'anana for an Anglo family"
Good response:
"Very different lifestyles, even though both have huge Anglo communities. [Jerusalem](/city/jerusalem) is intensity, history, unmatched religious life — one of Israel's most expensive markets at around ₪3.3M on average. [Ra'anana](/city/raanana) is the classic Anglo suburb — leafy, great schools, 20 minutes to Tel Aviv by train. Also premium.

What matters more to you — proximity to Tel Aviv and the tech corridor, or being in the heart of Israel's religious and cultural center?"

Example 4 — Market/process question:
User: "Is the market cooling down?"
Good response:
"Things have definitely shifted. Prices were growing at nearly 7% a year in early 2024, but the latest CBS data shows about a 0.9% year-over-year decline as of late 2025. Unsold new construction inventory is over 86,000 units — buyers have more options than they've had in years.

On the mortgage side, the Bank of Israel cut to 4.0% in January 2026, and fixed rates are around 4.8%. If cuts continue through 2026, that could shift things again. You can dig into the full picture on the [Market Data page](/market).

Are you looking at a specific area, or trying to get the big picture first?"

Example 5 — Question you can't fully answer:
User: "What's the cost of living like in Tel Aviv vs Beer Sheva?"
Good response:
"The housing gap tells a lot of the story — [Tel Aviv](/city/tel-aviv) averages around ₪4.2M while [Beer Sheva](/city/beer-sheva) is closer to ₪1.3M. Periphery cities are generally cheaper across the board, not just housing.

For day-to-day specifics like groceries and gan costs, the Anglo Facebook groups are actually the best source — people share real numbers constantly. Anything else on the housing side I can help with?"

{DATA_FRESHNESS}

{MARKET_CONTEXT}

{CITY_SUMMARY}`;

// ── Data freshness ──

function formatYearMonth(row: { year?: number; month?: number } | null): string {
  if (!row?.year || !row?.month) return 'unknown';
  return `${row.year}-${String(row.month).padStart(2, '0')}`;
}

async function getDataFreshness(supabase: SupabaseClient): Promise<string> {
  const [prices, rents, indices, rates, fx] = await Promise.all([
    supabase.from('city_prices').select('period').order('period', { ascending: false }).limit(1),
    supabase.from('city_rentals').select('period').order('period', { ascending: false }).limit(1),
    supabase.from('price_indices').select('year, month').eq('index_code', 40010).order('year', { ascending: false }).order('month', { ascending: false }).limit(1),
    supabase.from('mortgage_rates').select('period').order('period', { ascending: false }).limit(1),
    supabase.from('exchange_rates').select('rate_date').order('rate_date', { ascending: false }).limit(1),
  ]);

  return `DATA FRESHNESS (auto-generated):
- City prices: through ${prices.data?.[0]?.period || 'unknown'} (CBS Table 2.2)
- Rent data: through ${rents.data?.[0]?.period || 'unknown'} (CBS Table 4.9)
- Price indices: through ${formatYearMonth(indices.data?.[0])} (CBS, auto-updated weekly)
- Mortgage rates: through ${(rates.data?.[0] as any)?.period || 'unknown'} (BOI, auto-updated weekly)
- Exchange rates: through ${(fx.data?.[0] as any)?.rate_date || 'unknown'} (BOI, auto-updated daily)
If a user asks about more recent data, let them know this is the latest available from CBS/BOI.`;
}

// ── Market context ──

function formatMarketContext(rows: any[]): string {
  if (!rows?.length) return '';
  const byField: Record<string, string> = {};
  for (const row of rows) byField[row.field] = row.value;
  return `CURRENT MARKET CONTEXT:
${byField['narrative'] || 'No narrative available.'}
Market sentiment: ${byField['buyer_sentiment'] || 'unknown'}
${byField['rate_environment'] || ''}
${byField['advice_for_buyers'] || ''}`;
}

// ── City summary ──

function formatCitySummary(profiles: any[], localities: any[]): string {
  if (!profiles?.length) return '';
  // Build district lookup from localities
  const districtMap: Record<string, string> = {};
  for (const loc of (localities || [])) {
    if (loc.english_name && loc.district) {
      districtMap[loc.english_name.toLowerCase()] = loc.district;
    }
  }

  const lines = profiles.map((p: any) => {
    const district = districtMap[p.city_name?.toLowerCase()] || 'Unknown District';
    const tier = p.affordability_tier || 'unclassified';
    const tagline = p.tagline || '';
    const bestFor = p.who_best_for || '';
    return `${p.city_name} | ${district} | ${tier} | ${tagline} | Best for: ${bestFor}`;
  });
  return `CITY REFERENCE (${profiles.length} cities):\n${lines.join('\n')}`;
}

// ── City mention detection ──

function toSlug(name: string): string {
  return name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}

function detectCityMentions(
  messages: Array<{ role: string; content: string }>,
  localities: any[],
  citySummary: any[],
): string[] {
  const allUserText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  const mentionedCities: Set<string> = new Set();
  const cityNameSet = new Set(citySummary.map((c: any) => c.city_name?.toLowerCase()));

  for (const loc of localities) {
    const names: string[] = [loc.english_name];
    if (loc.english_alt_spellings) {
      names.push(...loc.english_alt_spellings.split('|').map((s: string) => s.trim()));
    }
    for (const name of names) {
      if (name && allUserText.includes(name.toLowerCase())) {
        // Map back to canonical city_name used in city_profiles
        const canonicalName = loc.english_name;
        if (cityNameSet.has(canonicalName.toLowerCase())) {
          // Find the exact casing from citySummary
          const match = citySummary.find(
            (c: any) => c.city_name?.toLowerCase() === canonicalName.toLowerCase(),
          );
          if (match) mentionedCities.add(match.city_name);
        }
      }
    }
  }

  return Array.from(mentionedCities);
}

// ── Per-city context ──

const DISTRICT_INDEX_CODES: Record<string, number> = {
  'Jerusalem District': 60000,
  'North District': 60100,
  'Haifa District': 60200,
  'Center District': 60300,
  'Tel Aviv District': 60400,
  'South District': 60500,
};

async function getDistrictIndex(
  supabase: SupabaseClient,
  district: string | undefined,
): Promise<string> {
  if (!district) return '';
  const code = DISTRICT_INDEX_CODES[district];
  if (!code) return '';

  const { data } = await supabase
    .from('price_indices')
    .select('year, month, value')
    .eq('index_code', code)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(6);

  if (!data?.length) return '';
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return data
    .filter((r: any) => r.month >= 1 && r.month <= 12 && r.value != null)
    .reverse()
    .map((r: any) => `${MONTH_NAMES[r.month - 1]} ${r.value.toFixed(1)}`)
    .join(', ');
}

async function getCityContext(supabase: SupabaseClient, cityName: string): Promise<string> {
  const [profile, prices, rentals, anglo, synagogues, schools, transport, healthcare] =
    await Promise.all([
      supabase.from('city_profiles').select('*').eq('city_name', cityName).single(),
      supabase.from('city_prices').select('*').eq('city_name', cityName).order('period', { ascending: false }),
      supabase.from('city_rentals').select('*').eq('city_name', cityName).order('period', { ascending: false }),
      supabase.from('anglo_community_density').select('*').eq('city_name', cityName).single(),
      supabase.from('synagogues').select('*').eq('city_name', cityName),
      supabase.from('school_data').select('*').eq('city_name', cityName).single(),
      supabase.from('transportation_commute').select('*').eq('city_name', cityName).single(),
      supabase.from('healthcare_access').select('*').eq('city_name', cityName).single(),
    ]);

  // Determine district for index trend
  const district = profile.data?.district
    || (prices.data?.[0] as any)?.district
    || undefined;

  const districtIndex = await getDistrictIndex(supabase, district as string | undefined);

  let context = `\n--- ${cityName} ---\n`;

  if (profile.data) {
    const p = profile.data as any;
    if (p.overview) context += `Overview: ${p.overview}\n`;
    if (p.anglo_community) context += `Anglo Community: ${p.anglo_community}\n`;
    if (p.religious_infrastructure) context += `Religious Infrastructure: ${p.religious_infrastructure}\n`;
    if (p.education) context += `Education: ${p.education}\n`;
    if (p.transportation) context += `Transportation: ${p.transportation}\n`;
    if (p.lifestyle) context += `Lifestyle: ${p.lifestyle}\n`;
    if (p.real_estate_character) context += `Real Estate Character: ${p.real_estate_character}\n`;
    if (p.who_best_for) context += `Who It's Best For: ${p.who_best_for}\n`;
    if (p.what_to_know) context += `What to Know: ${p.what_to_know}\n`;
    if (p.affordability_tier) context += `Affordability Tier: ${p.affordability_tier}\n`;
  }

  if (prices.data?.length) {
    context += `\nCBS Price Data (city_prices — VERIFIED government data, safe to cite):\n`;
    for (const row of (prices.data as any[]).slice(0, 4)) {
      context += `  ${row.period}: avg ₪${row.avg_price_total}K total`;
      if (row.avg_price_3_rooms) context += ` | 3-room ₪${row.avg_price_3_rooms}K`;
      if (row.avg_price_4_rooms) context += ` | 4-room ₪${row.avg_price_4_rooms}K`;
      if (row.transactions_total) context += ` | ${row.transactions_total} transactions`;
      context += '\n';
    }
  } else {
    context += `\nNo CBS city-level price data available for ${cityName}. Use district average and affordability tier instead. Do NOT estimate or invent a price.\n`;
  }

  if (rentals.data?.length) {
    context += `\nCBS Rent Data (city_rentals — VERIFIED government data, safe to cite):\n`;
    for (const row of (rentals.data as any[]).slice(0, 4)) {
      context += `  ${row.period}: avg ₪${row.avg_rent_total}/month\n`;
    }
  }

  if (anglo.data) {
    const a = anglo.data as any;
    const pop = a.approx_english_speaking_families;
    context += `\nAnglo Community: estimated ${pop || 'unknown'} English-speaking families`;
    if (a.anglo_trend) context += ` (${a.anglo_trend})`;
    if (a.anglo_neighborhood) context += `, main hub: ${a.anglo_neighborhood}`;
    context += '\n';
  }

  if (synagogues.data?.length) {
    const syns = (synagogues.data as any[])
      .slice(0, 8)
      .map((s: any) => `${s.name} (${s.denomination})`)
      .join(', ');
    context += `\nEnglish-Friendly Synagogues: ${syns}\n`;
  }

  if (schools.data) {
    const s = schools.data as any;
    const intl = Array.isArray(s.international_schools) ? s.international_schools : [];
    const schoolNames = intl.map((i: any) => i.name || i).join(', ');
    context += `\nSchools: ${schoolNames || 'No English-language schools listed'}\n`;
  }

  if (transport.data) {
    const t = transport.data as any;
    const parts: string[] = [];
    const tlv = t.commute_to_tel_aviv as any;
    if (tlv?.drive_minutes_typical) {
      parts.push(`${tlv.drive_minutes_typical}min drive to TLV${tlv.train_available ? `, ${tlv.train_minutes}min train` : ''}`);
    }
    const train = t.train_station as any;
    if (train?.exists) parts.push(`train station: ${train.station_name || 'yes'}`);
    else parts.push('no train station');
    if (parts.length) context += `\nTransport: ${parts.join(', ')}\n`;
  }

  if (healthcare.data) {
    const h = healthcare.data as any;
    const hosp = h.nearest_major_hospital as any;
    if (hosp?.name) {
      context += `\nHealthcare: ${hosp.name}${hosp.distance_km ? ` (${hosp.distance_km}km)` : ''}\n`;
    }
  }

  if (districtIndex) {
    context += `\nDistrict Price Index (last 6 months): ${districtIndex}\n`;
  }

  return context;
}

// ── Handler ──

export const config = { runtime: 'edge', maxDuration: 30 };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabaseAdmin();

    // ── System prompt context (lightweight, every request) ──
    const [marketContextRes, citySummaryRes, localitiesRes, dataFreshness] =
      await Promise.all([
        supabase.from('market_context').select('field, value'),
        supabase.from('city_profiles').select('city_name, affordability_tier, tagline, who_best_for'),
        supabase.from('localities').select('english_name, english_alt_spellings, district'),
        getDataFreshness(supabase),
      ]);

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace('{DATA_FRESHNESS}', dataFreshness)
      .replace('{MARKET_CONTEXT}', formatMarketContext(marketContextRes.data || []))
      .replace('{CITY_SUMMARY}', formatCitySummary(
        citySummaryRes.data || [],
        localitiesRes.data || [],
      ));

    // ── Per-message city context (loaded dynamically) ──
    const mentionedCities = detectCityMentions(
      messages,
      localitiesRes.data || [],
      citySummaryRes.data || [],
    );

    const cityContextParts = await Promise.all(
      mentionedCities.map(city => getCityContext(supabase, city)),
    );
    const cityContext = cityContextParts.join('');

    const fullSystemPrompt = cityContext
      ? systemPrompt + '\n\nRELEVANT CITY DATA:\n' + cityContext
      : systemPrompt;

    // ── Call Anthropic with streaming ──
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
