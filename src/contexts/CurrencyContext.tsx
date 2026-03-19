import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type CurrencySymbol = "₪" | "$" | "€";

interface CurrencyContextValue {
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  rates: { USD: number; EUR: number };
  formatPrice: (nisThousands: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const currencyToCode: Record<CurrencySymbol, string> = {
  "₪": "ILS",
  "$": "USD",
  "€": "EUR",
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencySymbol>(() => {
    const saved = localStorage.getItem("navlan-currency");
    if (saved === "₪" || saved === "$" || saved === "€") return saved;
    return "₪";
  });
  const [rates, setRates] = useState({ USD: 3.688, EUR: 3.846 });

  const setCurrency = (c: CurrencySymbol) => {
    setCurrencyState(c);
    localStorage.setItem("navlan-currency", c);
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await supabase
          .from("exchange_rates")
          .select("currency, rate")
          .in("currency", ["USD", "EUR"])
          .order("rate_date", { ascending: false })
          .limit(2);

        if (data && data.length > 0) {
          const usd = data.find((r) => r.currency === "USD");
          const eur = data.find((r) => r.currency === "EUR");
          setRates({
            USD: usd?.rate ?? 3.688,
            EUR: eur?.rate ?? 3.846,
          });
        }
      } catch {
        // keep defaults
      }
    };
    fetchRates();
  }, []);

  const formatPrice = (nisThousands: number) => {
    const code = currencyToCode[currency];
    const value = code === "ILS" ? nisThousands : nisThousands / (code === "USD" ? rates.USD : rates.EUR);
    const symbol = currency;
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(2).replace(/\.?0+$/, "")}M`;
    }
    return `${symbol}${Math.round(value).toLocaleString()}K`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
