import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ScrollToTop from "./components/ScrollToTop";
import { usePageView } from "./hooks/usePageView";

// Lazy-loaded page components
const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const CityPage = React.lazy(() => import("./pages/CityPage"));
const MarketDataPage = React.lazy(() => import("./pages/MarketDataPage"));
const GuidesIndexPage = React.lazy(() => import("./pages/GuidesIndexPage"));
const StartHereGuidePage = React.lazy(() => import("./pages/StartHereGuidePage"));
const DiraGuidePage = React.lazy(() => import("./pages/DiraGuidePage"));
const MortgageGuidePage = React.lazy(() => import("./pages/MortgageGuidePage"));
const PurchaseTaxGuidePage = React.lazy(() => import("./pages/PurchaseTaxGuidePage"));
const PinuiBinuiGuidePage = React.lazy(() => import("./pages/PinuiBinuiGuidePage"));
const RentingGuidePage = React.lazy(() => import("./pages/RentingGuidePage"));
const ArnonaGuidePage = React.lazy(() => import("./pages/ArnonaGuidePage"));
const ExchangeRateGuidePage = React.lazy(() => import("./pages/ExchangeRateGuidePage"));
const ResourcesPage = React.lazy(() => import("./pages/ResourcesPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const DisclaimerPage = React.lazy(() => import("./pages/LegalPage").then(m => ({ default: m.DisclaimerPage })));
const PrivacyPage = React.lazy(() => import("./pages/LegalPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import("./pages/LegalPage").then(m => ({ default: m.TermsPage })));
const AdvisorPage = React.lazy(() => import("./pages/AdvisorPage"));
const CitiesPage = React.lazy(() => import("./pages/CitiesPage"));
const MortgageCalculatorPage = React.lazy(() => import("./pages/MortgageCalculatorPage"));
const ProvidersDirectoryPage = React.lazy(() => import("./pages/ProvidersDirectoryPage"));
const ProviderSignupPage = React.lazy(() => import("./pages/ProviderSignupPage"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-warm-white">
    <div className="w-8 h-8 border-3 border-sage/30 border-t-sage rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

function PageViewTracker() {
  usePageView();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-charcoal focus:rounded-lg focus:shadow-lg focus:font-body focus:text-sm"
          >
            Skip to main content
          </a>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/advisor" element={<AdvisorPage />} />
              <Route path="/city/:slug" element={<CityPage />} />
              <Route path="/market" element={<MarketDataPage />} />
              <Route path="/guides" element={<GuidesIndexPage />} />
              <Route path="/guides/start-here" element={<StartHereGuidePage />} />
              <Route path="/guides/dira-behanacha" element={<DiraGuidePage />} />
              <Route path="/guides/mortgages" element={<MortgageGuidePage />} />
              <Route path="/guides/purchase-tax" element={<PurchaseTaxGuidePage />} />
              <Route path="/guides/pinui-binui" element={<PinuiBinuiGuidePage />} />
              <Route path="/guides/renting" element={<RentingGuidePage />} />
              <Route path="/guides/arnona" element={<ArnonaGuidePage />} />
              <Route path="/guides/exchange-rates" element={<ExchangeRateGuidePage />} />
              <Route path="/tools/mortgage-calculator" element={<MortgageCalculatorPage />} />
              <Route path="/providers" element={<ProvidersDirectoryPage />} />
              <Route path="/providers/join" element={<ProviderSignupPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
