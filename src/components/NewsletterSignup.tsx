import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewsletterSignupProps {
  source: "footer" | "about" | "homepage" | "guide" | "city" | "market";
  /** "dark" for footer (white text on dark bg), "light" for cream/white sections */
  variant?: "dark" | "light";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterSignup = ({ source, variant = "light" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers" as any)
        .insert([{ email: trimmed, source }] as any);

      if (error) {
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          toast.info("You're already subscribed!");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.success("You're in! Watch for The Navlan Report in your inbox.");
        setEmail("");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubscribe();
  };

  if (variant === "dark") {
    return (
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 min-w-0 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-body text-[14px] placeholder:text-white/40 focus:outline-none focus:border-sage transition-colors disabled:opacity-50"
        />
        <Button
          size="default"
          className="min-h-[48px] shrink-0 bg-sand-gold hover:bg-sand-gold/90 text-white"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="Your email"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="flex-1 h-11 px-4 rounded-lg bg-cream border border-grid-line font-body text-[14px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-sage transition-colors disabled:opacity-50"
      />
      <Button
        className="bg-sage hover:bg-sage/90 text-white"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </Button>
    </div>
  );
};

export default NewsletterSignup;
