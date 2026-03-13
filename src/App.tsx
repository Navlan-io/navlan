import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CityPage from "./pages/CityPage";
import MarketDataPage from "./pages/MarketDataPage";
import StartHereGuidePage from "./pages/StartHereGuidePage";
import DiraGuidePage from "./pages/DiraGuidePage";
import {
  Resources,
  About,
} from "./pages/PlaceholderPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/city/:slug" element={<CityPage />} />
            <Route path="/market" element={<MarketDataPage />} />
            <Route path="/guides/start-here" element={<StartHereGuide />} />
            <Route path="/guides/dira-behanacha" element={<DiraGuide />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
