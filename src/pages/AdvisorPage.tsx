import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import SEO from "@/components/SEO";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "We're making aliyah with kids — where should we look?",
  "Best areas for a young tech professional?",
  "Religious Anglo community on a budget?",
  "Retiring to Israel — what are our options?",
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
}

async function fetchCityContext(): Promise<string> {
  const [
    profilesRes, pricesRes, rentalsRes,
    neighborhoodsRes, arnonaRes, schoolsRes, synagoguesRes,
    angloRes, colRes, transportRes, safetyRes,
    healthcareRes, aliyahRes,
  ] = await Promise.all([
    supabase
      .from("city_profiles")
      .select("city_name, tagline, overview, anglo_community, religious_infrastructure, education, lifestyle, real_estate_character, who_best_for, what_to_know, costs_of_living, transportation, tier"),
    supabase
      .from("city_prices")
      .select("city_name, period, avg_price_total, avg_price_3_rooms, avg_price_4_rooms, avg_price_5_rooms")
      .not("city_name", "eq", "Total")
      .order("period", { ascending: false }),
    supabase
      .from("city_rentals")
      .select("city_name, period, avg_rent_total, avg_rent_2_5_3_rooms, avg_rent_3_5_4_rooms, avg_rent_4_5_6_rooms")
      .order("period", { ascending: false }),
    supabase
      .from("neighborhoods")
      .select("city_name, name, price_range_min, price_range_max, anglo_presence, religious_character, vibe, best_for, walkability, commute_to_city_center, new_construction"),
    supabase
      .from("arnona_rates")
      .select("city_name, rate_per_sqm_nis, annual_arnona_100sqm_nis, olim_discount, comparison_to_national_average"),
    supabase
      .from("school_data")
      .select("city_name, international_schools, ulpan_options, notes, confidence"),
    supabase
      .from("synagogues")
      .select("city_name, name, denomination, language_of_services, neighborhood, anglo_programming"),
    supabase
      .from("anglo_community_density")
      .select("city_name, approx_english_speaking_families, anglo_trend, anglo_neighborhood, main_source_countries"),
    supabase
      .from("cost_of_living")
      .select("city_name, grocery_basket_family_of_4_monthly_nis, utilities_100sqm_monthly_nis, public_transit_monthly_pass_nis, childcare_monthly_nis, cost_index_vs_national"),
    supabase
      .from("transportation_commute")
      .select("city_name, commute_to_tel_aviv, commute_to_jerusalem, train_station, light_rail, ben_gurion_airport"),
    supabase
      .from("safety_security")
      .select("city_name, general_security_assessment, security_notes_for_anglos, rocket_threat_level, mamad_prevalence, crime_level"),
    supabase
      .from("healthcare_access")
      .select("city_name, nearest_major_hospital, english_speaking_doctors, kupat_cholim_presence, ambulance_response_estimate"),
    supabase
      .from("aliyah_relocation")
      .select("city_name, misrad_hapnim_office, banks_with_english_service, english_speaking_lawyers, anglo_real_estate_agents, coworking_spaces, climate, quality_of_life_notes"),
  ]);

  let context = "";

  // City profiles
  if (profilesRes.data?.length) {
    context += "=== CITY PROFILES ===\n\n";
    for (const p of profilesRes.data) {
      context += `## ${p.city_name} [Link: /city/${toSlug(p.city_name)}]\n`;
      if (p.tagline) context += `Tagline: ${p.tagline}\n`;
      if (p.overview) context += `Overview: ${p.overview.slice(0, 500)}\n`;
      if (p.anglo_community) context += `Anglo Community: ${p.anglo_community.slice(0, 400)}\n`;
      if (p.religious_infrastructure) context += `Religious Infrastructure: ${p.religious_infrastructure.slice(0, 300)}\n`;
      if (p.education) context += `Education: ${p.education.slice(0, 300)}\n`;
      if (p.lifestyle) context += `Lifestyle: ${p.lifestyle.slice(0, 300)}\n`;
      if (p.real_estate_character) context += `Real Estate: ${p.real_estate_character.slice(0, 300)}\n`;
      if (p.who_best_for) context += `Best For: ${p.who_best_for.slice(0, 300)}\n`;
      if (p.costs_of_living) context += `Costs: ${p.costs_of_living.slice(0, 300)}\n`;
      if (p.transportation) context += `Transportation: ${p.transportation.slice(0, 200)}\n`;
      context += "\n";
    }
  }

  // Latest prices per city (deduplicate to latest period only)
  if (pricesRes.data?.length) {
    context += "=== LATEST PRICES (NIS thousands) ===\n";
    const seen = new Set<string>();
    for (const p of pricesRes.data) {
      if (seen.has(p.city_name)) continue;
      seen.add(p.city_name);
      const parts = [`Period: ${p.period}`];
      if (p.avg_price_total) parts.push(`Avg: ₪${p.avg_price_total}K`);
      if (p.avg_price_3_rooms) parts.push(`3-room: ₪${p.avg_price_3_rooms}K`);
      if (p.avg_price_4_rooms) parts.push(`4-room: ₪${p.avg_price_4_rooms}K`);
      if (p.avg_price_5_rooms) parts.push(`5-room: ₪${p.avg_price_5_rooms}K`);
      context += `${p.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Latest rentals per city
  if (rentalsRes.data?.length) {
    context += "=== LATEST RENTALS (NIS/month) ===\n";
    const seen = new Set<string>();
    for (const r of rentalsRes.data) {
      if (seen.has(r.city_name)) continue;
      seen.add(r.city_name);
      const parts = [`Period: ${r.period}`];
      if (r.avg_rent_total) parts.push(`Avg: ₪${r.avg_rent_total}`);
      if (r.avg_rent_2_5_3_rooms) parts.push(`3-room: ₪${r.avg_rent_2_5_3_rooms}`);
      if (r.avg_rent_3_5_4_rooms) parts.push(`4-room: ₪${r.avg_rent_3_5_4_rooms}`);
      if (r.avg_rent_4_5_6_rooms) parts.push(`5-6 room: ₪${r.avg_rent_4_5_6_rooms}`);
      context += `${r.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Neighborhoods — group by city, compact format
  if (neighborhoodsRes.data?.length) {
    context += "=== NEIGHBORHOODS ===\n";
    const byCity = new Map<string, typeof neighborhoodsRes.data>();
    for (const n of neighborhoodsRes.data) {
      if (!byCity.has(n.city_name)) byCity.set(n.city_name, []);
      byCity.get(n.city_name)!.push(n);
    }
    for (const [city, hoods] of byCity) {
      context += `${city}:\n`;
      for (const n of hoods) {
        const parts = [n.name];
        if (n.price_range_min && n.price_range_max) parts.push(`₪${(n.price_range_min / 1000).toFixed(0)}K-${(n.price_range_max / 1000).toFixed(0)}K`);
        if (n.anglo_presence) parts.push(`Anglo: ${n.anglo_presence}`);
        if (n.religious_character) parts.push(n.religious_character);
        if (n.walkability) parts.push(`Walk: ${n.walkability}`);
        if (n.vibe) parts.push(n.vibe.slice(0, 100));
        context += `  - ${parts.join(" | ")}\n`;
      }
    }
    context += "\n";
  }

  // Arnona rates
  if (arnonaRes.data?.length) {
    context += "=== ARNONA (PROPERTY TAX) RATES ===\n";
    for (const a of arnonaRes.data) {
      const parts = [];
      if (a.rate_per_sqm_nis) parts.push(`₪${a.rate_per_sqm_nis}/sqm`);
      if (a.annual_arnona_100sqm_nis) parts.push(`₪${a.annual_arnona_100sqm_nis}/yr for 100sqm`);
      if (a.comparison_to_national_average) parts.push(a.comparison_to_national_average);
      if (a.olim_discount) parts.push(`Olim: ${a.olim_discount.slice(0, 80)}`);
      context += `${a.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Schools — compact summary
  if (schoolsRes.data?.length) {
    context += "=== SCHOOLS & EDUCATION ===\n";
    for (const s of schoolsRes.data) {
      const intl = Array.isArray(s.international_schools) ? s.international_schools : [];
      const ulpan = Array.isArray(s.ulpan_options) ? s.ulpan_options : [];
      const parts = [];
      if (intl.length) parts.push(`${intl.length} international school(s): ${intl.map((i: { name: string }) => i.name).join(", ")}`);
      if (ulpan.length) parts.push(`Ulpan: ${ulpan.map((u: { name: string }) => u.name).join(", ")}`);
      if (s.notes) parts.push(s.notes.slice(0, 150));
      if (parts.length) context += `${s.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Synagogues — group by city
  if (synagoguesRes.data?.length) {
    context += "=== SYNAGOGUES & RELIGIOUS COMMUNITIES ===\n";
    const byCity = new Map<string, typeof synagoguesRes.data>();
    for (const s of synagoguesRes.data) {
      if (!byCity.has(s.city_name)) byCity.set(s.city_name, []);
      byCity.get(s.city_name)!.push(s);
    }
    for (const [city, syns] of byCity) {
      const summary = syns.slice(0, 5).map((s) => {
        const parts = [s.name];
        if (s.denomination) parts.push(s.denomination);
        if (s.language_of_services) parts.push(s.language_of_services);
        return parts.join(" / ");
      });
      context += `${city}: ${summary.join("; ")}${syns.length > 5 ? ` (+${syns.length - 5} more)` : ""}\n`;
    }
    context += "\n";
  }

  // Anglo community density
  if (angloRes.data?.length) {
    context += "=== ANGLO COMMUNITY ===\n";
    for (const a of angloRes.data) {
      const parts = [];
      if (a.approx_english_speaking_families) parts.push(`~${a.approx_english_speaking_families} families`);
      if (a.anglo_trend) parts.push(`Trend: ${a.anglo_trend}`);
      if (a.anglo_neighborhood) parts.push(`Hub: ${a.anglo_neighborhood}`);
      if (Array.isArray(a.main_source_countries) && a.main_source_countries.length) parts.push(`From: ${a.main_source_countries.join(", ")}`);
      context += `${a.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Cost of living
  if (colRes.data?.length) {
    context += "=== COST OF LIVING ===\n";
    for (const c of colRes.data) {
      const parts = [];
      if (c.grocery_basket_family_of_4_monthly_nis) parts.push(`Groceries: ₪${c.grocery_basket_family_of_4_monthly_nis}/mo`);
      const utils = c.utilities_100sqm_monthly_nis as { total?: number } | null;
      if (utils?.total) parts.push(`Utilities: ₪${utils.total}/mo`);
      if (c.public_transit_monthly_pass_nis) parts.push(`Transit pass: ₪${c.public_transit_monthly_pass_nis}`);
      const child = c.childcare_monthly_nis as { ages_0_3?: number; ages_3_5?: number } | null;
      if (child?.ages_0_3) parts.push(`Daycare 0-3: ₪${child.ages_0_3}/mo`);
      if (c.cost_index_vs_national) parts.push(c.cost_index_vs_national);
      context += `${c.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Transportation
  if (transportRes.data?.length) {
    context += "=== TRANSPORTATION & COMMUTE ===\n";
    for (const t of transportRes.data) {
      const parts = [];
      const tlv = t.commute_to_tel_aviv as { drive_minutes_typical?: number; train_available?: boolean; train_minutes?: number } | null;
      const jlm = t.commute_to_jerusalem as { drive_minutes_typical?: number; train_available?: boolean; train_minutes?: number } | null;
      if (tlv?.drive_minutes_typical) parts.push(`→TLV: ${tlv.drive_minutes_typical}min drive${tlv.train_available ? `, ${tlv.train_minutes}min train` : ""}`);
      if (jlm?.drive_minutes_typical) parts.push(`→JLM: ${jlm.drive_minutes_typical}min drive${jlm.train_available ? `, ${jlm.train_minutes}min train` : ""}`);
      const train = t.train_station as { exists?: boolean; station_name?: string } | null;
      if (train?.exists) parts.push(`Train: ${train.station_name}`);
      const lr = t.light_rail as { exists?: boolean; planned?: boolean } | null;
      if (lr?.exists) parts.push("Light rail: yes");
      else if (lr?.planned) parts.push("Light rail: planned");
      const apt = t.ben_gurion_airport as { drive_minutes?: number } | null;
      if (apt?.drive_minutes) parts.push(`Airport: ${apt.drive_minutes}min`);
      context += `${t.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Safety
  if (safetyRes.data?.length) {
    context += "=== SAFETY & SECURITY ===\n";
    for (const s of safetyRes.data) {
      const parts = [];
      if (s.general_security_assessment) parts.push(s.general_security_assessment);
      if (s.rocket_threat_level) parts.push(`Rockets: ${s.rocket_threat_level}`);
      if (s.crime_level) parts.push(`Crime: ${s.crime_level}`);
      if (s.security_notes_for_anglos) parts.push(s.security_notes_for_anglos.slice(0, 120));
      context += `${s.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Healthcare
  if (healthcareRes.data?.length) {
    context += "=== HEALTHCARE ACCESS ===\n";
    for (const h of healthcareRes.data) {
      const parts = [];
      const hosp = h.nearest_major_hospital as { name?: string; distance_km?: number } | null;
      if (hosp?.name) parts.push(`Hospital: ${hosp.name}${hosp.distance_km ? ` (${hosp.distance_km}km)` : ""}`);
      if (h.english_speaking_doctors) parts.push(`English doctors: ${h.english_speaking_doctors}`);
      if (h.ambulance_response_estimate) parts.push(`Ambulance: ${h.ambulance_response_estimate}`);
      const kupot = Array.isArray(h.kupat_cholim_presence) ? h.kupat_cholim_presence : [];
      if (kupot.length) parts.push(`Kupot: ${kupot.join(", ")}`);
      context += `${h.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  // Aliyah & relocation
  if (aliyahRes.data?.length) {
    context += "=== ALIYAH & RELOCATION SERVICES ===\n";
    for (const a of aliyahRes.data) {
      const parts = [];
      if (a.english_speaking_lawyers) parts.push(`Lawyers: ${a.english_speaking_lawyers}`);
      if (a.anglo_real_estate_agents) parts.push(`Anglo agents: ${a.anglo_real_estate_agents}`);
      const banks = Array.isArray(a.banks_with_english_service) ? a.banks_with_english_service : [];
      if (banks.length) parts.push(`English banks: ${banks.slice(0, 3).join(", ")}`);
      const climate = a.climate as { summer_avg_high_c?: number; winter_avg_low_c?: number; description?: string } | null;
      if (climate?.summer_avg_high_c && climate?.winter_avg_low_c) parts.push(`Climate: ${climate.summer_avg_high_c}°C summer / ${climate.winter_avg_low_c}°C winter`);
      if (a.quality_of_life_notes) parts.push(a.quality_of_life_notes.slice(0, 100));
      context += `${a.city_name}: ${parts.join(" | ")}\n`;
    }
    context += "\n";
  }

  return context;
}

const AdvisorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<string>("");
  const [contextLoaded, setContextLoaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  // Fetch city context on mount
  useEffect(() => {
    fetchCityContext()
      .then((ctx) => {
        setContextData(ctx);
        setContextLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to fetch city context:", err);
        setContextLoaded(true);
      });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = { role: "user", content: trimmed };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      // Add placeholder assistant message for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: contextData,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const data = JSON.parse(jsonStr);
              if (
                data.type === "content_block_delta" &&
                data.delta?.type === "text_delta"
              ) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + data.delta.text,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      } catch (err) {
        console.error("Advisor error:", err);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          };
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, contextData]
  );

  // Auto-send pre-loaded question from URL
  useEffect(() => {
    if (!contextLoaded || initialSent.current) return;
    const q = searchParams.get("q");
    if (q) {
      initialSent.current = true;
      setSearchParams({}, { replace: true });
      sendMessage(q);
    }
  }, [contextLoaded, searchParams, sendMessage, setSearchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStarterClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // Intercept internal link clicks in markdown
  const handleMarkdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        navigate(href);
      }
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-warm-white via-cream/30 to-sage/5">
      <SEO
        title="AI Real Estate Advisor for English Speakers in Israel | Navlan.io"
        description="Get personalized city and neighborhood recommendations from our AI advisor. Tell us about your situation and we'll suggest the best areas in Israel for English speakers."
      />
      <NavBar />

      <main
        id="main-content"
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-2xl py-6 md:py-10 space-y-4">
            {showWelcome && (
              <div className="flex flex-col items-center text-center pt-8 md:pt-16 pb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage/20 to-sand-gold/20 flex items-center justify-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage/40 to-sand-gold/30" />
                </div>
                <h1 className="font-heading font-bold text-[28px] md:text-[36px] text-charcoal leading-tight">
                  Ask our AI advisor about any city in Israel
                </h1>
                <p className="mt-3 font-body text-[16px] md:text-[18px] text-warm-gray max-w-md leading-relaxed">
                  Describe your situation — budget, family size, lifestyle,
                  priorities — and get personalized city recommendations based
                  on real CBS data.
                </p>

                {/* Starter pills */}
                <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-lg">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarterClick(prompt)}
                      disabled={isLoading || !contextLoaded}
                      className="px-5 py-3 bg-white/80 backdrop-blur-sm border border-grid-line rounded-xl shadow-card font-body text-[15px] text-charcoal hover:border-sage hover:text-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Disclaimer */}
                <p className="mt-6 font-body text-[12px] text-warm-gray/50 max-w-md leading-relaxed">
                  The Advisor provides general information based on public data
                  and community insights. It is not financial, legal, or
                  immigration advice. Always consult qualified Israeli
                  professionals for important decisions.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[640px] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-white shadow-card text-charcoal"
                      : "bg-sage/15 backdrop-blur-sm text-charcoal border border-sage/10"
                  }`}
                  onClick={msg.role === "assistant" ? handleMarkdownClick : undefined}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none font-body text-[15px] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:text-sage [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1">
                      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                        {msg.content || "…"}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-body text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-sage/8 backdrop-blur-sm border border-sage/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="sticky bottom-0 border-t border-grid-line bg-white/80 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="container max-w-2xl py-3 flex gap-2 items-end"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                contextLoaded
                  ? "Ask about cities, neighborhoods, costs..."
                  : "Loading city data..."
              }
              disabled={!contextLoaded}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-grid-line bg-white/90 px-4 py-3 font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 disabled:opacity-50 min-h-[48px] max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !contextLoaded}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-sage text-white hover:bg-sage/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdvisorPage;
