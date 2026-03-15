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
  const [profilesRes, pricesRes, rentalsRes] = await Promise.all([
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
      const assistantIndex = newMessages.length;
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
                  updated[assistantIndex] = {
                    ...updated[assistantIndex],
                    content:
                      updated[assistantIndex].content + data.delta.text,
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
          updated[assistantIndex] = {
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
    <div className="min-h-screen flex flex-col bg-warm-white">
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
                <h1 className="font-heading font-bold text-[28px] md:text-[36px] text-charcoal leading-tight">
                  AI Real Estate Advisor
                </h1>
                <p className="mt-3 font-body text-[16px] md:text-[18px] text-warm-gray max-w-md leading-relaxed">
                  Tell me about your situation and I'll suggest cities and
                  neighborhoods that match your needs.
                </p>

                {/* Starter pills */}
                <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarterClick(prompt)}
                      disabled={isLoading || !contextLoaded}
                      className="px-4 py-2.5 bg-white border border-grid-line rounded-full font-body text-[14px] text-charcoal hover:border-sage hover:text-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Disclaimer */}
                <p className="mt-6 font-body text-[12px] text-warm-gray/70 max-w-md leading-relaxed">
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
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-white shadow-card text-charcoal"
                      : "bg-cream text-charcoal"
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
                <div className="bg-cream rounded-2xl px-4 py-3">
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
        <div className="sticky bottom-0 border-t border-grid-line bg-warm-white">
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
              className="flex-1 resize-none rounded-xl border border-grid-line bg-white px-4 py-3 font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 disabled:opacity-50 min-h-[48px] max-h-32"
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
