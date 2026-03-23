import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Send, Compass, Plus, Users, Laptop, Building, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import SEO from "@/components/SEO";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  { text: "We're making aliyah with young kids — where should we look?", icon: Users },
  { text: "I work in tech and want to be near Tel Aviv but can't afford it", icon: Laptop },
  { text: "Looking for a religious Anglo community on a ₪2.5M budget", icon: Building },
  { text: "What's the difference between Ra'anana and Modi'in for families?", icon: Sun },
];

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Simple city mention detection for logging
function detectCitiesInMessages(
  messages: Message[],
  cityNames: string[],
): string[] {
  const allUserText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  return cityNames.filter((name) => allUserText.includes(name.toLowerCase()));
}

// Non-blocking conversation log — fire-and-forget
function logConversation(
  sessionId: string,
  messages: Message[],
  starterPrompt: string | null,
  citiesMentioned: string[],
) {
  supabase
    .from("advisor_conversations")
    .upsert(
      {
        session_id: sessionId,
        messages: messages as any,
        cities_mentioned: citiesMentioned,
        starter_prompt_used: starterPrompt,
        message_count: messages.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    )
    .then(() => {})
    .catch(() => {});
}

const AdvisorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  // Conversation logging state
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [starterPromptUsed, setStarterPromptUsed] = useState<string | null>(null);
  const [cityNames, setCityNames] = useState<string[]>([]);

  // Fetch lightweight city name list for logging
  useEffect(() => {
    supabase
      .from("city_profiles")
      .select("city_name")
      .then(({ data }) => {
        if (data) setCityNames(data.map((d) => d.city_name));
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

        // Log conversation after streaming completes
        setMessages((prev) => {
          const mentioned = detectCitiesInMessages(prev, cityNames);
          logConversation(sessionId, prev, starterPromptUsed, mentioned);
          return prev;
        });
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
    [messages, isLoading, cityNames, sessionId, starterPromptUsed],
  );

  // Auto-send pre-loaded question from URL
  useEffect(() => {
    if (initialSent.current) return;
    const q = searchParams.get("q");
    if (q) {
      initialSent.current = true;
      setSearchParams({}, { replace: true });
      sendMessage(q);
    }
  }, [searchParams, sendMessage, setSearchParams]);

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
    setStarterPromptUsed(prompt);
    sendMessage(prompt);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInput("");
    setSessionId(generateSessionId());
    setStarterPromptUsed(null);
    initialSent.current = false;
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
        description="AI-powered city recommendations for English speakers in Israel. Describe your budget, family, and lifestyle to get personalized real estate suggestions."
      />
      <NavBar />

      <main
        id="main-content"
        className="flex-1 flex flex-col min-h-0"
      >
        {showWelcome ? (
          /* ── Empty state ── */
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(124,139,110,0.10) 0%, rgba(124,139,110,0.03) 60%, #FAF8F5 100%), linear-gradient(180deg, rgba(196,169,106,0.06) 0%, rgba(242,237,228,0.03) 40%, #FAF8F5 100%)",
            }}
          >
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(124,139,110,0.18) 1.2px, transparent 1.2px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10 container max-w-xl pt-20 md:pt-20 pb-12 flex flex-col items-center text-center">
              {/* Compass icon */}
              <div className="w-[68px] h-[68px] rounded-full bg-sage/15 flex items-center justify-center mb-5">
                <Compass className="w-12 h-12 text-sage" />
              </div>

              {/* AI-Powered badge */}
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[#996F33] mb-1">
                AI-Powered
              </span>

              {/* Heading */}
              <h1 className="font-heading font-bold text-[26px] md:text-[32px] text-charcoal leading-tight">
                Ask our AI advisor about any city in Israel
              </h1>
              <p className="mt-3 font-body text-[15px] md:text-[16px] text-warm-gray max-w-md leading-relaxed">
                Describe your situation — budget, family size, lifestyle,
                priorities — and get personalized city recommendations based
                on real CBS data.
              </p>

              {/* Starter pills — 2×2 grid */}
              <div className="mt-8 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map(({ text, icon: Icon }) => (
                  <button
                    key={text}
                    onClick={() => handleStarterClick(text)}
                    disabled={isLoading}
                    className="group flex items-start gap-2 px-5 py-4 bg-cream rounded-xl shadow-card font-body text-[15px] text-charcoal text-left transition-all duration-200 hover:shadow-[0_4px_16px_rgba(45,50,52,0.10)] hover:border-l-4 hover:border-l-sage hover:-translate-y-0.5 border-l-4 border-l-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="w-[18px] h-[18px] text-sage flex-shrink-0 mt-0.5" />
                    {text}
                  </button>
                ))}
              </div>

              {/* Input bar — part of the flow, not pinned */}
              <form onSubmit={handleSubmit} className="mt-6 w-full flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about cities, neighborhoods, costs..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-grid-line bg-white px-4 py-3 font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 disabled:opacity-50 min-h-[48px] max-h-32 shadow-sm"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-sage text-white hover:bg-[#6A7A5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {/* Disclaimer */}
              <p className="mt-5 font-body text-[12px] text-warm-gray/50 max-w-md leading-relaxed">
                The Advisor provides general information based on public data
                and community insights. It is not financial, legal, or
                immigration advice. Always consult qualified Israeli
                professionals for important decisions.
              </p>
            </div>
          </div>
        ) : (
          /* ── Active chat state ── */
          <>
            {/* Chat header */}
            <div className="border-b border-grid-line bg-white/80 backdrop-blur-md">
              <div className="container max-w-2xl py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sage/15 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-sage" />
                  </div>
                  <span className="font-heading font-semibold text-[16px] text-charcoal">
                    Navlan Advisor
                  </span>
                </div>
                <button
                  onClick={handleNewConversation}
                  className="flex items-center gap-1.5 font-body text-[14px] text-warm-gray hover:text-sage transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New conversation
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-2xl py-6 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sage/15 flex items-center justify-center mt-1 mr-2">
                        <Compass className="w-3.5 h-3.5 text-sage" />
                      </div>
                    )}
                    <div
                      className={`${
                        msg.role === "user"
                          ? "max-w-[75%] bg-sage text-white rounded-[12px] rounded-br-[4px] px-4 py-3"
                          : "max-w-[80%] bg-cream text-charcoal rounded-[12px] rounded-bl-[4px] px-4 py-3"
                      }`}
                      onClick={msg.role === "assistant" ? handleMarkdownClick : undefined}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none font-body text-[15px] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:text-horizon-blue [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                            {msg.content || "\u2026"}
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
                  <div className="flex justify-start" role="status" aria-label="Advisor is thinking">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sage/15 flex items-center justify-center mt-1 mr-2">
                      <Compass className="w-3.5 h-3.5 text-sage" />
                    </div>
                    <div className="bg-cream rounded-[12px] rounded-bl-[4px] px-4 py-3">
                      <span className="sr-only">Advisor is typing...</span>
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

            {/* Sticky input bar */}
            <div className="sticky bottom-0 bg-white border-t border-grid-line/60 shadow-[0_-2px_8px_rgba(45,50,52,0.04)]">
              <form
                onSubmit={handleSubmit}
                className="container max-w-2xl py-4 flex gap-2 items-end"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about cities, neighborhoods, costs..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-grid-line bg-white px-4 py-3 font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 min-h-[48px] max-h-32"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-sage text-white hover:bg-sage/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdvisorPage;
