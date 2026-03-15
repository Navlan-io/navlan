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
import GuidesIndexPage from "./pages/GuidesIndexPage";
import StartHereGuidePage from "./pages/StartHereGuidePage";
import DiraGuidePage from "./pages/DiraGuidePage";
import ResourcesPage from "./pages/ResourcesPage";
import AboutPage from "./pages/AboutPage";
import { DisclaimerPage, PrivacyPage, TermsPage } from "./pages/LegalPage";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-charcoal focus:rounded-lg focus:shadow-lg focus:font-body focus:text-sm"
          >
            Skip to main content
          </a>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/city/:slug" element={<CityPage />} />
            <Route path="/market" element={<MarketDataPage />} />
            <Route path="/guides" element={<GuidesIndexPage />} />
            <Route path="/guides/start-here" element={<StartHereGuidePage />} />
            <Route path="/guides/dira-behanacha" element={<DiraGuidePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
